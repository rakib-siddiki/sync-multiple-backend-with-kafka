import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/user.type";
import {
  sendUserCreated,
  sendUserDeleted,
  sendUserUpdated,
} from "../kafka/user-producer";
import { setupChangeStreamWatcher } from "../../../utils/change-stream-watcher";

const userSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    full_name: { type: String, default: "" },
    profile_photo_src: { type: String, default: "" },
    profile_photo_alt: { type: String, default: "" },
    account_type: { type: String, default: "user" },
    provider_type: { type: String, default: "manual" },
    status: { type: String, default: "pending" },
    is_active: { type: Boolean, default: true },
    currency_code: { type: String, default: "USD" },
    currency_symbol: { type: String, default: "$" },
    user_basic_info: {
      type: Schema.Types.ObjectId,
      ref: "UserBasicInfo",
      default: null,
    },
    practitioner: {
      type: Schema.Types.ObjectId,
      ref: "Practitioner",
      default: null,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    invited_practitioner: [
      { type: Schema.Types.ObjectId, ref: "Practitioner", default: [] },
    ],
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);

// Set up change stream watcher for the User collection
setupChangeStreamWatcher(UserModel, {
  onInsert: async (document) => {
    await sendUserCreated(document);
  },
  onUpdate: async (document) => {
    await sendUserUpdated(document);
  },
  onDelete: async (documentKey) => {
    await sendUserDeleted({ _id: documentKey._id } as IUser);
  },
});
