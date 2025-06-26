// models/notification.model.ts
import mongoose, { Schema } from "mongoose";
import { INotification } from "../types/notification.type"; 

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

export { NotificationModel };
