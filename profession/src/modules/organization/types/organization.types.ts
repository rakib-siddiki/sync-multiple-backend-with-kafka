import { Types } from "mongoose";

export interface IOrganization extends Document {
  _id: Types.ObjectId;
  full_name: string;
  business_url: string;
  category: string;
  sub_category: string;
  user: Types.ObjectId | null;
  branch: Types.ObjectId | null;
  created_at: Date;
  updated_at: Date;
}
