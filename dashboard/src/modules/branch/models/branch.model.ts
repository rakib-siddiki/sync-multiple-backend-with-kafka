import { model, Schema } from "mongoose";
import {
  sendBranchCreated,
  sendBranchUpdated,
  sendBranchDeleted,
} from "../kafka/branch-producer";
import type { IBranch } from "../types/branch.type";

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

branchSchema.post("save", async (doc) => {
  console.log(`Branch created: ${doc.name}`);
  await sendBranchCreated(doc);
});

branchSchema.post("findOneAndUpdate", async (doc) => {
  console.log(`Branch updated: ${doc.name}`);
  await sendBranchUpdated(doc);
});

branchSchema.post("findOneAndRemove", async (doc) => {
  console.log(`Branch deleted: ${doc.name}`);
  await sendBranchDeleted(doc);
});

export const BranchModel = model<IBranch>("Branch", branchSchema);
