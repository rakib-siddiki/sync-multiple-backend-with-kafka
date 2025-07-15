export interface IBranchInfo extends Document {
  _id: string;
  address: string;
  state: string;
  city: string;
  organization: string | null;
  practitioner: string | null;
  user: string | null;
  branch: string | null;
  created_at?: Date;
  updated_at?: Date;
}
