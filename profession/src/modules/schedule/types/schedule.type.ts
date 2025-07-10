import { Document } from "mongoose";

export interface ISchedule extends Document {
  date: Date;
  start_time: string;
  end_time: string;
  schedule_type: "dedicated" | "class_schedule" | "open_for_slot";
  services: string[];
  created_at: Date;
  updated_at: Date;
}
