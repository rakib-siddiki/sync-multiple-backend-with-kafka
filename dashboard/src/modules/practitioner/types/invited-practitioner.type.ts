export type InvitedPractitionerStatus =
  | "active"
  | "pending"
  | "removed"
  | "hold";

export interface IInvitedPractitioner {
  full_name: string;
  email: string;
  status: InvitedPractitionerStatus;
  assign_permission: string | null; // ObjectId as string
  branches: string[]; // ObjectId as string[]
  user: string | null; // ObjectId as string
  practitioner: string | null; // ObjectId as string
  organization: string | null; // ObjectId as string
  join_date: Date | null;
  created_at?: Date;
  updated_at?: Date;
}
