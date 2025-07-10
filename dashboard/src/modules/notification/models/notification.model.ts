import { model, Schema, Document } from "mongoose";
import {
  sendNotificationCreated,
  sendNotificationUpdated,
  sendNotificationDeleted,
} from "../kafka/notification-producer";

export interface INotification extends Document {
  title: string;
  message: string;
  date: Date;
  created_at: Date;
  updated_at: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, required: true }, // The notification date
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Post-save hook for sending notification-created event to Kafka
notificationSchema.post("save", async (doc) => {
  console.log(`Notification created: ${doc.title}`);
  await sendNotificationCreated(doc); // Send created notification to Kafka
});

// Post-update hook for sending notification-updated event to Kafka
notificationSchema.post("findOneAndUpdate", async (doc) => {
  console.log(`Notification updated: ${doc.title}`);
  await sendNotificationUpdated(doc); // Send updated notification to Kafka
});

// Post-delete hook for sending notification-deleted event to Kafka
notificationSchema.post("findOneAndDelete", async (doc) => {
  console.log(`Notification deleted: ${doc.title}`);
  await sendNotificationDeleted(doc); // Send deleted notification to Kafka
});

export const NotificationModel = model<INotification>(
  "Notification",
  notificationSchema
);
