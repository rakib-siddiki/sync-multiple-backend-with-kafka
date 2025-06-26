import { Router } from 'express';
import * as notificationController from '../controllers/notification.contoller'

const router = Router();

// Create a new Notification
router.post('/', notificationController.createNotification);

// Get all Notification
router.get("/", notificationController.getAllNotifications);

// Get a single Notification by ID
router.get("/:id", notificationController.getNotification);

// Update a Notification
router.patch("/:id", notificationController.updateNotification);

// Delete a Notification
router.delete("/:id", notificationController.deleteNotification);

export const notificationRoutes = router;
