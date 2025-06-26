import { Document } from "mongoose";

export interface ISchedule extends Document {
  date: Date;
  startTime: string;
  endTime: string;
  scheduleType: "dedicated" | "class_schedule" | "open_for_slot";
  services: string[];
  createdAt: Date;
  updatedAt: Date;
}
