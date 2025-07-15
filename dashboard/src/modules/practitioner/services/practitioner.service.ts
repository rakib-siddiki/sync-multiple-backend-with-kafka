import { UserModel } from "@/modules/user/models/user.model";
import { PractitionerModel } from "../models/practitioner.model";
import mongoose from "mongoose";

// Practitioner
export const create = async (data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const practitioner = await PractitionerModel.create([data], { session });
    if (!practitioner || practitioner.length === 0) {
      throw new Error("Failed to create practitioner");
    }
    if (data.user) {
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: practitioner[0].user },
        {
          $set: {
            practitioner: practitioner[0]._id,
          },
        },
        {
          new: true,
          runValidators: true,
          session,
        }
      );
      if (!updatedUser) {
        throw new Error("User not found");
      }
    }
    await session.commitTransaction();
    return practitioner[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// PractitionerInfo, PractitionerAccount, InvitedPractitioner service functions are now imported from their respective files.

export const practitionerService = {
  create,
};
