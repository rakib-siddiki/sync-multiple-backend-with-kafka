import { Document, model, Schema } from "mongoose";

export interface ISchedule extends Document {
  date: Date;
  startTime: string;
  endTime: string;
  scheduleType: "dedicated" | "class_schedule" | "open_for_slot";
  services: string[];
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    scheduleType: { type: String, required: true },
    services: { type: [String], required: true },
  },
  {
    timestamps: true,
  }
);

export const ScheduleModel = model<ISchedule>("Schedule", scheduleSchema);
