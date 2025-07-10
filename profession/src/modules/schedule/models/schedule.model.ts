import { Document, model, Schema } from "mongoose";

export interface ISchedule extends Document {
  date: Date;
  start_time: string;
  end_time: string;
  schedule_type: "dedicated" | "class_schedule" | "open_for_slot";
  services: string[];
  created_at: Date;
  updated_at: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    schedule_type: { type: String, required: true },
    services: { type: [String], required: true },
  },
  {
    timestamps: true,
  }
);

export const ScheduleModel = model<ISchedule>("Schedule", scheduleSchema);
