import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/user.type";
import {
  sendUserCreated,
  sendUserDeleted,
  sendUserUpdated,
} from "../kafka/user-producer";

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

userSchema.post("save", async (doc) => {
  console.log(`User created: ${doc.email}`);
  await sendUserCreated(doc);
});

userSchema.post("findOneAndUpdate", async (doc) => {
  console.log(`User updated: ${doc.email}`);
  await sendUserUpdated(doc);
});

userSchema.post("findOneAndDelete", async (doc) => {
  console.log(`User deleted: ${doc.email}`);
  await sendUserDeleted(doc);
});

export const UserModel = mongoose.model<IUser>("User", userSchema);
