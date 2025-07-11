import { PractitionerInfoModel } from "../models/practitioner-info.model";

const create = async (data: any) => {
  const info = await PractitionerInfoModel.create(data);
  return info;
};

export const practitionerInfoService = {
  create,
};
