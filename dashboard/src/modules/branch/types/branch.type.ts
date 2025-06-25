import { Document } from "mongoose";

export interface IBranch extends Document {
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
