import { NotificationModel } from "../models/notification.model"; // Adjust path as needed
import {
  CreateNotificationInput,
  UpdateNotificationInput,
} from "../validators/notification.validator"; // Adjust path as needed

// Create a new notification
export const createNotification = async (input: CreateNotificationInput) => {
  const notification = await NotificationModel.create(input);
  return notification;
};

// Get a notification by its ID
export const getNotificationById = async (id: string) => {
  return await NotificationModel.findById(id);
};

// Get all notifications, sorted by the created date (newest first)
export const getAllNotifications = async () => {
  return await NotificationModel.find().sort({ createdAt: -1 });
};

// Update a notification by its ID
export const updateNotification = async (
  id: string,
  input: UpdateNotificationInput
) => {
  return await NotificationModel.findOneAndUpdate(
    { _id: id },
    { $set: input },
    { new: true, runValidators: true }
  );
};

// Delete a notification by its ID
export const deleteNotification = async (id: string) => {
  const result = await NotificationModel.findOneAndDelete({ _id: id });
  return !!result; // Return true if the notification was deleted, otherwise false
};
