import { Router, type Request, type Response } from "express";
import { branchRoutes } from "../branch/routes/branch.route";
import { scheduleRoutes } from "../schedule/routes/schedule.route";
import { userRoutes } from "../user/routes/user.route";
import { notificationRoutes } from "../notification/routes/notification.route";
import { practitionerRoute } from "../practitioner/routes/practitioner.route";
import { organizationRoutes } from "../organization/routes/organization.route";


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
    path: "/schedules",
    module: scheduleRoutes,
  },
  {
    path: "/notifications",
    module: notificationRoutes,
  },
  {
    path: "/practitioners",
    module: practitionerRoute,
  },
  {
    path: "/organizations",
    module: organizationRoutes,
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
