import type { IBranchInfo } from "../types/branch-info.type";
import { DB_OPERATION, type TDbOperation } from "@/constant/db-operation";
import { logger } from "@/utils/logger";
import { startSession } from "mongoose";
import { BranchInfoModel } from "../models/branch-info.model";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";
import { UserModel } from "@/modules/user/models/user.model";
import { InvitedPractitionerModel } from "@/modules/practitioner/models/invited-practitioner.model";
import { withDLQ, kafkaDLQ } from "@/config/kafka-dlq";

// Topic name constant for DLQ - use the same one consistently
const BRANCH_INFO_TOPIC = "database.changes.branchinfos";

const handleBranchInfoCreate = async (branchInfoData: IBranchInfo) => {
  logger.debug("Handling branch info creation:", branchInfoData);
  const session = await startSession();
  session.startTransaction();
  try {
    const [createdBranchInfo] = await BranchInfoModel.create([branchInfoData], {
      session,
    });
    if (!createdBranchInfo) {
      logger.error("Failed to create branch info:", branchInfoData);
      return;
    }
    logger.success("Branch info created successfully:", createdBranchInfo);
    // Update UserModel with the new branch info
    const updatedUser = await UserModel.findOneAndUpdate(
      {
        $or: [
          { practitioner: createdBranchInfo.practitioner },
          { organization: createdBranchInfo.organization },
        ],
      },
      {
        $set: {
          branch: createdBranchInfo._id,
        },
      }
    );

    if (!updatedUser) {
      logger.error("Failed to update user with branch info:", {
        practitioner: createdBranchInfo.practitioner,
        organization: createdBranchInfo.organization,
      });
      return;
    }

    logger.success("User Linked successfully with branch info:", updatedUser);
    const updatedFindProfession = await FindProfessionModel.findOneAndUpdate(
      {
        $or: [
          { practitioner: createdBranchInfo.practitioner },
          { organization: createdBranchInfo.organization },
        ],
      },
      {
        $addToSet: {
          branchInfo: { $each: [createdBranchInfo._id] },
          address: { $each: [createdBranchInfo.address] },
          zone: { $each: [createdBranchInfo.state] },
          city: { $each: [createdBranchInfo.city] },
        },
      },
      {
        new: true,
        session,
      }
    );
    if (!updatedFindProfession) {
      logger.error("Failed to update find profession:", {
        practitioner: createdBranchInfo.practitioner,
        organization: createdBranchInfo.organization,
      });
      return;
    }

    logger.success(
      "Find profession updated successfully:",
      updatedFindProfession
    );

    const invitedPractitioners = await InvitedPractitionerModel.find({
      organization: createdBranchInfo.organization,
      branches: { $in: [createdBranchInfo.branch] },
    });

    if (invitedPractitioners.length > 0) {
      const userIds = invitedPractitioners.map(
        (invitedPractitioner) => invitedPractitioner.user
      );

      const updated = await FindProfessionModel.updateMany(
        {
          _id: { $in: userIds },
        },
        {
          $addToSet: {
            branchInfo: { $each: [createdBranchInfo._id] },
            address: { $each: [createdBranchInfo.address] },
            zone: { $each: [createdBranchInfo.state] },
            city: { $each: [createdBranchInfo.city] },
          },
        },
        {
          new: true,
          upsert: true,
          session,
        }
      );

      if (!updated) {
        const error = new Error(
          "Failed to update find profession with invited branches"
        );
        logger.error(
          "Failed to update find profession with invited branches:",
          {
            practitioner: createdBranchInfo.practitioner,
          }
        );

        // Record the error in DLQ but continue execution
        await kafkaDLQ.sendToDLQ(
          BRANCH_INFO_TOPIC,
          error,
          { value: createdBranchInfo },
          { userIds, operation: "create_invited_branches" }
        );
        return;
      }
      logger.success(
        "Find profession updated successfully with invited branches:",
        updated
      );
    }

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    logger.error("Error saving branchInfo:", err);
  } finally {
    session.endSession();
  }
};

const handleBranchInfoUpdate = async (branchInfoData: IBranchInfo) => {
  logger.debug("Handling branch info update:", branchInfoData);
  const session = await startSession();
  session.startTransaction();
  try {
    // Update the branch info document
    const updatedBranchInfo = await BranchInfoModel.findByIdAndUpdate(
      branchInfoData._id,
      branchInfoData,
      { new: true, session }
    );
    if (!updatedBranchInfo) {
      logger.error("Failed to update branch info:", branchInfoData);
      await session.abortTransaction();
      return;
    }
    logger.success("Branch info updated successfully:", updatedBranchInfo);

    // Update FindProfessionModel with new address, zone, city if changed
    const updatedFindProfession = await FindProfessionModel.findOneAndUpdate(
      {
        $or: [
          { practitioner: updatedBranchInfo.practitioner },
          { organization: updatedBranchInfo.organization },
        ],
      },
      {
        $addToSet: {
          address: { $each: [updatedBranchInfo.address] },
          zone: { $each: [updatedBranchInfo.state] },
          city: { $each: [updatedBranchInfo.city] },
        },
      },
      {
        new: true,
        session,
      }
    );
    if (!updatedFindProfession) {
      logger.error("Failed to update find profession on branch update:", {
        practitioner: updatedBranchInfo.practitioner,
        organization: updatedBranchInfo.organization,
      });
      await session.abortTransaction();
      return;
    }
    logger.success(
      "Find profession updated successfully on branch update:",
      updatedFindProfession
    );

    const invitedPractitioners = await InvitedPractitionerModel.find({
      organization: updatedBranchInfo.organization,
      branches: { $in: [updatedBranchInfo.branch] },
    });

    if (invitedPractitioners.length > 0) {
      const userIds = invitedPractitioners.map(
        (invitedPractitioner) => invitedPractitioner.user
      );

      const updated = await FindProfessionModel.updateMany(
        {
          _id: { $in: userIds },
        },
        {
          $addToSet: {
            branchInfo: { $each: [updatedBranchInfo._id] },
            address: { $each: [updatedBranchInfo.address] },
            zone: { $each: [updatedBranchInfo.state] },
            city: { $each: [updatedBranchInfo.city] },
          },
        },
        {
          new: true,
          upsert: true,
          session,
        }
      );

      if (!updated) {
        const error = new Error(
          "Failed to update find profession with invited branches on branch update"
        );
        logger.error(
          "Failed to update find profession with invited branches on branch update:",
          {
            practitioner: updatedBranchInfo.practitioner,
          }
        );
        // Even though we're handling this gracefully, we still want to record the error in DLQ
        await kafkaDLQ.sendToDLQ(
          BRANCH_INFO_TOPIC,
          error,
          { value: updatedBranchInfo },
          { userIds, operation: "update_invited_branches" }
        );
      }
    }
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    logger.error("Error updating branchInfo:", err);
  } finally {
    session.endSession();
  }
};

const handleBranchInfoDelete = async (branchId: string) => {
  logger.debug("handling branchInfo delete Id:", { branchId });
  const session = await startSession();
  session.startTransaction();
  try {
    // Find and delete the branch info document
    const deletedBranchInfo = await BranchInfoModel.findByIdAndDelete(
      branchId,
      { session }
    );
    if (!deletedBranchInfo) {
      logger.error("Failed to delete branch info:", { branchId });
      await session.abortTransaction();
      return;
    }
    logger.success("Branch info deleted successfully:", deletedBranchInfo);

    // Remove branch info from UserModel
    const updatedUser = await UserModel.updateMany(
      {
        $or: [
          { practitioner: deletedBranchInfo.practitioner },
          { organization: deletedBranchInfo.organization },
        ],
      },
      {
        $set: { branch: null },
      },
      { session }
    );
    if (!updatedUser) {
      logger.error("Failed to update user on branch delete:", {
        practitioner: deletedBranchInfo.practitioner,
        organization: deletedBranchInfo.organization,
      });
      return;
    }
    logger.success("User unlinked successfully on branch delete:", updatedUser);

    // Get all locations from active branch infos for this practitioner/organization in one query
    const activeLocations = await BranchInfoModel.aggregate([
      {
        $match: {
          _id: { $ne: deletedBranchInfo._id },
          $or: [
            { practitioner: deletedBranchInfo.practitioner },
            { organization: deletedBranchInfo.organization },
          ],
        },
      },
      {
        $group: {
          _id: null,
          addresses: { $addToSet: "$address" },
          states: { $addToSet: "$state" },
          cities: { $addToSet: "$city" },
        },
      },
    ]).session(session);

    // Extract unique values or default to empty arrays if no results
    const activeAddresses = activeLocations[0]?.addresses || [];
    const activeStates = activeLocations[0]?.states || [];
    const activeCities = activeLocations[0]?.cities || [];

    logger.debug("Active locations after delete:", {
      activeAddresses,
      activeStates,
      activeCities,
    });

    // Build the update object based on what needs to be removed
    const pullObject: any = {
      branchInfo: deletedBranchInfo._id,
    };

    // Only remove values not found in active branches
    if (!activeAddresses.includes(deletedBranchInfo.address)) {
      pullObject.address = deletedBranchInfo.address;
    }

    if (!activeStates.includes(deletedBranchInfo.state)) {
      pullObject.zone = deletedBranchInfo.state;
    }

    if (!activeCities.includes(deletedBranchInfo.city)) {
      pullObject.city = deletedBranchInfo.city;
    }

    // Only update FindProfessionModel if we need to pull something
    if (Object.keys(pullObject).length > 0) {
      const updatedFindProfession = await FindProfessionModel.findOneAndUpdate(
        {
          $or: [
            { practitioner: deletedBranchInfo.practitioner },
            { organization: deletedBranchInfo.organization },
          ],
        },
        {
          $pull: pullObject,
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedFindProfession) {
        logger.error("Failed to update find profession on branch delete:", {
          practitioner: deletedBranchInfo.practitioner,
          organization: deletedBranchInfo.organization,
        });
        await session.abortTransaction();
        return;
      }

      logger.success(
        "Find profession updated successfully on branch delete:",
        updatedFindProfession
      );
    } else {
      logger.info(
        "No need to update FindProfessionModel as data is used by other branch infos"
      );
    }

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    logger.error("Error deleting branchInfo:", err);
  } finally {
    session.endSession();
  }
};

// Wrap handlers with DLQ error handling
const safeHandleBranchInfoCreate = withDLQ(
  BRANCH_INFO_TOPIC,
  handleBranchInfoCreate
);
const safeHandleBranchInfoUpdate = withDLQ(
  BRANCH_INFO_TOPIC,
  handleBranchInfoUpdate
);
const safeHandleBranchInfoDelete = withDLQ(
  BRANCH_INFO_TOPIC,
  handleBranchInfoDelete
);

export const branchInfoConsumer = async (
  operation: TDbOperation,
  branchInfoData: IBranchInfo
) => {
  switch (operation) {
    case DB_OPERATION.INSERT:
      await safeHandleBranchInfoCreate(branchInfoData);
      break;
    case DB_OPERATION.UPDATE:
      await safeHandleBranchInfoUpdate(branchInfoData);
      break;
    case DB_OPERATION.DELETE:
      await safeHandleBranchInfoDelete(branchInfoData._id);
      break;
    // Add more cases for other topics as needed
    default:
      console.warn(`Unhandled operation: ${operation}`);
  }
};
