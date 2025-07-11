import type { Document, ObjectId } from "mongoose";

export interface IEducation {
  country: string;
  degree: string;
  institution: string;
  subject: string;
  year: number;
}

export interface IFieldOfPractice {
  specialized_filed: string;
  experience: string;
  designation: string;
}

export interface ICertificateOrAward {
  title: string;
  issued_by: string;
  receiving_year: number;
  img: string;
}

export interface IWorkingHistory {
  role: string;
  organization: string;
  start_date: string;
  end_date: string;
}

export interface IPractitionerInfo extends Document {
  _id: string; // ObjectId as string
  category: string;
  sub_category: string;
  educations: IEducation[];
  field_of_practice: IFieldOfPractice[];
  certificates_or_awards: ICertificateOrAward[];
  working_history: IWorkingHistory[];
  area_of_practice: string;
  list_of_degrees: string;
  created_at?: Date;
  updated_at?: Date;
  practitioner: ObjectId | null; // ObjectId as string
}
