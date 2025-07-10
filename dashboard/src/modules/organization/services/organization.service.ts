import { OrganizationModel } from "../models/organization.model";
import type { IOrganization } from "../types/organization.type";

const create = async (data: IOrganization) => {
  const organization = await OrganizationModel.create(data);
  return organization;
};

export const organizationService = {
  create,
};
