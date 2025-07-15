import { model, Schema, Types } from "mongoose";
import {
  sendBranchCreated,
  sendBranchUpdated,
  sendBranchDeleted,
} from "../kafka/branch-producer";
import type { IBranch } from "../types/branch.type";
import { setupChangeStreamWatcher } from "../../../utils/change-stream-watcher";

const branchStatus = ["active", "inactive"];
const BranchSchema = new Schema<IBranch>(
  {
    name: { type: String, default: "" },
    status: { type: String, enum: branchStatus, default: "active" },
    position: { type: Number, default: 0 },
    branch_info: { type: Types.ObjectId, ref: "BranchInfo", default: null },
    organization: { type: Types.ObjectId, ref: "Organization", default: null },
    practitioner: { type: Types.ObjectId, ref: "Practitioner", default: null },
  },
  { timestamps: true }
);

export const BranchModel = model("Branch", BranchSchema);

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
