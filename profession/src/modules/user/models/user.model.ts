import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/user.type";

const userSchema: Schema<IUser> = new Schema(
  {
    username: { type: String },
    profile_photo_src: { type: String, default: "" },
    status: { type: String, default: "pending" },
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
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
