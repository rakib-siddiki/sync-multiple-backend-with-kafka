import { model, Schema, Types } from "mongoose";
import type { IInvitedPractitioner } from "../types/invited-practitioner.type";

const statusEnum = ["active", "pending", "removed", "hold"];

const InvitedPractitionerSchema = new Schema<IInvitedPractitioner>(
  {
    full_name: { type: String, default: "" },
    email: { type: String, default: "" },
    status: { type: String, enum: statusEnum, default: "pending" },
    assign_permission: {
      type: Schema.Types.ObjectId,
      ref: "AssignPermission",
      default: null,
    },
    branches: {
      type: [Types.ObjectId],
      ref: "Branch",
      default: [],
    },
    user: { type: Types.ObjectId, ref: "User", default: null },
    practitioner: {
      type: Types.ObjectId,
      ref: "Practitioner",
      default: null,
    },
    organization: {
      type: Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    join_date: { type: Date, default: null },
  },
  { timestamps: true }
);

export const InvitedPractitionerModel = model<IInvitedPractitioner>(
  "InvitedPractitioner",
  InvitedPractitionerSchema
);
