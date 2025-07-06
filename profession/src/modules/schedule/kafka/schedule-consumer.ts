import { kafkaConsumerClient } from "@/config/kafka-consumer";
import { TOPICS } from "@/constant/topics";
import { ScheduleModel } from "../models/schedule.model";
import type { ISchedule } from "../types/schedule.type";

const scheduleConsumerClient = kafkaConsumerClient.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP_ID! + "-schedule",
});

const handleScheduleCreate = async (scheduleData: any) => {
  try {
    const newSchedule = new ScheduleModel(scheduleData);
    await newSchedule.save();
    console.log(
      "%c[SUCCESS]%c Schedule created successfully:",
      "color: green; font-weight: bold",
      "color: inherit",
      newSchedule
    );
  } catch (err) {
    console.error("Error saving schedule:", err);
  }
};

const handleScheduleUpdate = async (scheduleData: any) => {
  try {
    const updated = await ScheduleModel.findOneAndUpdate(
      { _id: scheduleData._id },
      scheduleData,
      {
        new: true,
      }
    );
    if (updated) {
      console.log(
        "%c[SUCCESS]%c Schedule updated successfully:",
        "color: green; font-weight: bold",
        "color: inherit",
        updated
      );
    } else {
      console.warn("Schedule not found for update:", scheduleData._id);
    }
  } catch (err) {
    console.error("Error updating schedule:", err);
  }
};

const handleScheduleDelete = async (scheduleData: any) => {
  try {
    const deleted = await ScheduleModel.findOneAndDelete({
      _id: scheduleData._id,
    });
    if (deleted) {
      console.log(
        "%c[SUCCESS]%c Schedule deleted successfully:",
        "color: green; font-weight: bold",
        "color: inherit",
        deleted
      );
    } else {
      console.warn("Schedule not found for delete:", scheduleData._id);
    }
  } catch (err) {
    console.error("Error deleting schedule:", err);
  }
};

export type TScheduleTopic =
  (typeof TOPICS.SCHEDULE)[keyof typeof TOPICS.SCHEDULE];

export const scheduleConsumer = async (
  topic: TScheduleTopic,
  scheduleData: ISchedule
) => {
  switch (topic) {
    case TOPICS.SCHEDULE.CREATE:
      await handleScheduleCreate(scheduleData);
      break;
    case TOPICS.SCHEDULE.UPDATE:
      await handleScheduleUpdate(scheduleData);
      break;
    case TOPICS.SCHEDULE.DELETE:
      await handleScheduleDelete(scheduleData);
      break;
    // Add more cases for other topics as needed
    default:
      console.warn(`Unhandled topic: ${topic}`);
  }
};
