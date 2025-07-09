import { Document, type ObjectId } from "mongoose";

export interface IUser extends Document {
  username: string
  profile_photo_src: string
  status: string
  practitioner: ObjectId | null;
  organization: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}
