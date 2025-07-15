import { InvitedPractitionerModel } from "../models/invited-practitioner.model";

const create = async (data: any) => {
  const invited = await InvitedPractitionerModel.create(data);
  return invited;
};

export const invitedPractitionerService = {
  create,
};
