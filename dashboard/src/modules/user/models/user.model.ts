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
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    branch: [{ type: String, ref: "Branch" }],
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
