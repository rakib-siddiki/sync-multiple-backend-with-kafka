import type { ObjectId } from "mongoose";

export interface IFindProfession {
  _id: ObjectId;
  type: "Practitioner" | "Organization";
  organization: ObjectId | null;
  practitioner: ObjectId | null;
  status?: string;
  username: string;
  business_url: string;
  practitioner_name: string;
  org_name: string;
  photo_url?: string;
  category: string;
  sub_category: string[];
  list_of_degrees: string[];
  ranking: number;
  rating: number;
  total_appointment: number;
  zone: string[];
  city: string[];
  address: string[];
  area_of_practice: string;
}
