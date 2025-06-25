import express from "express";
import { connectDB } from "@/helpers/db-connect";
import globalRouter from "@modules/routes";
import { userConsumer } from "./modules/user/kafka/user-consumer";
import { branchConsumer } from "./modules/branch/kafka/branch-consumer";

const app = express();
app.use(express.json());

// Middleware to add request logging
app.use((req, _, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

userConsumer().catch(console.error);
branchConsumer().catch(console.error);

// Global routes
app.use("/api/v1", globalRouter);



connectDB().then(() => {
  const port = process.env.PORT ?? 4000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

export default app;
