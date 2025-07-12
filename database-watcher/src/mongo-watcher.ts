import { MongoClient, Db, ChangeStream } from "mongodb";
import { DatabaseChangeEvent } from "./types";
import { Logger } from "./logger";

export class MongoWatcher {
  private readonly client: MongoClient;
  private db?: Db;
  private readonly logger: Logger;
  private changeStream: ChangeStream | null = null;
  private isConnected: boolean = false;
  private readonly watchCollections?: string[];
  private readonly excludeCollections: string[];

  constructor(
    mongoUri: string,
    logger: Logger,
    watchCollections?: string[],
    excludeCollections: string[] = []
  ) {
    this.logger = logger;
    this.client = new MongoClient(mongoUri);
    this.watchCollections = watchCollections;
    this.excludeCollections = excludeCollections;
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db();
      this.isConnected = true;
      this.logger.info(
        `Connected to MongoDB database: ${this.db.databaseName}`
      );
    } catch (error) {
      this.logger.error("Failed to connect to MongoDB", { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.changeStream) {
        await this.changeStream.close();
        this.changeStream = null;
      }
      await this.client.close();
      this.isConnected = false;
      this.logger.info("Disconnected from MongoDB");
    } catch (error) {
      this.logger.error("Failed to disconnect from MongoDB", { error });
      throw error;
    }
  }

  async startWatching(
    onChangeCallback: (event: DatabaseChangeEvent) => Promise<void>
  ): Promise<void> {
    if (!this.isConnected) {
      throw new Error("MongoDB client is not connected");
    }

    try {
      // Build pipeline for filtering collections
      const pipeline: any[] = [];

      // Filter by operation types we care about
      pipeline.push({
        $match: {
          operationType: { $in: ["insert", "update", "delete", "replace"] },
        },
      });

      // Filter collections if specified
      if (this.watchCollections && this.watchCollections.length > 0) {
        pipeline.push({
          $match: {
            "ns.coll": { $in: this.watchCollections },
          },
        });
      }

      // Exclude collections if specified
      if (this.excludeCollections.length > 0) {
        pipeline.push({
          $match: {
            "ns.coll": { $nin: this.excludeCollections },
          },
        });
      }

      // Watch the entire database
      if (!this.db) {
        throw new Error("Database is not initialized");
      }
      this.changeStream = this.db.watch(pipeline, {
        fullDocument: "updateLookup",
        maxAwaitTimeMS: 1000,
      });

      this.logger.info("Started watching database for changes", {
        watchCollections: this.watchCollections,
        excludeCollections: this.excludeCollections,
      });

      this.changeStream.on("change", async (event: DatabaseChangeEvent) => {
        try {
          this.logger.debug("Change detected", {
            operationType: event.operationType,
            collection: event.ns.coll,
            documentId: event.documentKey?._id,
          });

          await onChangeCallback(event);
        } catch (error) {
          this.logger.error("Error processing change event", { error, event });
        }
      });

      this.changeStream.on("error", (error) => {
        this.logger.error("Change stream error", { error });
      });

      this.changeStream.on("close", () => {
        this.logger.warn("Change stream closed");
      });

      this.changeStream.on("end", () => {
        this.logger.warn("Change stream ended");
      });
    } catch (error) {
      this.logger.error("Failed to start watching database", { error });
      throw error;
    }
  }

  async stopWatching(): Promise<void> {
    if (this.changeStream) {
      await this.changeStream.close();
      this.changeStream = null;
      this.logger.info("Stopped watching database");
    }
  }

  isHealthy(): boolean {
    return this.isConnected && this.changeStream !== null;
  }

  getDatabaseName(): string {
    return this.db?.databaseName || "unknown";
  }
}
