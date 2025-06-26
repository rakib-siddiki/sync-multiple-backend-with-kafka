import { producerClient } from "@/config/kafka-producer";
import { TOPICS } from "@/constant/topics";
import type { IBranch } from "../types/branch.type";

type TBranchTopic = (typeof TOPICS.BRANCH)[keyof typeof TOPICS.BRANCH];

export const sendMessage = async (branch: IBranch, topic: TBranchTopic) => {
  try {
    await producerClient.connect();
    await producerClient.send({
      topic,
      messages: [
        {
          key: branch._id.toString(),
          value: JSON.stringify(branch),
        },
      ],
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendBranchCreated = (branch: IBranch) =>
  sendMessage(branch, TOPICS.BRANCH.CREATE);

export const sendBranchUpdated = (branch: IBranch) =>
  sendMessage(branch, TOPICS.BRANCH.UPDATE);

export const sendBranchDeleted = (branch: IBranch) =>
  sendMessage(branch, TOPICS.BRANCH.DELETE);
