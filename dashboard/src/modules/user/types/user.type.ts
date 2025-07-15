import { Document, type ObjectId } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  full_name: string;
  profile_photo_src: string;
  profile_photo_alt: string;
  account_type: string;
  provider_type: string;
  status: string;
  is_active: boolean;
  currency_code: string;
  currency_symbol: string;
  user_basic_info: ObjectId;
  practitioner: ObjectId;
  organization: ObjectId;
  invited_practitioner: ObjectId[];
  created_at: Date;
  updated_at: Date;
}
