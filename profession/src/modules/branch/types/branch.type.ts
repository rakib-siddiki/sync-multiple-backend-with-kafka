import type { Document } from "mongoose";

export interface IBranch extends Document {
  _id: string;
  name: string;
  status: "active" | "inactive";
  position: number;
  branch_info: string | null; // ObjectId as string
  organization: string | null; // ObjectId as string
  practitioner: string | null; // ObjectId as string
  created_at?: Date;
  updated_at?: Date;
}
