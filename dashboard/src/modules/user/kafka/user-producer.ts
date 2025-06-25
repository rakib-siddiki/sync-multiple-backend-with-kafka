import type { IUser } from "../types/user.type";
import { TOPICS } from "@/constant/topics";
import { producerClient } from "@/config/kafka-producer";

type KafkaTopic = (typeof TOPICS.USER)[keyof typeof TOPICS.USER];

export const sendMessage = async (user: IUser, topic: KafkaTopic) => {
  try {
    await producerClient.connect();
    await producerClient.send({
      topic,
      messages: [
        {
          key: user._id.toString(),
          value: JSON.stringify(user),
        },
      ],
    });
  } catch (error) {
    console.error("Error sending Kafka message:", error);
    throw error; // Re-throw to handle in the service layer
  } finally {
    await producerClient.disconnect();
  }
};

export const sendUserCreated = (user: IUser) =>
  sendMessage(user, TOPICS.USER.CREATE);

export const sendUserUpdated = (user: IUser) =>
  sendMessage(user, TOPICS.USER.UPDATE);

export const sendUserDeleted = (user: IUser) =>
  sendMessage(user, TOPICS.USER.DELETE);
