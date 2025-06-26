import { TOPICS } from "@/constant/topics";
import { BranchModel } from "../models/branch.model";
import type { IBranch } from "../types/branch.type";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";
import { UserModel } from "@/modules/user/models/user.model";

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
    
     await UserModel.updateOne(
        { _id: branchData.userId },
        { $addToSet: { branch: newBranch._id } }
      );
      await FindProfessionModel.updateOne(
        { _id: branchData.userId },
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

      await UserModel.updateOne(
        { _id: branchData.userId },
        { $addToSet: { branch: updated._id } }
      );
      await FindProfessionModel.updateOne(
        { _id: branchData.userId },
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
      
       await UserModel.updateOne(
          { _id: deleted.userId },
          { $pull: { branch: deleted._id } }
        );
       await FindProfessionModel.updateOne(
          { _id: deleted.userId },
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
  topic: TBranchTopic,
  branchData: IBranch
) => {
  console.log("🚀 ~ topic:", topic);
  console.log("🚀 ~ branchData:", branchData);
  switch (topic) {
    case TOPICS.BRANCH.CREATE:
      await handleBranchCreate(branchData);
      break;
    case TOPICS.BRANCH.UPDATE:
      await handleBranchUpdate(branchData);
      break;
    case TOPICS.BRANCH.DELETE:
      await handleBranchDelete(branchData);
      break;
    // Add more cases for other topics as needed
    default:
      console.warn(`Unhandled topic: ${topic}`);
  }
};
