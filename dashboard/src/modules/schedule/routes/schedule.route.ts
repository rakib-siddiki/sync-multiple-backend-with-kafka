import { Router } from "express";
import * as scheduleController from "../controllers/schedule.controller";

const router = Router();

router.post("/", scheduleController.createSchedule);
router.get("/:id", scheduleController.getScheduleById);
router.get("/", scheduleController.getAllSchedules);
router.patch("/:id", scheduleController.updateSchedule);
router.delete("/:id", scheduleController.deleteSchedule);

export const scheduleRoutes = router;
