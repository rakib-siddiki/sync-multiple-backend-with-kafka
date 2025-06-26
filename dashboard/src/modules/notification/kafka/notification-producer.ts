import { producerClient } from "@/config/kafka-producer"; // Adjust import path
import type { INotification } from "../models/notification.model"; // Adjust the import to point to your Notification model
import { TOPICS } from "@/constant/topics"; // Adjust import path for your topics constant

type TNotificationTopic =
  (typeof TOPICS.NOTIFICATION)[keyof typeof TOPICS.NOTIFICATION];

// Helper function to send a notification message to Kafka
export const sendMessage = async (
  notification: INotification,
  topic: TNotificationTopic
) => {
  try {
    await producerClient.connect(); // Ensure the producer is connected to Kafka
    await producerClient.send({
      topic,
      messages: [
        {
          key: notification._id.toString(), // Use the notification ID as the key
          value: JSON.stringify(notification), // Stringify the notification object
        },
      ],
    });
    console.log(`Notification sent to topic: ${topic}`);
  } catch (error) {
    console.error("Error sending notification message:", error);
  }
};

// Send notification created event to Kafka
export const sendNotificationCreated = (notification: INotification) =>
  sendMessage(notification, TOPICS.NOTIFICATION.CREATE);

// Send notification updated event to Kafka
export const sendNotificationUpdated = (notification: INotification) =>
  sendMessage(notification, TOPICS.NOTIFICATION.UPDATE);

// Send notification deleted event to Kafka
export const sendNotificationDeleted = (notification: INotification) =>
  sendMessage(notification, TOPICS.NOTIFICATION.DELETE);
