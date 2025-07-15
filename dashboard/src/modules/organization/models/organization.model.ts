import { model, Schema, Types } from "mongoose";
import type { IOrganization } from "../types/organization.type";
import { setupChangeStreamWatcher } from "@/utils/change-stream-watcher";
import {
  sendOrganizationCreated,
  sendOrganizationDeleted,
  sendOrganizationUpdated,
} from "../kafka/organization-producer";

const OrganizationSchema = new Schema<IOrganization>(
  {
    full_name: { type: String, default: "" },
    business_url: { type: String, default: "", unique: true },
    category: { type: String, default: "" },
    sub_category: { type: String, default: "" },
    email: { type: String, default: "" },
    currency_code: { type: String, default: "" },
    currency_symbol: { type: String, default: "" },
    organization_account: {
      type: Types.ObjectId,
      ref: "OrganizationAccount",
      default: null,
    },
    user: { type: Types.ObjectId, ref: "User", default: null },
    branch: { type: Types.ObjectId, ref: "Branch", default: null },
  },
  { timestamps: true }
);

OrganizationSchema.index({ business_url: 1 });
OrganizationSchema.index({ organization_account: 1 });
OrganizationSchema.index({ user: 1 });

export const OrganizationModel = model<IOrganization>(
  "Organization",
  OrganizationSchema
);

setupChangeStreamWatcher(OrganizationModel, {
  onInsert: async (document) => {
    sendOrganizationCreated(document);
  },
  onUpdate: async (document) => {
    sendOrganizationUpdated(document);
  },
  onDelete: async ({ _id }) => {
    sendOrganizationDeleted(_id);
  },
});
