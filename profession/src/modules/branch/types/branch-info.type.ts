export interface IBranchInfo {
  address: string;
  state: string;
  city: string;
  zip: string;
  phone_code: string;
  phone_number: string;
  open_day: {
    start_day: string;
    end_day: string;
    start_hour: string;
    end_hour: string;
  }[];
  location: {
    lat: string;
    long: string;
  };
  online_booking: boolean;
  organization: string | null;
  practitioner: string | null;
}
