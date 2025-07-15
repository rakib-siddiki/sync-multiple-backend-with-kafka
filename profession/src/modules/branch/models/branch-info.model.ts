import { model, Schema, Types } from "mongoose";
import type { IBranchInfo } from "../types/branch-info.type";

const branchInfoSchema = new Schema<IBranchInfo>(
  {
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    organization: { type: Types.ObjectId, ref: "Organization", default: null },
    practitioner: { type: Types.ObjectId, ref: "Practitioner", default: null },
    user: { type: Types.ObjectId, ref: "User", default: null },
    branch: { type: Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export const BranchInfoModel = model<IBranchInfo>("BranchInfo", branchInfoSchema);
