import { OrganizationAccountModel } from "../models/organization-account.model";
import type { IOrganizationAccount } from "../types/organization-account.type";

const create = async (data: IOrganizationAccount) => {
  const organization = await OrganizationAccountModel.create(data);
  return organization;
};

export const orgAccountService = {
  create,
};
