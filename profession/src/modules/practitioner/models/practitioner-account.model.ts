import { model, Schema, Types } from "mongoose";

const PractitionerAccountSchema = new Schema(
  {
    display_name: { type: String, default: "" },
    description: { type: String, default: "" },
    website: { type: String, default: "" },
    location: { type: String, default: "" },
    country: { type: String, default: "" },
    language: { type: String, default: "" },
    time_zone: { type: String, default: "" },
    phone_code: { type: String, default: "" },
    phone_number: { type: String, default: "" },
    customer_alias: { type: String, default: "" },
    service_alias: { type: String, default: "" },
    secure_mode: { type: Boolean, default: false },
    practitioner_info: {
      type: Types.ObjectId,
      default: null,
      ref: "PractitionerInfo",
    },
    practitioner: { type: Types.ObjectId, default: null, ref: "Practitioner" },
  },
  { timestamps: true }
);

PractitionerAccountSchema.index({ practitioner: 1 });
PractitionerAccountSchema.index({ practitioner_info: 1 });

export const PractitionerAccountModel = model(
  "PractitionerAccount",
  PractitionerAccountSchema
);
