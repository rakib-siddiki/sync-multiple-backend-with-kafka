import { sendKafkaMessage } from "@/handlers/send-message.handler";
import type { IUser } from "../types/user.type";
import { TOPICS } from "@/constant/topics";

export const sendUserCreated = (user: IUser) =>
  sendKafkaMessage(TOPICS.USER.CREATE, user, user._id.toString());

export const sendUserUpdated = (user: IUser) =>
  sendKafkaMessage(TOPICS.USER.UPDATE, user, user._id.toString());

export const sendUserDeleted = (user: IUser) =>
  sendKafkaMessage(TOPICS.USER.DELETE, user, user._id.toString());
