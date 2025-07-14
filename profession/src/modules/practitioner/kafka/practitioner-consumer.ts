import { TOPICS } from "@/constant/topics";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";

import { PractitionerModel } from "../models/practitioner.model";
import type { IPractitioner } from "../types/practitioner.type";

import { DB_OPERATION, type TDbOperation } from "@/constant/db-operation";
import { logger } from "@/utils/logger";
import { startSession } from "mongoose";
import { UserModel } from "@/modules/user/models/user.model";
import { FIND_PROFESSION_TYPE } from "@/modules/find-profession/constant";

const handlePracCreate = async (pracData: IPractitioner) => {
  logger.debug("Handling practitioner creation:", pracData);
  const session = await startSession();
  session.startTransaction();
  try {
    const [createdPrac] = await PractitionerModel.create([pracData], {
      session,
    });

    if (!createdPrac) {
      logger.error("Failed to create practitioner:", pracData);
      return;
    }

    logger.success("Practitioner created successfully:", createdPrac._id);
    const user = await UserModel.findOneAndUpdate(
      { _id: pracData.user },
      { $set: { practitioner: createdPrac._id } },
      { new: true, session }
    );
    if (!user) {
      logger.error(
        `User with ID ${pracData.user} not found for practitioner link.`
      );
      return;
    }
    logger.success("User linked to practitioner successfully:", user);

    const updatedFindProfession = await FindProfessionModel.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        ...(!user.organization && {
          type: FIND_PROFESSION_TYPE.PRAC,
        }),
        practitioner_name: pracData.full_name,
      },
      {
        session,
      }
    );
    logger.info("FindProfessionModel updated:", updatedFindProfession);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling practitioner creation:", error);
  } finally {
    session.endSession();
  }
};

const handlePracUpdate = async (pracData: IPractitioner) => {
  logger.debug("Handling practitioner update:", pracData);
  const session = await startSession();
  session.startTransaction();
  try {
    const updatedPrac = await PractitionerModel.findOneAndUpdate(
      { _id: pracData._id },
      {
        $set: {
          practitioner_name: pracData.full_name,
        },
      },
      {
        session,
      }
    );
    if (!updatedPrac) {
      logger.error("Failed to update practitioner:", pracData);
      return;
    }
    logger.info(`Practitioner with ID ${pracData._id} updated successfully.`);
    // Create or update the FindProfessionModel entry for the practitioner
    const updatedFindProfession = await FindProfessionModel.findOneAndUpdate(
      {
        practitioner: updatedPrac._id,
      },
      {
        $set: {
          practitioner_name: pracData.full_name,
        },
      },
      {
        new: true,
        session,
      }
    );
    if (!updatedFindProfession) {
      logger.error(
        `Failed to update FindProfessionModel for practitioner ID ${pracData._id}`
      );
      return;
    }
    logger.info(
      `FindProfessionModel updated for practitioner`,
      updatedFindProfession
    );
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling practitioner creation:", error);
  } finally {
    session.endSession();
  }
};

const handlePracDelete = async (pracData: IPractitioner) => {
  logger.debug("Handling practitioner deletion:", pracData);
  const session = await startSession();
  session.startTransaction();
  try {
    const deletedPrac = await PractitionerModel.findOneAndDelete(
      { _id: pracData._id },
      { session }
    );
    if (!deletedPrac) {
      logger.error("Failed to delete practitioner:", pracData);
      return;
    }

    await UserModel.findOneAndUpdate(
      { practitioner: deletedPrac._id },
      { $set: { practitioner: null } },
      { new: true, session }
    );
    logger.success(
      "User unlinked from practitioner successfully:",
      deletedPrac._id
    );

    logger.success("Practitioner deleted successfully:", deletedPrac._id);
    // Remove the practitioner reference from the FindProfessionModel
    const updatedFindProfession = await FindProfessionModel.findOneAndUpdate(
      { practitioner: deletedPrac._id },
      { $set: { practitioner_name: "", organization: null } },
      { new: true, session }
    );
    if (!updatedFindProfession) {
      logger.error(
        `Failed to update FindProfessionModel for deleted practitioner ID ${deletedPrac._id}`
      );
      return;
    }
    logger.success(
      "FindProfessionModel updated successfully:",
      updatedFindProfession
    );
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling practitioner deletion:", error);
  } finally {
    session.endSession();
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
