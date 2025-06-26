import { Document, type ObjectId } from "mongoose";

export interface IBranch extends Document {
  name: string;
  userId: ObjectId; // Assuming userId is a string, change to ObjectId if needed
  createdAt?: Date;
  updatedAt?: Date;
}
