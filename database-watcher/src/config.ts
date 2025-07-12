import dotenv from "dotenv";
import { WatcherConfig } from "./types";

dotenv.config();

const requiredEnvVars = ["MONGODB_URI", "KAFKA_BROKERS"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}

export const config: WatcherConfig = {
  mongoUri: process.env.MONGODB_URI!,
  kafkaBrokers: process.env
    .KAFKA_BROKERS!.split(",")
    .map((broker) => broker.trim()),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "database-watcher",
  topic: process.env.KAFKA_DB_CHANGES_TOPIC || "database.changes",
  watchCollections: process.env.WATCH_COLLECTIONS
    ? process.env.WATCH_COLLECTIONS.split(",")
        .map((col) => col.trim())
        .filter((col) => col.length > 0)
    : undefined,
  excludeCollections: process.env.EXCLUDE_COLLECTIONS
    ? process.env.EXCLUDE_COLLECTIONS.split(",")
        .map((col) => col.trim())
        .filter((col) => col.length > 0)
    : [],
  logLevel: (process.env.LOG_LEVEL as any) || "info",
  batchSize: parseInt(process.env.BATCH_SIZE || "100"),
  reconnectDelay: parseInt(process.env.RECONNECT_DELAY || "5000"),
  maxReconnectAttempts: parseInt(process.env.MAX_RECONNECT_ATTEMPTS || "10"),
};

// Validate topics configuration
if (!config.topic) {
  throw new Error(
    "KAFKA_DB_CHANGES_TOPIC must be configured for database change events"
  );
}
