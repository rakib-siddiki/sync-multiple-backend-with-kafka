import express from "express";
import { connectDB } from "@/helpers/db-connect";
import globalRouter from "@modules/routes";
import { mainConsumer } from "./config/main-consumer";
import { errorMiddleware } from "./middlewares/error.middleware";
import { logger } from "./utils/logger";
import { kafkaDLQ } from "./config/kafka-dlq";
import { monitorAllDLQs } from "./config/kafka-dlq-monitor";

const app = express();
app.use(express.json());

// Middleware to add request logging
app.use((req, _, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize Kafka DLQ system
kafkaDLQ.initialize().catch((err) => {
  logger.error("Failed to initialize Kafka DLQ system:", err);
});

// Start the main Kafka consumer
mainConsumer().catch((err) => {
  logger.error("Error in main consumer:", err);
});

// Start DLQ monitoring in development environment
if (process.env.NODE_ENV === "development") {
  monitorAllDLQs().catch((err) => {
    logger.error("Failed to start DLQ monitoring:", err);
  });
}

// Global routes
app.use("/api/v1", globalRouter);

app.use(errorMiddleware);

connectDB().then(() => {
  const port = process.env.PORT ?? 4000;
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
});

export default app;
