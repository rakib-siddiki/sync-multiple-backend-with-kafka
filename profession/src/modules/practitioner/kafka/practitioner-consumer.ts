import { TOPICS } from "@/constant/topics";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";

import { PractitionerModel } from "../models/practitioner.model";
import type { IPractitioner } from "../types/practitioner.type";
import mongoose from "mongoose";
import { DB_OPERATION, type TDbOperation } from "@/constant/db-operation";
import { logger } from "@/utils/logger";

const handlePracCreate = async (pracData: IPractitioner) => {
  logger.info("pracData:", pracData);
  const session = await mongoose.startSession();

  session.startTransaction();
  try {
    await PractitionerModel.create([pracData], { session });
    logger.success("Practitioner created successfully:", pracData._id);
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
      logger.info("FindProfessionModel updated:", updatedFindProfession);
    }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling practitioner creation:", error);
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
    logger.info(`Practitioner with ID ${pracData._id} updated successfully.`);
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling practitioner creation:", error);
  } finally {
    session.endSession();
  }
};

const handlePracDelete = async (pracData: IPractitioner) => {
  logger.info("pracData:", pracData);
  try {
    await PractitionerModel.findOneAndDelete({ _id: pracData._id });
  } catch (error) {
    logger.error("Error handling practitioner deletion:", error);
  }
};

export type TPracTopic = (typeof TOPICS.PRAC)[keyof typeof TOPICS.PRAC];

export const pracConsumer = async (
  operation: TDbOperation,
  pracData: IPractitioner
) => {
  switch (operation) {
    case DB_OPERATION.INSERT:
      await handlePracCreate(pracData);
      break;
    case DB_OPERATION.UPDATE:
      await handlePracUpdate(pracData);
      break;
    case DB_OPERATION.DELETE:
      await handlePracDelete(pracData);
      break;
    default:
      console.warn(`Unhandled operation: ${operation}`);
  }
};
