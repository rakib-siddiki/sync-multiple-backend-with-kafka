export interface IPractitionerAccount {
  display_name: string;
  description: string;
  website: string;
  location: string;
  country: string;
  language: string;
  time_zone: string;
  phone_code: string;
  phone_number: string;
  customer_alias: string;
  service_alias: string;
  secure_mode: boolean;
  practitioner_info: string | null; // ObjectId as string
  practitioner: string | null; // ObjectId as string
  createdAt?: Date;
  updatedAt?: Date;
}
