import type { IBranchInfo } from "@/modules/branch/types/branch-info.type";
import type { IOrganization } from "@/modules/organization/types/organization.types";
import type { IInvitedPractitioner } from "@/modules/practitioner/types/invited-practitioner.type";
import type { IPractitioner } from "@/modules/practitioner/types/practitioner.type";
import { Document, type ObjectId } from "mongoose";

export interface IUser extends Document {
  username: string;
  profile_photo_src: string;
  status: string;
  practitioner: ObjectId | null | IPractitioner;
  invitedPractitioner: ObjectId | null | IInvitedPractitioner;
  organization: ObjectId | null | IOrganization;
  branch: ObjectId | null | IBranchInfo[];
  created_at: Date;
  updated_at: Date;
}
