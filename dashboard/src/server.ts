import { connectDB } from "@/helpers/db-connect";
import globalRouter from "@modules/routes";
import express from "express";

const app = express();
app.use(express.json());

// Middleware to add request logging
app.use((req, _, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Global routes
app.use("/api/v1", globalRouter);

connectDB().then(() => {
  const port = process.env.PORT ?? 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

export default app;
