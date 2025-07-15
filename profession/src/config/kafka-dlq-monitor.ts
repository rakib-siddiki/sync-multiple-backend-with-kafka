import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { logger } from "@/utils/logger";
import { kafkaConsumerClient } from "./kafka-consumer";

// Default DLQ topic suffix, should match the one in kafka-dlq.ts
const DEFAULT_DLQ_SUFFIX = ".dlq";

/**
 * DLQ Consumer - Utility for monitoring and processing messages in Dead Letter Queues
 */
class DLQConsumer {
  private readonly consumer: Consumer;
  private readonly dlqSuffix: string;
  private isConnected: boolean = false;

  constructor(
    client: Kafka = kafkaConsumerClient,
    dlqSuffix: string = DEFAULT_DLQ_SUFFIX
  ) {
    this.consumer = client.consumer({
      groupId: `dlq-monitor-${Date.now()}`,
      // Start with the latest messages by default
      sessionTimeout: 30000,
    });
    this.dlqSuffix = dlqSuffix;
  }

  /**
   * Connect to the Kafka broker
   */
  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.consumer.connect();
      this.isConnected = true;
      logger.info("DLQ consumer connected");
    }
  }

  /**
   * Subscribe to a specific DLQ topic
   * @param originalTopic - Original topic name (without DLQ suffix)
   * @param fromBeginning - Whether to read from the beginning of the topic
   */
  async subscribeToDLQ(
    originalTopic: string,
    fromBeginning: boolean = true
  ): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    const dlqTopic = `${originalTopic}${this.dlqSuffix}`;
    await this.consumer.subscribe({ topic: dlqTopic, fromBeginning });
    logger.info(`Subscribed to DLQ topic: ${dlqTopic}`);
  }

  /**
   * Subscribe to all DLQ topics
   * @param fromBeginning - Whether to read from the beginning of the topics
   */
  async subscribeToAllDLQs(fromBeginning: boolean = true): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    // Use admin to list all topics
    const admin = kafkaConsumerClient.admin();
    await admin.connect();

    try {
      const topics = await admin.listTopics();
      const dlqTopics = topics.filter((topic) =>
        topic.endsWith(this.dlqSuffix)
      );

      if (dlqTopics.length === 0) {
        logger.info("No DLQ topics found");
        return;
      }

      // Subscribe to each DLQ topic
      for (const topic of dlqTopics) {
        await this.consumer.subscribe({ topic, fromBeginning });
      }

      logger.info(
        `Subscribed to ${dlqTopics.length} DLQ topics: ${dlqTopics.join(", ")}`
      );
    } finally {
      await admin.disconnect();
    }
  }

  /**
   * Start consuming messages from DLQ topics
   * @param messageHandler - Custom handler for processing DLQ messages
   */
  async run(
    messageHandler?: (message: EachMessagePayload) => Promise<void>
  ): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    await this.consumer.run({
      eachMessage: async (payload) => {
        try {
          if (messageHandler) {
            await messageHandler(payload);
          } else {
            // Default handler - log the DLQ message details
            const { topic, partition, message } = payload;
            const originalTopic = message.headers?.["original-topic"]
              ? message.headers["original-topic"].toString()
              : "unknown";

            const dlqReason = message.headers?.["dlq-reason"]
              ? message.headers["dlq-reason"].toString()
              : "unknown reason";

            const timestamp = message.headers?.["timestamp"]
              ? message.headers["timestamp"].toString()
              : new Date().toISOString();

            logger.info(`DLQ Message [${topic}] - Partition: ${partition}`, {
              originalTopic,
              reason: dlqReason,
              timestamp,
              offset: message.offset,
            });

            try {
              const parsedValue = JSON.parse(message.value?.toString() || "{}");
              logger.debug("DLQ Message details:", parsedValue);
            } catch (parseError: any) {
              logger.warn("Unable to parse DLQ message value", {
                error: parseError.message,
                rawValue: message.value?.toString(),
              });
            }
          }
        } catch (error: any) {
          logger.error(`Error processing DLQ message: ${error.message}`, error);
        }
      },
    });
  }

  /**
   * Disconnect the consumer
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.consumer.disconnect();
      this.isConnected = false;
      logger.info("DLQ consumer disconnected");
    }
  }
}

// Export a singleton instance
export const dlqConsumer = new DLQConsumer();

/**
 * Monitor all DLQ topics and log messages
 */
export async function monitorAllDLQs(): Promise<void> {
  try {
    await dlqConsumer.connect();
    await dlqConsumer.subscribeToAllDLQs();
    await dlqConsumer.run();
    logger.info("DLQ monitoring started for all DLQ topics");
  } catch (error: any) {
    logger.error(`Failed to start DLQ monitoring: ${error.message}`, error);
  }
}
