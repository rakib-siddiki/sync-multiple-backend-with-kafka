import { TOPICS } from "@/constant/topics";
import type { IOrganization } from "../types/organization.types";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";

const handleOrgCreate = async (orgData: IOrganization) => {
  try {
    const findProfession = await FindProfessionModel.findOneAndUpdate(
      {
        organization: orgData._id,
      },
      {
        organization: orgData._id,
        orgName: orgData.full_name,
        business_url: orgData.business_url,
        category: orgData.category,
        sub_category: orgData.sub_category,
        user: orgData.user,
        branch: orgData.branch,
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

const handleOrgUpdate = async (orgData: IOrganization) => {};

const handleOrgDelete = async (orgData: IOrganization) => {};

export type TOrgTopic = (typeof TOPICS.ORG)[keyof typeof TOPICS.ORG];

export const orgConsumer = async (topic: TOrgTopic, orgData: IOrganization) => {
  switch (topic) {
    case TOPICS.ORG.CREATE:
      await handleOrgCreate(orgData);
      break;
    case TOPICS.ORG.UPDATE:
      await handleOrgUpdate(orgData);
      break;
    case TOPICS.ORG.DELETE:
      await handleOrgDelete(orgData);
      break;
    default:
      console.warn(`Unhandled topic: ${topic}`);
  }
};
