import { model, Schema, Types } from "mongoose";

const PractitionerSchema = new Schema(
  {
    full_name: { type: String, default: "" },
    username: { type: String, default: "", unique: true },
    email: { type: String, default: "" },
    currency_code: { type: String, default: "" },
    currency_symbol: { type: String, default: "" },
    practitioner_info: {
      type: Types.ObjectId,
      ref: "PractitionerInfo",
      default: null,
    },
    practitioner_account: {
      type: Types.ObjectId,
      ref: "PractitionerAccount",
      default: null,
    },
    user: { type: Types.ObjectId, ref: "User", default: null },
    branch: { type: Types.ObjectId, ref: "Branch", default: null },
  },
  { timestamps: true }
);

PractitionerSchema.index({ username: 1 });
PractitionerSchema.index({ practitioner_info: 1 });
PractitionerSchema.index({ practitioner_account: 1 });
PractitionerSchema.index({ user: 1 });

export const PractitionerModel = model("Practitioner", PractitionerSchema);
