export interface IOrganization {
  _id?: string;
  full_name: string;
  business_url: string;
  category: string;
  sub_category: string;
  email: string;
  currency_code: string;
  currency_symbol: string;
  organization_account: string | null;
  user: string | null;
  branch: string | null;
  created_at?: Date;
  updated_at?: Date;
}
