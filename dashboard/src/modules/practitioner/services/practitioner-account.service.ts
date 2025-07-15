import { PractitionerAccountModel } from "../models/practitioner-account.model";

const create = async (data: any) => {
  const account = await PractitionerAccountModel.create(data);
  return account;
};

export const practitionerAccountService = {
  create,
};
