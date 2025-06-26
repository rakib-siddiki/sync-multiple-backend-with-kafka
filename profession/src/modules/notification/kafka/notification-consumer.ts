import { TOPICS } from "@/constant/topics"; // Adjust import path for topics
import { NotificationModel } from "../models/notification.model"; // Adjust import path for Notification model
import { kafkaConsumerClient } from "@/config/kafka-consumer"; // Ensure proper path for Kafka consumer client

const notificationConsumerClient = kafkaConsumerClient.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP_ID! + "-notification", // Unique group ID for notification consumer
});

// Handle notification creation
const handleNotificationCreate = async (notificationData: any) => {
  try {
    const newNotification = new NotificationModel(notificationData);
    await newNotification.save();
    console.log(
      "%c[SUCCESS]%c Notification created successfully:",
      "color: green; font-weight: bold",
      "color: inherit",
      newNotification
    );
  } catch (err) {
    console.error("Error saving notification:", err);
  }
};

// Handle notification update
const handleNotificationUpdate = async (notificationData: any) => {
  try {
    const updated = await NotificationModel.findOneAndUpdate(
      { _id: notificationData._id },
      notificationData,
      { new: true }
    );
    if (updated) {
      console.log(
        "%c[SUCCESS]%c Notification updated successfully:",
        "color: green; font-weight: bold",
        "color: inherit",
        updated
      );
    } else {
      console.warn("Notification not found for update:", notificationData._id);
    }
  } catch (err) {
    console.error("Error updating notification:", err);
  }
};

// Handle notification deletion
const handleNotificationDelete = async (notificationData: any) => {
  try {
    const deleted = await NotificationModel.findOneAndDelete({
      _id: notificationData._id,
    });
    if (deleted) {
      console.log(
        "%c[SUCCESS]%c Notification deleted successfully:",
        "color: green; font-weight: bold",
        "color: inherit",
        deleted
      );
    } else {
      console.warn("Notification not found for delete:", notificationData._id);
    }
  } catch (err) {
    console.error("Error deleting notification:", err);
  }
};

// Main function to consume notifications from Kafka topics
export const notificationConsumer = async () => {
  try {
    await notificationConsumerClient.connect();
    // Subscribe to notification topics from TOPICS
    for (const topic of Object.values(TOPICS.NOTIFICATION)) {
      console.log("🚀 ~ topic:", topic);
      await notificationConsumerClient.subscribe({
        topic,
        fromBeginning: true,
      });
    }

    await notificationConsumerClient.run({
      eachMessage: async ({ topic, message }) => {
        console.log("🚀 ~ topic:", topic);
        if (!message.value) {
          return;
        }
        const notificationData = JSON.parse(message.value?.toString());
        switch (topic) {
          case TOPICS.NOTIFICATION.CREATE:
            await handleNotificationCreate(notificationData);
            break;
          case TOPICS.NOTIFICATION.UPDATE:
            await handleNotificationUpdate(notificationData);
            break;
          case TOPICS.NOTIFICATION.DELETE:
            await handleNotificationDelete(notificationData);
            break;
          // Add more cases for other notification topics if necessary
          default:
            console.warn(`Unhandled topic: ${topic}`);
        }
      },
    });
  } catch (error) {
    console.error("Error connecting to Kafka:", error);
  }
};
