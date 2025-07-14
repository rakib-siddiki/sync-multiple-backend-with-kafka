import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";
import { startSession, type ClientSession } from "mongoose";
import { PractitionerInfoModel } from "../models/practitioner-info.model";
import type { IPractitionerInfo } from "../types/practitioner-info.type";
import { DB_OPERATION, type TDbOperation } from "@/constant/db-operation";
import { logger } from "@/utils/logger";

const handlePracInfoCreate = async (pracInfoData: IPractitionerInfo) => {
  const session = await startSession();
  session.startTransaction();
  try {
    const [createdPrac] = await PractitionerInfoModel.create([pracInfoData], {
      session,
    });
    if (!createdPrac) {
      logger.error("Failed to create practitioner:", pracInfoData);
      return;
    }
    logger.info(`Practitioner with ID ${createdPrac.id} created successfully.`);
    if (pracInfoData.practitioner && createdPrac) {
      const subCategories = [createdPrac.sub_category];

      createdPrac.field_of_practice.forEach((field) => {
        if (field.specialized_filed) {
          subCategories.push(field.specialized_filed);
        }
      });

      // Create or update the FindProfessionModel entry for the practitioner
      const updatedFindProfession = await FindProfessionModel.findOneAndUpdate(
        {
          practitioner: createdPrac.practitioner,
        },
        {
          $set: {
            prac_category: pracInfoData.category,
            area_of_practice: pracInfoData.area_of_practice,
            list_of_degrees: pracInfoData.list_of_degrees,
          },
          $addToSet: {
            prac_sub_category: { $each: subCategories },
          },
        },
        {
          session,
        }
      );
      if (!updatedFindProfession) {
        logger.error(
          `Failed to update FindProfessionModel for practitioner info ID ${createdPrac._id}.`
        );
      }
      logger.info(
        `FindProfessionModel updated for practitioner info ID ${createdPrac._id}.`
      );
    }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling practitioner creation:", error);
  } finally {
    session.endSession();
  }
};

const handlePracInfoUpdate = async (pracInfoData: IPractitionerInfo) => {
  const session = await startSession();
  session.startTransaction();
  try {
    const updatedPrac = await PractitionerInfoModel.findOneAndUpdate(
      { _id: pracInfoData._id },
      pracInfoData,
      {
        session,
      }
    );
    if (updatedPrac) {
      const subCategories = [updatedPrac.sub_category];

      updatedPrac.field_of_practice.forEach((field) => {
        if (field.specialized_filed) {
          subCategories.push(field.specialized_filed);
        }
      });

      console.log("🚀 ~ subCategories:", subCategories);

      // Create or update the FindProfessionModel entry for the practitioner
      const updatedFindProfession = await FindProfessionModel.findOneAndUpdate(
        {
          practitioner: updatedPrac.practitioner,
        },
        {
          $set: {
            prac_category: pracInfoData.category,
            area_of_practice: pracInfoData.area_of_practice,
            list_of_degrees: pracInfoData.list_of_degrees,
          },
          $addToSet: {
            prac_sub_category: { $each: subCategories },
          },
        },
        {
          session,
        }
      );
      if (!updatedFindProfession) {
        logger.error(
          `Failed to update FindProfessionModel for practitioner info ID ${updatedPrac._id}.`
        );
      }
      logger.info(
        `FindProfessionModel updated for practitioner info ID ${updatedPrac._id}.`
      );
    }
    await session.commitTransaction();
    logger.info(
      `Practitioner with ID ${pracInfoData.toObject().id} updated successfully.`
    );
  } catch (error) {
    await session.abortTransaction();
    logger.error("Error handling practitioner creation:", error);
  } finally {
    session.endSession();
  }
};

export const handlePracInfoDelete = async ({
  practitionerInfoId,
  practitionerId,
  session = null,
}: {
  practitionerInfoId?: string;
  practitionerId?: string;
  session: ClientSession | null;
}) => {
  const isSessionProvided = session !== null;
  if (!isSessionProvided) {
    session = await startSession();
    session.startTransaction();
  }
  try {
    const deletedPracInfo = await PractitionerInfoModel.findOneAndDelete(
      { $or: [{ _id: practitionerInfoId }, { practitioner: practitionerId }] },
      {
        session,
      }
    );

    if (!deletedPracInfo) {
      logger.error(
        `No practitioner info found for practitioner ID: ${practitionerId}`
      );
      return;
    }
    logger.info(
      `Practitioner info deleted successfully: ${deletedPracInfo._id}`
    );
    const subCategories = [deletedPracInfo.sub_category];

    deletedPracInfo.field_of_practice.forEach((field) => {
      if (field.specialized_filed) {
        subCategories.push(field.specialized_filed);
      }
    });
    logger.debug("Subcategories to remove:", subCategories);

    // Remove the practitioner info from FindProfessionModel
    const updatedFindProfession = await FindProfessionModel.findOneAndUpdate(
      {
        practitioner: deletedPracInfo.practitioner,
      },
      {
        $unset: {
          practitioner_name: "",
          prac_category: "",
          area_of_practice: "",
          list_of_degrees: "",
          practitioner: null,
        },
        $pull: {
          prac_sub_category: { $in: subCategories },
        },
      },
      {
        new: true,
        session,
      }
    );
    if (!updatedFindProfession) {
      logger.error(
        `Failed to update FindProfessionModel for deleted practitioner info ID ${deletedPracInfo._id}`
      );
      return;
    }
    logger.success(
      "FindProfessionModel updated successfully for deleted practitioner info:",
      updatedFindProfession
    );
  } catch (error) {
    throw new Error(
      `Error handling practitioner info deletion for practitioner ID ${practitionerId}: ${
        (error as Error).message
      }`
    );
  }
};

export const pracInfoConsumer = async (
  operation: TDbOperation,
  pracInfoData: IPractitionerInfo
) => {
  switch (operation) {
    case DB_OPERATION.INSERT:
      await handlePracInfoCreate(pracInfoData);
      break;
    case DB_OPERATION.UPDATE:
      await handlePracInfoUpdate(pracInfoData);
      break;
    case DB_OPERATION.DELETE:
      return;
    default:
      console.warn(`Unhandled operation: ${operation}`);
  }
};
