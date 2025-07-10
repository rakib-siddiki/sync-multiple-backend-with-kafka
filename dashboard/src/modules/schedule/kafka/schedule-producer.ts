import { TOPICS } from "@/constant/topics";

import type { ISchedule } from "../types/schedule.type";
import { sendKafkaMessage } from "@/handlers/send-message.handler";

export const sendScheduleCreated = (schedule: ISchedule) =>
  sendKafkaMessage(TOPICS.SCHEDULE.CREATE, schedule, schedule._id.toString());

export const sendScheduleUpdated = (schedule: ISchedule) =>
  sendKafkaMessage(TOPICS.SCHEDULE.UPDATE, schedule, schedule._id.toString());

export const sendScheduleDeleted = (schedule: ISchedule) =>
  sendKafkaMessage(TOPICS.SCHEDULE.DELETE, schedule, schedule._id.toString());
