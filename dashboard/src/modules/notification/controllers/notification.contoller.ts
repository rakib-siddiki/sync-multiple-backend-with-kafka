import { Request, Response, NextFunction } from "express";
import * as notificationService from "../services/notification.service"; // Adjust path if necessary
import {
  createNotificationSchema,
  updateNotificationSchema,
  notificationIdSchema,
} from "../validators/notification.validator"; // Adjust path if necessary

// Create a new notification
export const createNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = createNotificationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const notification = await notificationService.createNotification(
      parsed.data
    );
    res.status(201).json({ data: notification });
  } catch (err) {
    next(err);
  }
};

// Get a notification by ID
export const getNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const parsed = notificationIdSchema.safeParse({ id });

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const notification = await notificationService.getNotificationById(
      parsed.data.id
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ data: notification });
  } catch (err) {
    next(err);
  }
};

// Get all notifications
export const getAllNotifications = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await notificationService.getAllNotifications();
    res.json({ data: notifications });
  } catch (err) {
    next(err);
  }
};

// Update an existing notification
export const updateNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const idParsed = notificationIdSchema.safeParse({ id });
    if (!idParsed.success) {
      return res.status(400).json({ error: idParsed.error.errors });
    }

    const bodyParsed = updateNotificationSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ error: bodyParsed.error.errors });
    }

    const notification = await notificationService.updateNotification(
      id,
      bodyParsed.data
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ data: notification });
  } catch (err) {
    next(err);
  }
};

// Delete a notification by ID
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const parsed = notificationIdSchema.safeParse({ id });

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const deleted = await notificationService.deleteNotification(
      parsed.data.id
    );

    if (!deleted) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
