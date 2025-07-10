import { Types } from "mongoose";

export interface IOrganization {
  full_name: string;
  business_url: string;
  category: string;
  sub_category: string;
  user: Types.ObjectId | null;
  branch: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}
