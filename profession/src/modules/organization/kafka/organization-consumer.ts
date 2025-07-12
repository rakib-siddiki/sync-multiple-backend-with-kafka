import { TOPICS } from "@/constant/topics";
import type { IOrganization } from "../types/organization.types";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";
import { OrganizationModel } from "../models/organization.model";
import { DB_OPERATION, type TDbOperation } from "@/constant/db-operation";

const handleOrgCreate = async (orgData: IOrganization) => {
  try {
    await OrganizationModel.create(orgData);
  } catch (error) {
    console.error("Error handling organization creation:", error);
  }
};

const handleOrgUpdate = async (orgData: IOrganization) => {
  try {
    const updatedOrg = await OrganizationModel.findOneAndUpdate(
      { _id: orgData._id },
      orgData,
      {
        new: true,
      }
    );
    if (!updatedOrg) {
      console.warn(`Organization with ID ${orgData._id} not found for update.`);
      return;
    }

    // Create or update the FindProfessionModel entry for the organization
    await FindProfessionModel.findOneAndUpdate(
      {
        organization: updatedOrg._id,
      },
      {
        orgName: orgData.full_name,
        business_url: orgData.business_url,
        category: orgData.category,
        $addToSet: {
          sub_category: {
            $each: Array.isArray(orgData.sub_category)
              ? orgData.sub_category
              : [orgData.sub_category],
          },
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  } catch (error) {
    console.error("Error handling organization creation:", error);
  }
};

const handleOrgDelete = async (orgData: IOrganization) => {
  try {
    await OrganizationModel.findOneAndDelete({ _id: orgData._id });
  } catch (error) {
    console.error("Error handling organization deletion:", error);
  }
};

export type TOrgTopic = (typeof TOPICS.ORG)[keyof typeof TOPICS.ORG];

export const orgConsumer = async (
  operation: TDbOperation,
  orgData: IOrganization
) => {
  switch (operation) {
    case DB_OPERATION.INSERT:
      await handleOrgCreate(orgData);
      break;
    case DB_OPERATION.UPDATE:
      await handleOrgUpdate(orgData);
      break;
    case DB_OPERATION.DELETE:
      await handleOrgDelete(orgData);
      break;
    default:
      console.warn(`Unhandled operation: ${operation}`);
  }
};
