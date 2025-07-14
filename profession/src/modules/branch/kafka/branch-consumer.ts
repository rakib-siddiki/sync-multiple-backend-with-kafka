import { TOPICS } from "@/constant/topics";
import type { IBranch } from "../types/branch.type";
import { DB_OPERATION, type TDbOperation } from "@/constant/db-operation";
import { logger } from "@/utils/logger";

const handleBranchCreate = async (branchData: IBranch) => {
  try {
   
  } catch (err) {
    logger.error("Error saving branch:", err);
  }
};

const handleBranchUpdate = async (branchData: IBranch) => {
  try {
   
  } catch (err) {
    logger.error("Error updating branch:", err);
  }
};

const handleBranchDelete = async (branchData: IBranch) => {
  logger.info("branchData:", branchData);
  try {
    
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
