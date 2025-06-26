import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  branch: string[];
  createdAt: Date;
  updatedAt: Date;
}
