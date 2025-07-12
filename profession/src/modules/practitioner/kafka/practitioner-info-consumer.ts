import { TOPICS } from "@/constant/topics";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";

import mongoose from "mongoose";
import { PractitionerInfoModel } from "../models/practitioner-info.model";
import type { IPractitionerInfo } from "../types/practitioner-info.type";

const handlePracInfoCreate = async (pracInfoData: IPractitionerInfo) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const createdPrac = await PractitionerInfoModel.create([pracInfoData], {
      session,
    });
    if (pracInfoData.practitioner && createdPrac.length > 0) {
      const subCategories = [createdPrac[0].sub_category];

      createdPrac[0].field_of_practice.forEach((field) => {
        if (field.specialized_filed) {
          subCategories.push(field.specialized_filed);
        }
      });

      // Create or update the FindProfessionModel entry for the practitioner
      await FindProfessionModel.findOneAndUpdate(
        {
          practitioner: createdPrac[0].practitioner,
        },
        {
          category: pracInfoData.category,
          sub_category: subCategories,
          area_of_practice: pracInfoData.area_of_practice,
          list_of_degrees: pracInfoData.list_of_degrees,
        },
        {
          new: true,
          runValidators: true,
          session,
        }
      );
    }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error("Error handling practitioner creation:", error);
  } finally {
    session.endSession();
  }
};

const handlePracInfoUpdate = async (pracInfoData: IPractitionerInfo) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updatedPrac = await PractitionerInfoModel.findOneAndUpdate(
      { _id: pracInfoData._id },
      pracInfoData,
      {
        new: true,
        runValidators: true,
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

      // Create or update the FindProfessionModel entry for the practitioner
      await FindProfessionModel.findOneAndUpdate(
        {
          practitioner: updatedPrac.practitioner,
        },
        {
          category: pracInfoData.category,
          sub_category: subCategories,
          area_of_practice: pracInfoData.area_of_practice,
          list_of_degrees: pracInfoData.list_of_degrees,
        },
        {
          new: true,
          runValidators: true,
          session,
        }
      );
    }
    await session.commitTransaction();
    console.log(
      `Practitioner with ID ${pracInfoData.toObject().id} updated successfully.`
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Error handling practitioner creation:", error);
  } finally {
    session.endSession();
  }
};

const handlePracInfoDelete = async (pracInfoData: IPractitionerInfo) => {
  try {
    await PractitionerInfoModel.findOneAndDelete({ _id: pracInfoData._id });
  } catch (error) {
    console.error("Error handling practitioner deletion:", error);
  }
};

export type TPracTopic =
  (typeof TOPICS.PRAC_INFO)[keyof typeof TOPICS.PRAC_INFO];

export const pracInfoConsumer = async (
  topic: TPracTopic,
  pracInfoData: IPractitionerInfo
) => {
  switch (topic) {
    case TOPICS.PRAC_INFO.CREATE:
      await handlePracInfoCreate(pracInfoData);
      break;
    case TOPICS.PRAC_INFO.UPDATE:
      await handlePracInfoUpdate(pracInfoData);
      break;
    case TOPICS.PRAC_INFO.DELETE:
      await handlePracInfoDelete(pracInfoData);
      break;
    default:
      console.warn(`Unhandled topic: ${topic}`);
  }
};
