import { TOPICS } from "@/constant/topics";
import { sendKafkaMessage } from "@/handlers/send-message.handler";

import type { ObjectId } from "mongodb";
import type { IPractitioner } from "../types/practitioner.type";

export const sendPractitionerCreated = (practitioner: IPractitioner) =>
  sendKafkaMessage(
    TOPICS.PRAC.CREATE,
    practitioner,
    practitioner._id.toString()
  );

export const sendPractitionerUpdated = (practitioner: IPractitioner) =>
  sendKafkaMessage(
    TOPICS.ORG.UPDATE,
    practitioner,
    practitioner._id.toString()
  );

export const sendPractitionerDeleted = (_id: ObjectId) =>
  sendKafkaMessage(TOPICS.ORG.DELETE, { _id }, _id.toString());
