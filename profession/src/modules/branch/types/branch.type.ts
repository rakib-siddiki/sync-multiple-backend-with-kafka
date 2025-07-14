import { Document, type ObjectId } from "mongoose";

export interface IBranch extends Document {
  address: string;
  organization: ObjectId;
  practitioner: ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

