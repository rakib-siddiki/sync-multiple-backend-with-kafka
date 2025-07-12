import { config } from "./config";
import { DatabaseWatcherService } from "./database-watcher";
import { Logger } from "./logger";

// Create a main logger for the index file
const mainLogger = new Logger(config.logLevel);

async function main() {
  // Display startup banner
  mainLogger.banner("DATABASE WATCHER STARTING");

  mainLogger.info("🔍 Starting Database Watcher...");

  // Display configuration in a nice table format
  mainLogger.table("Configuration", {
    "MongoDB URI": config.mongoUri.replace(/\/\/.*@/, "//***:***@"), // Hide credentials
    "Kafka Brokers": config.kafkaBrokers.join(", "),
    "Client ID": config.kafkaClientId,
    "Watch Collections": config.watchCollections?.join(", ") || "ALL",
    "Exclude Collections": config.excludeCollections?.join(", ") || "NONE",
    "Log Level": config.logLevel.toUpperCase(),
    "Batch Size": config.batchSize,
  });

  const watcher = new DatabaseWatcherService(config);

  try {
    await watcher.start();

    mainLogger.success("Database Watcher is running. Press Ctrl+C to stop.");
    mainLogger.separator();

    // Optional: Set up health check endpoint or status logging
    setInterval(() => {
      const status = watcher.getStatus();
      mainLogger.table("Health Status", {
        "Service Status": status.isRunning ? "🟢 RUNNING" : "🔴 STOPPED",
        MongoDB: status.mongoConnected ? "🟢 CONNECTED" : "🔴 DISCONNECTED",
        Kafka: status.kafkaConnected ? "🟢 CONNECTED" : "� DISCONNECTED",
        Database: status.database,
        "Buffer Size": status.bufferSize,
        "Reconnect Attempts": status.reconnectAttempts,
      });
      mainLogger.separator();
    }, 30000); // Log status every 30 seconds
  } catch (error) {
    mainLogger.error("❌ Failed to start Database Watcher", { error });
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Start the application
main().catch((error) => {
  console.error("❌ Application failed to start:", error);
  process.exit(1);
});
