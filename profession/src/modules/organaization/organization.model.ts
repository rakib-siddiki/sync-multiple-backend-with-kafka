import { model, Schema, Types } from "mongoose";

const OrganizationSchema = new Schema(
  {
    full_name: { type: String, default: "" },
    business_url: { type: String, default: "", unique: true },
    category: { type: String, default: "" },
    sub_category: { type: String, default: "" },
    user: { type: Types.ObjectId, ref: "User", default: null },
    branch: { type: Types.ObjectId, ref: "Branch", default: null },
  },
  { timestamps: true }
);

  OrganizationSchema.index({ business_url: 1 });
OrganizationSchema.index({ user: 1 });

export const OrganizationModel = model("Organization", OrganizationSchema);
