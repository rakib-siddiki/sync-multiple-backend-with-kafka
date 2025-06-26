import { TOPICS } from "@/constant/topics";
import { UserModel } from "../models/user.model";
import type { IUser } from "../types/user.type";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";
import { Types } from "mongoose";

export type TUserTopic = (typeof TOPICS.USER)[keyof typeof TOPICS.USER];

const handleUserCreate = async (userData: IUser) => {
  try {
    const newUser = new UserModel(userData);
    const savedUser = await newUser.save();
    console.log(" ✅ User saved to database:", savedUser._id);
   const findProfession = await FindProfessionModel.create({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
    });
   console.log("🚀 ~ findProfession:", findProfession)
  } catch (err) {
    console.error("❌ Error saving user:", err);
  }
};

const handleUserUpdate = async (userData: IUser) => {
  try {
    await UserModel.findOneAndUpdate({ _id: userData._id }, userData, {
      new: true,
    });
    console.log(" ✅ User updated in database:", userData._id);
    await FindProfessionModel.updateOne(
      { _id: userData._id },
      { name: userData.name, email: userData.email }
    ).catch((err) => {
      console.error(" ❌ Error updating FindProfession:", err);
    });
  } catch (err) {
    console.error("❌ Error updating user:", err);
  }
};

const handleUserDelete = async (userData: IUser) => {
  try {
    await UserModel.findByIdAndDelete(userData._id);
    console.log(" ✅ User deleted from database:", userData._id);
    await FindProfessionModel.deleteOne({ _id: userData._id });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
  }
};

export const userConsumer = async (topic: TUserTopic, userData: IUser) => {
  switch (topic) {
    case TOPICS.USER.CREATE:
      await handleUserCreate(userData);
      break;
    case TOPICS.USER.UPDATE:
      await handleUserUpdate(userData);
      break;
    case TOPICS.USER.DELETE:
      await handleUserDelete(userData);
      break;
    default:
      console.warn(`Unhandled topic: ${topic}`);
  }
};
