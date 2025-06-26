import { NextFunction, Request, Response } from "express";
import * as scheduleService from "../services/schedule.service";
import {
  createScheduleSchema,
  scheduleIdSchema,
  updateScheduleSchema,
} from "../validators/schedule.validator";

export const createSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = createScheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    const schedule = await scheduleService.createSchedule(parsed.data);
    res.status(201).json({ data: schedule });
  } catch (err) {
    next(err);
  }
};

export const getScheduleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const parsed = scheduleIdSchema.safeParse({ id });

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const schedule = await scheduleService.getScheduleById(parsed.data.id);

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ data: schedule });
  } catch (err) {
    next(err);
  }
};

export const getAllSchedules = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schedules = await scheduleService.getAllSchedules();
    res.json({ data: schedules });
  } catch (err) {
    next(err);
  }
};

export const updateSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const idParsed = scheduleIdSchema.safeParse({ id });
    if (!idParsed.success) {
      return res.status(400).json({ error: idParsed.error.errors });
    }

    const bodyParsed = updateScheduleSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ error: bodyParsed.error.errors });
    }

    const schedule = await scheduleService.updateSchedule(id, bodyParsed.data);

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ data: schedule });
  } catch (err) {
    next(err);
  }
};

export const deleteSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const parsed = scheduleIdSchema.safeParse({ id });

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const deleted = await scheduleService.deleteSchedule(parsed.data.id);

    if (!deleted) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
