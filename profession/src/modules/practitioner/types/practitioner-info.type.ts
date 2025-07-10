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

export interface IPractitionerInfo {
  category: string;
  sub_category: string;
  educations: IEducation[];
  field_of_practice: IFieldOfPractice[];
  certificates_or_awards: ICertificateOrAward[];
  working_history: IWorkingHistory[];
  createdAt?: Date;
  updatedAt?: Date;
}
