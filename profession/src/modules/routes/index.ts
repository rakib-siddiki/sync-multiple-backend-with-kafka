import { Router, type Request, type Response } from "express";


const router = Router();

const moduleRoutes = [
  {
    path: "/health",
    module: router.get("/", healthCheck),
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.module);
});

export default router;

function healthCheck(_req: Request, res: Response) {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? "development",
  });
}
