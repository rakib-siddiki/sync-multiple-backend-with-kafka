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
  org_category: string;
  org_sub_category: string[];
  prac_category: string;
  prac_sub_category: string[];
  list_of_degrees: string;
  org_ranking: number;
  org_total_appointment: number;
  org_rating: number;
  prac_ranking: number;
  prac_rating: number;
  prac_total_appointment: number;
  zone: string[];
  city: string[];
  address: string[];
  area_of_practice: string;
}
