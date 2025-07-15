import { Document, type ObjectId } from "mongoose";

export interface IBranch extends Document {
  name: string;
  status: 'active' | 'inactive';
  position: number;
  branch_info: ObjectId;
  organization: ObjectId;
  practitioner: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
