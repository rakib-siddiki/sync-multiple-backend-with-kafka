import { model, Schema, Types } from "mongoose";
import type { IBranch } from "../types/branch.type";

const branchStatus = ["active", "inactive"];

const branchSchema = new Schema<IBranch>(
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

export const BranchModel = model<IBranch>("Branch", branchSchema);
