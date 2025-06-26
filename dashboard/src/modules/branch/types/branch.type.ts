import { Document, type ObjectId } from "mongoose";

export interface IBranch extends Document {
  name: string;
  userId: ObjectId
  createdAt?: Date;
  updatedAt?: Date;
}
