import { model, Schema, Types } from "mongoose";
import type { IBranch } from "../types/branch.type";

const branchSchema = new Schema<IBranch>(
  {
    address: { type: String },
    organization: { type: Types.ObjectId, ref: "Organization", default: null },
    practitioner: { type: Types.ObjectId, ref: "Practitioner", default: null },
  },
  { timestamps: true }
);

export const BranchModel = model<IBranch>("Branch", branchSchema);
