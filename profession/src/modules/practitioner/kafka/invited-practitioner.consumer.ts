import { startSession } from "mongoose";
import { DB_OPERATION, type TDbOperation } from "@/constant/db-operation";
import { logger } from "@/utils/logger";
import { InvitedPractitionerModel } from "../models/invited-practitioner.model";
import type { IInvitedPractitioner } from "../types/invited-practitioner.type";
import { UserModel } from "@/modules/user/models/user.model";

const handleInvitedPracCreate = async (
  invitedPracData: IInvitedPractitioner
) => {
  logger.debug("Handling invited practitioner creation:", invitedPracData);
  const session = await startSession();
  session.startTransaction();

  try {
    const [createdInvitedPrac] = await InvitedPractitionerModel.create(
      [invitedPracData],
      { session }
    );

    if (!createdInvitedPrac) {
      logger.error("Failed to create invited practitioner:", invitedPracData);
      return;
    }

    logger.success(
      "Invited practitioner created successfully:",
      createdInvitedPrac._id
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling invited practitioner creation:", error);
  } finally {
    session.endSession();
  }
};


const handleInvitedPracUpdate = async (
  invitedPracData: IInvitedPractitioner
) => {
  logger.debug("Handling invited practitioner update:", invitedPracData);
  const session = await startSession();
  session.startTransaction();

  try {
    const updatedInvitedPrac = await InvitedPractitionerModel.findByIdAndUpdate(
      invitedPracData._id,
      { $set: invitedPracData },
      { new: true, session }
    );

    if (!updatedInvitedPrac) {
      logger.error("Failed to update invited practitioner:", invitedPracData);
      return;
    }

    logger.success(
      `Invited practitioner with ID ${invitedPracData._id} updated successfully.`
    );

    // If there's a user ID, update the user to link to this invited practitioner
    if (invitedPracData.user) {
      const user = await UserModel.findOneAndUpdate(
        { _id: invitedPracData.user },
        { $set: { invitedPractitioner: updatedInvitedPrac._id } },
        { new: true, session }
      );

      if (!user) {
        logger.error(
          `User with ID ${invitedPracData.user} not found for invited practitioner link.`
        );
        return;
      }

      logger.success("User linked to invited practitioner successfully:", user);
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling invited practitioner update:", error);
  } finally {
    session.endSession();
  }
};


const handleInvitedPracDelete = async (
  invitedPracData: IInvitedPractitioner
) => {
  logger.debug("Handling invited practitioner deletion:", invitedPracData);
  const session = await startSession();
  session.startTransaction();

  try {
    const deletedInvitedPrac = await InvitedPractitionerModel.findByIdAndDelete(
      invitedPracData._id,
      { session }
    );

    if (!deletedInvitedPrac) {
      logger.error("Failed to delete invited practitioner:", invitedPracData);
      return;
    }

    // If this invited practitioner is linked to a user, update the user
    if (deletedInvitedPrac.user) {
      await UserModel.findByIdAndUpdate(
        deletedInvitedPrac.user,
        { $set: { invitedPractitioner: null } },
        { session }
      );

      logger.success("User unlinked from invited practitioner successfully");
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling invited practitioner deletion:", error);
  } finally {
    session.endSession();
  }
};


export const invitedPracConsumer = async (
  operation: TDbOperation,
  invitedPracData: IInvitedPractitioner
) => {
  switch (operation) {
    case DB_OPERATION.INSERT:
      await handleInvitedPracCreate(invitedPracData);
      break;
    case DB_OPERATION.UPDATE:
      await handleInvitedPracUpdate(invitedPracData);
      break;
    case DB_OPERATION.DELETE:
      await handleInvitedPracDelete(invitedPracData);
      break;
    default:
      logger.warn(`Unhandled operation for invited practitioner: ${operation}`);
  }
};
