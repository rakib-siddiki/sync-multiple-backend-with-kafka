
import type { IOrganization } from "../types/organization.types";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";
import { OrganizationModel } from "../models/organization.model";
import { DB_OPERATION, type TDbOperation } from "@/constant/db-operation";
import { logger } from "@/utils/logger";
import { startSession } from "mongoose";
import { UserModel } from "@/modules/user/models/user.model";
import { FIND_PROFESSION_TYPE } from "@/modules/find-profession/constant";

const handleOrgCreate = async (orgData: IOrganization) => {
  logger.debug("Handling organization creation:", orgData);
  const session = await startSession();
  session.startTransaction();
  try {
    const [createdOrg] = await OrganizationModel.create([orgData], { session });
    if (!createdOrg) {
      logger.error("Failed to create organization:", orgData);
      return;
    }
    logger.success("Organization created successfully:", createdOrg);
    const user = await UserModel.findOneAndUpdate(
      { _id: orgData.user },
      { $set: { organization: createdOrg._id } },
      { new: true, session }
    );
    if (!user) {
      logger.error(
        `User with ID ${orgData.user} not found for organization link.`
      );
      return;
    }
    logger.success("User linked to organization successfully:", user);
    await FindProfessionModel.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        type: FIND_PROFESSION_TYPE.ORG,
        org_name: orgData.full_name,
        business_url: orgData.business_url,
        org_category: orgData.category,
        $addToSet: {
          org_sub_category: {
            $each: Array.isArray(orgData.sub_category)
              ? orgData.sub_category
              : [orgData.sub_category],
          },
        },
      },
      {
        new: true,
        session,
      }
    );
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling organization creation:", error);
  } finally {
    session.endSession();
  }
};

const handleOrgUpdate = async (orgData: IOrganization) => {
  logger.debug("Handling organization update:", orgData);
  const session = await startSession();
  session.startTransaction();
  try {
    const updatedOrg = await OrganizationModel.findOneAndUpdate(
      { _id: orgData._id },
      orgData,
      {
        new: true,
        session,
      }
    );
    if (!updatedOrg) {
      logger.error(`Organization with ID ${orgData._id} not found for update.`);
      return;
    }

    // Create or update the FindProfessionModel entry for the organization
    const updatedFindProfession = await FindProfessionModel.findOneAndUpdate(
      {
        organization: updatedOrg._id,
      },
      {
        org_name: orgData.full_name,
        business_url: orgData.business_url,
        org_category: orgData.category,
        $addToSet: {
          org_sub_category: Array.isArray(orgData.sub_category)
            ? { $each: orgData.sub_category }
            : orgData.sub_category,
        },
      },
      {
        new: true,
        session,
      }
    );
    if (!updatedFindProfession) {
      logger.error(
        `FindProfessionModel entry for organization ${orgData._id} not found for update.`
      );
      return;
    }
    logger.success("Organization updated successfully:", updatedOrg);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling organization creation:", error);
  } finally {
    session.endSession();
  }
};

const handleOrgDelete = async (orgData: IOrganization) => {
  logger.debug("Handling organization deletion:", orgData);
  const session = await startSession();
  session.startTransaction();
  try {
    const deletedOrg = await OrganizationModel.findOneAndDelete(
      { _id: orgData._id },
      { session }
    );
    if (!deletedOrg) {
      logger.error(
        `Organization with ID ${orgData._id} not found for deletion.`
      );
      return;
    }
    await UserModel.findOneAndUpdate(
      { organization: deletedOrg._id },
      { $set: { organization: null } },
      { new: true, session }
    );
    logger.success("Organization deleted successfully:", orgData._id);
    const updatedFindProfession = await FindProfessionModel.findOneAndUpdate(
      {
        organization: deletedOrg._id,
      },
      {
        $set: {
          organization: null,
          org_name: "",
          business_url: "",
          org_category: "",
        },
        $pull: {
          org_sub_category: {
            $in: Array.isArray(deletedOrg.sub_category)
              ? deletedOrg.sub_category
              : [deletedOrg.sub_category],
          },
        },
      },
      {
        new: true,
        session,
      }
    );
    if (!updatedFindProfession) {
      logger.error(
        `FindProfessionModel entry for organization ${orgData._id} not found for deletion.`
      );
      return;
    }
    logger.success(
      "removed deleted organization data form FindProfessionModel:",
      updatedFindProfession
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling organization deletion:", error);
  } finally {
    session.endSession();
  }
};


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
      logger.warn(`Unhandled operation: ${operation}`);
  }
};
