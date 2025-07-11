import { TOPICS } from "@/constant/topics";
import { sendKafkaMessage } from "@/handlers/send-message.handler";

import type { ObjectId } from "mongodb";
import type { IPractitionerInfo } from "../types/practitioner-info.type";

export const sendPractitionerInfoCreated = (practitionerInfo: IPractitionerInfo) =>
  sendKafkaMessage(
    TOPICS.PRAC_INFO.CREATE,
    practitionerInfo,
    practitionerInfo._id.toString()
  );

export const sendPractitionerInfoUpdated = (
  practitionerInfo: IPractitionerInfo
) =>
  sendKafkaMessage(
    TOPICS.PRAC_INFO.UPDATE,
    practitionerInfo,
    practitionerInfo._id.toString()
  );

export const sendPractitionerInfoDeleted = (_id: ObjectId) =>
  sendKafkaMessage(TOPICS.PRAC_INFO.DELETE, { _id }, _id.toString());
