import { model, Schema } from "mongoose";
import {
  sendBranchCreated,
  sendBranchUpdated,
  sendBranchDeleted,
} from "../kafka/branch-producer";
import type { IBranch } from "../types/branch.type";
import { setupChangeStreamWatcher } from "../../../utils/change-stream-watcher";

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

export const BranchModel = model<IBranch>("Branch", branchSchema);

// Set up change stream watcher for the Branch collection
setupChangeStreamWatcher(BranchModel, {
  onInsert: async (document) => {
    await sendBranchCreated(document);
  },
  onUpdate: async (document) => {
    await sendBranchUpdated(document);
  },
  onDelete: async (documentKey) => {
    await sendBranchDeleted({ _id: documentKey._id } as IBranch);
  },
});
