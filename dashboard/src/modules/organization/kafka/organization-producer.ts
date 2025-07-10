import { TOPICS } from "@/constant/topics";
import { sendKafkaMessage } from "@/handlers/send-message.handler";
import type { IOrganization } from "../types/organization.type";
import type { ObjectId } from "mongodb";

export const sendOrganizationCreated = (organization: IOrganization) =>
  sendKafkaMessage(
    TOPICS.ORG.CREATE,
    organization,
    organization._id.toString()
  );

export const sendOrganizationUpdated = (organization: IOrganization) =>
  sendKafkaMessage(
    TOPICS.ORG.UPDATE,
    organization,
    organization._id.toString()
  );

export const sendOrganizationDeleted = (_id: ObjectId) =>
  sendKafkaMessage(
    TOPICS.ORG.DELETE,
    { _id },
    _id.toString()
  );

