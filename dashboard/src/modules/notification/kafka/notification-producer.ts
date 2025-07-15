import { sendKafkaMessage } from "@/handlers/send-message.handler";
import type { INotification } from "../models/notification.model"; // Adjust the import to point to your Notification model
import { TOPICS } from "@/constant/topics"; // Adjust import path for your topics constant

// Send notification created event to Kafka
export const sendNotificationCreated = (notification: INotification) =>
  sendKafkaMessage(
    TOPICS.NOTIFICATION.CREATE,
    notification,
    notification._id.toString()
  );

// Send notification updated event to Kafka
export const sendNotificationUpdated = (notification: INotification) =>
  sendKafkaMessage(
    TOPICS.NOTIFICATION.UPDATE,
    notification,
    notification._id.toString()
  );

// Send notification deleted event to Kafka
export const sendNotificationDeleted = (notification: INotification) =>
  sendKafkaMessage(
    TOPICS.NOTIFICATION.DELETE,
    notification,
    notification._id.toString()
  );
