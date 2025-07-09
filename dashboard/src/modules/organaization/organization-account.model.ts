import { model, Schema, Types } from "mongoose";

const OrganizationAccountSchema = new Schema(
  {
    legal_name: { type: String, default: "" },
    description: { type: String, default: "" },
    website: { type: String, default: "" },
    country: { type: String, default: "" },
    language: { type: String, default: "" },
    time_zone: { type: String, default: "" },
    phone_code: { type: String, default: "" },
    phone_number: { type: String, default: "" },
    customer_alias: { type: String, default: "" },
    service_alias: { type: String, default: "" },
    practitioner_alias: { type: String, default: "" },
    business_role: { type: String, default: "" },
    shop: { type: Boolean, default: false },
    secure_mode: { type: Boolean, default: false },
    delete_after: { type: String, default: "" },
    organization: { type: Types.ObjectId, ref: "Organization", default: null },
  },
  { timestamps: true }
);

OrganizationAccountSchema.index({ organization: 1 });

export const OrganizationAccountModel = model(
  "OrganizationAccount",
  OrganizationAccountSchema
);
