import { TOPICS } from "@/constant/topics";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";

import { PractitionerModel } from "../models/practitioner.model";
import type { IPractitioner } from "../types/practitioner.type";
import mongoose from "mongoose";

const handlePracCreate = async (pracData: IPractitioner) => {
  console.log("🚀 ~ pracData:", pracData)
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await PractitionerModel.create([pracData], { session });
    if (pracData.user) {
      // Create or update the FindProfessionModel entry for the practitioner
    const updatedFindProfession = await FindProfessionModel.findOneAndUpdate(
        {
          _id: pracData.user,
        },
        {
          practitioner_name: pracData.full_name,
        },
        {
          new: true,
          runValidators: true,
          session,
        }
      );
      console.log("FindProfessionModel updated:", updatedFindProfession);
    }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error("Error handling practitioner creation:", error);
  } finally {
    session.endSession();
  }
};

const handlePracUpdate = async (pracData: IPractitioner) => {
  console.log("🚀 ~ pracData:", pracData);
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updatedPrac = await PractitionerModel.findOneAndUpdate(
      { _id: pracData._id },
      pracData,
      {
        new: true,
        runValidators: true,
        session,
      }
    );
    if (updatedPrac) {
      // Create or update the FindProfessionModel entry for the practitioner
      await FindProfessionModel.findOneAndUpdate(
        {
          practitioner: updatedPrac._id,
        },
        {
          practitioner_name: pracData.full_name,
        },
        {
          new: true,
          runValidators: true,
          session,
        }
      );
    }

    await session.commitTransaction();
    console.log(`Practitioner with ID ${pracData._id} updated successfully.`);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error handling practitioner creation:", error);
  } finally {
    session.endSession();
  }
};

const handlePracDelete = async (pracData: IPractitioner) => {
  console.log("🚀 ~ pracData:", pracData);
  try {
    await PractitionerModel.findOneAndDelete({ _id: pracData._id });
  } catch (error) {
    console.error("Error handling practitioner deletion:", error);
  }
};

export type TPracTopic = (typeof TOPICS.PRAC)[keyof typeof TOPICS.PRAC];

export const pracConsumer = async (
  topic: TPracTopic,
  pracData: IPractitioner
) => {
  console.log("🚀 ~ pracData:", pracData)
  console.log("🚀 ~ topic:", topic)
  switch (topic) {
    case TOPICS.PRAC.CREATE:
      await handlePracCreate(pracData);
      break;
    case TOPICS.PRAC.UPDATE:
      await handlePracUpdate(pracData);
      break;
    case TOPICS.PRAC.DELETE:
      await handlePracDelete(pracData);
      break;
    default:
      console.warn(`Unhandled topic: ${topic}`);
  }
};
