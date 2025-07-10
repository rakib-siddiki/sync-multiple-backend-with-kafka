import { model, Schema } from "mongoose";
import {
  sendScheduleCreated,
  sendScheduleDeleted,
  sendScheduleUpdated,
} from "../kafka/schedule-producer";
import type { ISchedule } from "../types/schedule.type";

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

scheduleSchema.post("save", async (doc) => {
  console.log(`Schedule created: ${doc._id}`);
  await sendScheduleCreated(doc);
});

scheduleSchema.post("findOneAndUpdate", async (doc) => {
  console.log(`Schedule updated: ${doc._id}`);
  await sendScheduleUpdated(doc);
});

scheduleSchema.post("findOneAndDelete", async (doc) => {
  console.log(`Schedule deleted: ${doc._id}`);
  await sendScheduleDeleted(doc);
});

export const ScheduleModel = model<ISchedule>("Schedule", scheduleSchema);
