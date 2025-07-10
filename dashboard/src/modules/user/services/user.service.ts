import { OrganizationModel } from "@/modules/organization/models/organization.model";
import { UserModel } from "../models/user.model";
import mongoose from "mongoose";

export const createUser = async (input: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const isValidOrganization = await OrganizationModel.findById(
      input.organization
    ).session(session);
    if (!isValidOrganization) {
      throw new Error("Invalid organization ID");
    }
    const user = await UserModel.create([input], { session });
    if (!user || !user[0]) {
      throw new Error("User creation failed");
    }
    await OrganizationModel.updateOne(
      { _id: user[0].organization },
      { $set: { user: user[0]._id } },
      { new: true, upsert: true, session }
    );
    await session.commitTransaction();
    return user[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getAllUsers = async () => {
  return UserModel.find();
};

export const updateUser = async (userId: string, input: any) => {
  console.log("🚀 ~ input:", input);
  const user = await UserModel.findOneAndUpdate(
    { _id: userId },
    { $set: input },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const getUserById = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const deleteUser = async (userId: string) => {
  const user = await UserModel.findOneAndDelete({ _id: userId });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};
