import type { IOrganization } from "@/modules/organization/types/organization.types";
import type { IPractitioner } from "@/modules/practitioner/types/practitioner.type";
import { Document, type ObjectId } from "mongoose";

export interface IUser extends Document {
  username: string;
  profile_photo_src: string;
  status: string;
  practitioner: ObjectId | null | IPractitioner;
  organization: ObjectId | null | IOrganization;
  createdAt: Date;
  updatedAt: Date;
}
