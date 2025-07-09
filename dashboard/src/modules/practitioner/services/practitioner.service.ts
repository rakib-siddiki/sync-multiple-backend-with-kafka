import { PractitionerModel } from "../models/practitioner.model";
import { PractitionerInfoModel } from "../models/practitioner-info.model";
import { PractitionerAccountModel } from "../models/practitioner-account.model";
import { InvitedPractitionerModel } from "../models/invited-practitioner.model";

// Practitioner
export const create = async (data: any) => {
  const practitioner = await PractitionerModel.create(data);
  return practitioner;
};

// PractitionerInfo
export const createPractitionerInfo = async (data: any) => {
  const info = await PractitionerInfoModel.create(data);
  return info;
};

// PractitionerAccount
export const createPractitionerAccount = async (data: any) => {
  const account = await PractitionerAccountModel.create(data);
  return account;
};

// InvitedPractitioner
export const createInvitedPractitioner = async (data: any) => {
  const invited = await InvitedPractitionerModel.create(data);
  return invited;
};

export const practitionerService = {
  create,
  createPractitionerInfo,
  createPractitionerAccount,
  createInvitedPractitioner,
};
