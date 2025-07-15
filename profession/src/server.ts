import express from "express";
import { connectDB } from "@/helpers/db-connect";
import globalRouter from "@modules/routes";
import { mainConsumer } from "./config/main-consumer";
import { errorMiddleware } from "./middlewares/error.middleware";
import { logger } from "./utils/logger";

const app = express();
app.use(express.json());

// Middleware to add request logging
app.use((req, _, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

mainConsumer().catch(console.error);

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
