import { TOPICS } from "@/constant/topics";

import { producerClient } from "@/config/kafka-producer";
import type { ISchedule } from "../types/schedule.type";

type TScheduleTopic = (typeof TOPICS.SCHEDULE)[keyof typeof TOPICS.SCHEDULE];

export const sendMessage = async (
  schedule: ISchedule,
  topic: TScheduleTopic
) => {
  try {
    console.log(`📤 Sending schedule message to topic: ${topic}`);
    console.log(`📋 Schedule data:`, {
      key: schedule._id.toString(),
      scheduleId: schedule._id,
      topic: topic,
    });

    await producerClient.connect();
    await producerClient.send({
      topic,
      messages: [
        { key: schedule._id.toString(), value: JSON.stringify(schedule) },
      ],
    });

    console.log(
      `✅ Successfully sent schedule message to topic: ${topic} with key: ${schedule._id.toString()}`
    );
  } catch (error) {
    console.error(
      `❌ Error sending schedule message to topic: ${topic}`,
      error
    );
  }
};

export const sendScheduleCreated = (schedule: ISchedule) =>
  sendMessage(schedule, TOPICS.SCHEDULE.CREATE);

export const sendScheduleUpdated = (schedule: ISchedule) =>
  sendMessage(schedule, TOPICS.SCHEDULE.UPDATE);

export const sendScheduleDeleted = (schedule: ISchedule) =>
  sendMessage(schedule, TOPICS.SCHEDULE.DELETE);
