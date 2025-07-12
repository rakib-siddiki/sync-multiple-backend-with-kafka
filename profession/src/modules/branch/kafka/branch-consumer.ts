import { TOPICS } from "@/constant/topics";
import { BranchModel } from "../models/branch.model";
import type { IBranch } from "../types/branch.type";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";
import { DB_OPERATION, type TDbOperation } from "@/constant/db-operation";

const handleBranchCreate = async (branchData: IBranch) => {
  try {
    const newBranch = new BranchModel(branchData);
    await newBranch.save();
    console.log(
      "%c[SUCCESS]%c Branch created successfully:",
      "color: green; font-weight: bold",
      "color: inherit",
      newBranch
    );

    await FindProfessionModel.updateOne(
      {
        $or: [
          { userId: branchData.organization },
          { organizationId: branchData.practitioner },
        ],
      },
      { $addToSet: { branch: newBranch._id } }
    );

    console.log(
      "%c[SUCCESS]%c User and FindProfession updated with new branch:",
      "color: green; font-weight: bold",
      "color: inherit"
    );
  } catch (err) {
    console.error("Error saving branch:", err);
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
      console.log(
        "%c[SUCCESS]%c Branch updated successfully:",
        "color: green; font-weight: bold",
        "color: inherit",
        updated
      );

      await FindProfessionModel.updateOne(
        {
          $or: [
            { userId: branchData.organization },
            { organizationId: branchData.practitioner },
          ],
        },
        { $addToSet: { branch: updated._id } }
      );

      console.log(
        "%c[SUCCESS]%c User and FindProfession updated with new branch:",
        "color: green; font-weight: bold",
        "color: inherit"
      );
    } else {
      console.warn("Branch not found for update:", branchData._id);
    }
  } catch (err) {
    console.error("Error updating branch:", err);
  }
};

const handleBranchDelete = async (branchData: IBranch) => {
  console.log("🚀 ~ branchData:", branchData);
  try {
    const deleted = await BranchModel.findByIdAndRemove(branchData._id);
    if (deleted) {
      console.log(
        "%c[SUCCESS]%c Branch deleted successfully:",
        "color: green; font-weight: bold",
        "color: inherit",
        deleted
      );

      await FindProfessionModel.updateOne(
        {
          $or: [
            { userId: deleted.organization },
            { organizationId: deleted.practitioner },
          ],
        },
        { $pull: { branch: deleted._id } }
      );

      console.log(
        "%c[SUCCESS]%c User and FindProfession updated after branch deletion:",
        "color: green; font-weight: bold",
        "color: inherit"
      );
    } else {
      console.warn("Branch not found for delete:", branchData._id);
    }
  } catch (err) {
    console.error("Error deleting branch:", err);
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
