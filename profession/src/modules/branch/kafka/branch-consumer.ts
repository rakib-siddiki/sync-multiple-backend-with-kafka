import { startSession } from "mongoose";
import { DB_OPERATION, type TDbOperation } from "@/constant/db-operation";
import { logger } from "@/utils/logger";
import { BranchModel } from "../models/branch.model";
import type { IBranch } from "../types/branch.type";

const handleBranchCreate = async (branchData: IBranch) => {
  logger.debug("Handling branch creation:", branchData);
  const session = await startSession();
  session.startTransaction();

  try {
    const [createdBranch] = await BranchModel.create([branchData], { session });

    if (!createdBranch) {
      logger.error("Failed to create branch:", branchData);
      return;
    }

    logger.success("Branch created successfully:", createdBranch._id);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling branch creation:", error);
  } finally {
    session.endSession();
  }
};

/**
 * Handle updating a branch
 * @param branchData The branch data to update
 */
const handleBranchUpdate = async (branchData: IBranch) => {
  logger.debug("Handling branch update:", branchData);
  const session = await startSession();
  session.startTransaction();

  try {
    // Update the branch
    const updatedBranch = await BranchModel.findByIdAndUpdate(
      branchData._id,
      { $set: branchData },
      { new: true, session }
    );

    if (!updatedBranch) {
      logger.error("Failed to update branch:", branchData);
      return;
    }

    logger.success(`Branch with ID ${branchData._id} updated successfully.`);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling branch update:", error);
  } finally {
    session.endSession();
  }
};

const handleBranchDelete = async (branchData: IBranch) => {
  logger.debug("Handling branch deletion:", branchData);
  const session = await startSession();
  session.startTransaction();

  try {
    const deletedBranch = await BranchModel.findByIdAndDelete(branchData._id, {
      session,
    });

    if (!deletedBranch) {
      logger.error("Failed to delete branch:", branchData);
      return;
    }

    logger.success(`Branch with ID ${branchData._id} deleted successfully.`);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling branch deletion:", error);
  } finally {
    session.endSession();
  }
};

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
    default:
      logger.warn(`Unhandled operation for branch: ${operation}`);
  }
};
