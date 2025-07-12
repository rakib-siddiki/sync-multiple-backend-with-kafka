import { DatabaseChangeEvent, KafkaMessage, WatcherConfig } from "./types";
import { Logger } from "./logger";
import { MongoWatcher } from "./mongo-watcher";
import { KafkaProducer } from "./kafka-producer";

export class DatabaseWatcherService {
  private readonly logger: Logger;
  private readonly mongoWatcher: MongoWatcher;
  private readonly kafkaProducer: KafkaProducer;
  private readonly config: WatcherConfig;
  private isRunning: boolean = false;
  private messageBuffer: KafkaMessage[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;

  constructor(config: WatcherConfig) {
    this.config = config;
    this.logger = new Logger(config.logLevel);

    this.mongoWatcher = new MongoWatcher(
      config.mongoUri,
      this.logger,
      config.watchCollections,
      config.excludeCollections
    );

    this.kafkaProducer = new KafkaProducer(
      config.kafkaBrokers,
      config.kafkaClientId,
      this.logger
    );
  }

  async start(): Promise<void> {
    try {
      this.logger.info("Starting Database Watcher Service...");

      // Connect to MongoDB
      await this.mongoWatcher.connect();

      // Connect to Kafka
      await this.kafkaProducer.connect();

      // Start watching for changes
      await this.mongoWatcher.startWatching(
        this.handleDatabaseChange.bind(this)
      );

      // Start message buffer flush timer
      this.startFlushTimer();

      this.isRunning = true;
      this.reconnectAttempts = 0;

      this.logger.info("Database Watcher Service started successfully", {
        database: this.mongoWatcher.getDatabaseName(),
        kafkaBrokers: this.config.kafkaBrokers,
        topic: this.config.topic,
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      this.logger.error("Failed to start Database Watcher Service", { error });
      await this.stop();
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      this.logger.info("Stopping Database Watcher Service...");
      this.isRunning = false;

      // Stop flush timer
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
        this.flushTimer = null;
      }

      // Flush remaining messages
      await this.flushMessageBuffer();

      // Stop watching
      await this.mongoWatcher.stopWatching();

      // Disconnect from services
      await Promise.all([
        this.mongoWatcher.disconnect(),
        this.kafkaProducer.disconnect(),
      ]);

      this.logger.info("Database Watcher Service stopped");
    } catch (error) {
      this.logger.error("Error stopping Database Watcher Service", { error });
      throw error;
    }
  }

  private async handleDatabaseChange(
    event: DatabaseChangeEvent
  ): Promise<void> {
    try {
      const message = this.createKafkaMessage(event);
      if (message) {
        this.messageBuffer.push(message);

        // Flush immediately if buffer is full
        if (this.messageBuffer.length >= this.config.batchSize) {
          await this.flushMessageBuffer();
        }
      }
    } catch (error) {
      this.logger.error("Error handling database change", { error, event });
    }
  }

  private createKafkaMessage(event: DatabaseChangeEvent): KafkaMessage | null {
    const { operationType, ns, documentKey, fullDocument, updateDescription } =
      event;

    // Use the single topic for all operations
    const topic = this.config.topic;

    if (!topic) {
      this.logger.warn(`No topic configured for database changes`);
      return null;
    }

    // Create message payload
    const payload = {
      operationType,
      database: ns.db,
      collection: ns.coll,
      documentKey,
      timestamp: new Date().toISOString(),
      ...(fullDocument && { fullDocument }),
      ...(updateDescription && { updateDescription }),
    };

    this.logger.info(`Creating message for operation: ${operationType}`, {
      topic,
      documentKey,
      payload,
    });

    return {
      topic,
      key: `${ns.db}.${ns.coll}.${documentKey?._id}`,
      value: JSON.stringify(payload),
      timestamp: Date.now().toString(),
      headers: {
        "content-type": "application/json",
        operation: operationType,
        database: ns.db,
        collection: ns.coll,
      },
    };
  }

  private async flushMessageBuffer(): Promise<void> {
    if (this.messageBuffer.length === 0) {
      return;
    }

    const messages = [...this.messageBuffer];
    this.messageBuffer = [];

    try {
      await this.kafkaProducer.sendBatch(messages);
      this.logger.debug(`Flushed ${messages.length} messages to Kafka`);
    } catch (error) {
      this.logger.error("Failed to flush message buffer", {
        error,
        messageCount: messages.length,
      });
      // Put messages back in buffer for retry
      this.messageBuffer.unshift(...messages);
      throw error;
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(async () => {
      try {
        await this.flushMessageBuffer();
      } catch (error) {
        this.logger.error("Error in flush timer", { error });
      }
    }, 5000); // Flush every 5 seconds
  }

  private setupGracefulShutdown(): void {
    const shutdownHandler = async (signal: string) => {
      this.logger.info(`Received ${signal}, shutting down gracefully...`);
      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        this.logger.error("Error during graceful shutdown", { error });
        process.exit(1);
      }
    };

    process.on("SIGINT", () => shutdownHandler("SIGINT"));
    process.on("SIGTERM", () => shutdownHandler("SIGTERM"));
    process.on("uncaughtException", (error) => {
      this.logger.error("Uncaught exception", { error });
      shutdownHandler("uncaughtException");
    });
    process.on("unhandledRejection", (reason) => {
      this.logger.error("Unhandled rejection", { reason });
      shutdownHandler("unhandledRejection");
    });
  }

  // Health check methods
  isHealthy(): boolean {
    return (
      this.isRunning &&
      this.mongoWatcher.isHealthy() &&
      this.kafkaProducer.isHealthy()
    );
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      mongoConnected: this.mongoWatcher.isHealthy(),
      kafkaConnected: this.kafkaProducer.isHealthy(),
      bufferSize: this.messageBuffer.length,
      reconnectAttempts: this.reconnectAttempts,
      database: this.mongoWatcher.getDatabaseName(),
    };
  }
}
