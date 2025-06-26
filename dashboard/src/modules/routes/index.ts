import { Router, type Request, type Response } from "express";
import { userRoutes } from "../user/routes/user.route";
import { branchRoutes } from "../branch/routes/branch.route";
import {notificationRoutes} from "../notification/routes/notification.route"

const router = Router();

const moduleRoutes = [
  {
    path: "/health",
    module: router.get("/", healthCheck),
  },
  {
    path: "/users",
    module: userRoutes,
  },
  {
    path: "/branches",
    module: branchRoutes,
  },
  {
    path: "/notifications",
    module: notificationRoutes,
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
