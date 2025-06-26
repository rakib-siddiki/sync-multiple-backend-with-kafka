import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  branch: string[]; // Assuming branch is an array of strings, change to ObjectId if needed
  createdAt: Date;
  updatedAt: Date;
}
