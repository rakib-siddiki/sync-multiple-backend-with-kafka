export interface IPractitioner {
  full_name: string;
  username: string;
  email: string;
  currency_code: string;
  currency_symbol: string;
  practitioner_info: string | null; // ObjectId as string
  practitioner_account: string | null; // ObjectId as string
  user: string | null; // ObjectId as string
  branding: string | null; // ObjectId as string
  created_at?: Date;
  updated_at?: Date;
}
