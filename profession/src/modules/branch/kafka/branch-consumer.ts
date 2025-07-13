import { TOPICS } from "@/constant/topics";
import { BranchModel } from "../models/branch.model";
import type { IBranch } from "../types/branch.type";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";
import { DB_OPERATION, type TDbOperation } from "@/constant/db-operation";
import { logger } from "@/utils/logger";

const handleBranchCreate = async (branchData: IBranch) => {
  try {
    const newBranch = new BranchModel(branchData);
    await newBranch.save();
    logger.success("Branch created successfully:", newBranch);

    await FindProfessionModel.updateOne(
      {
        $or: [
          { userId: branchData.organization },
          { organizationId: branchData.practitioner },
        ],
      },
      { $addToSet: { branch: newBranch._id } }
    );

    logger.success(
      "User and FindProfession updated with new branch:",
      newBranch._id
    );
  } catch (err) {
    logger.error("Error saving branch:", err);
  }
};

const handleBranchUpdate = async (branchData: IBranch) => {
  try {
    const updated = await BranchModel.findOneAndUpdate(
      { _id: branchData._id },
      branchData,
      {
        new: true,
      }
    );

    if (updated) {
      logger.success("Branch updated successfully:", updated);

      await FindProfessionModel.updateOne(
        {
          $or: [
            { userId: branchData.organization },
            { organizationId: branchData.practitioner },
          ],
        },
        { $addToSet: { branch: updated._id } }
      );

      logger.success(
        "User and FindProfession updated with modified branch:",
        updated._id
      );
    } else {
      logger.warn("Branch not found for update:", branchData._id);
    }
  } catch (err) {
    logger.error("Error updating branch:", err);
  }
};

const handleBranchDelete = async (branchData: IBranch) => {
  logger.info("branchData:", branchData);
  try {
    const deleted = await BranchModel.findByIdAndRemove(branchData._id);
    if (deleted) {
      logger.success("Branch deleted successfully:", deleted);

      await FindProfessionModel.updateOne(
        {
          $or: [
            { userId: deleted.organization },
            { organizationId: deleted.practitioner },
          ],
        },
        { $pull: { branch: deleted._id } }
      );

      logger.success(
        "User and FindProfession updated after branch deletion:",
        deleted._id
      );
    } else {
      logger.warn("Branch not found for delete:", branchData._id);
    }
  } catch (err) {
    logger.error("Error deleting branch:", err);
  }
};

export type TBranchTopic = (typeof TOPICS.BRANCH)[keyof typeof TOPICS.BRANCH];

export const branchConsumer = async (
  operation: TDbOperation,
  branchData: IBranch
) => {
  switch (operation) {
    case DB_OPERATION.INSERT:
      await handleBranchCreate(branchData);
      break;
    case DB_OPERATION.UPDATE:
      await handleBranchUpdate(branchData);
      break;
    case DB_OPERATION.DELETE:
      await handleBranchDelete(branchData);
      break;
    // Add more cases for other topics as needed
    default:
      console.warn(`Unhandled operation: ${operation}`);
  }
};
