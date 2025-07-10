export interface IOrganizationAccount {
  _id?: string;
  legal_name: string;
  description: string;
  website: string;
  country: string;
  language: string;
  time_zone: string;
  phone_code: string;
  phone_number: string;
  customer_alias: string;
  service_alias: string;
  practitioner_alias: string;
  business_role: string;
  shop: boolean;
  secure_mode: boolean;
  delete_after: string;
  organization: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
