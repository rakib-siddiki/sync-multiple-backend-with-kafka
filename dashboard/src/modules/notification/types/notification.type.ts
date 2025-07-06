// types/notification.ts
import { Document } from "mongoose";

export interface INotification extends Document{
  title: string; // The title of the notification
  message: string; // The body/content of the notification
  date: Date; // The date of the notification
  createdAt?: Date; // Optional created date
  updatedAt?: Date;
}
