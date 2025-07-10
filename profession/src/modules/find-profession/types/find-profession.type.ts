import type { ObjectId } from "mongoose";

export interface IFindProfession {
  _id: ObjectId;
  type: "Practitioner" | "Organization";
  organization: ObjectId | null;
  practitioner: ObjectId | null;
  status?: string;
  username: string;
  businessUrl: string;
  practitionerName: string;
  orgName: string;
  photoUrl?: string;
  category: string;
  subCategory: string[];
  listOfDegrees: string[];
  ranking: number;
  rating: number;
  totalAppointment: number;
  zone: string[];
  city: string[];
  address: string[];
  areaOfPractice: string;
}
