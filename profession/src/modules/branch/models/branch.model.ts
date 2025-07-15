import { model, Schema, Types } from "mongoose";

const BranchSchema = new Schema(
  {
    name: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    position: { type: Number, default: 0 },
    branch_info: { type: Types.ObjectId, default: null, ref: "BranchInfo" },
    organization: { type: Types.ObjectId, default: null, ref: "Organization" },
    practitioner: { type: Types.ObjectId, default: null, ref: "Practitioner" },
  },
  { timestamps: true }
);

export const BranchModel = model("Branch", BranchSchema);
