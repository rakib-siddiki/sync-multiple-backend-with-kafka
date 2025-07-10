import { TOPICS } from "@/constant/topics";
import type { IBranch } from "../types/branch.type";
import { sendKafkaMessage } from "@/handlers/send-message.handler";

export const sendBranchCreated = (branch: IBranch) =>
  sendKafkaMessage(TOPICS.BRANCH.CREATE, branch, branch._id.toString());

export const sendBranchUpdated = (branch: IBranch) =>
  sendKafkaMessage(TOPICS.BRANCH.UPDATE, branch, branch._id.toString());

export const sendBranchDeleted = (branch: IBranch) =>
  sendKafkaMessage(TOPICS.BRANCH.DELETE, branch, branch._id.toString());
