import { TOPICS } from "@/constant/topics";
import { UserModel } from "../models/user.model";
import type { IUser } from "../types/user.type";

export type TUserTopic = (typeof TOPICS.USER)[keyof typeof TOPICS.USER];

const handleUserCreate = async (userData: IUser) => {
  try {
    const newUser = new UserModel(userData);
    await newUser.save();
    console.log("User saved to database:", newUser);
  } catch (err) {
    console.error("Error saving user:", err);
  }
};

const handleUserUpdate = async (userData: IUser) => {
  try {
    await UserModel.findByIdAndUpdate(userData._id, userData, { new: true });
    console.log("User updated in database:", userData._id);
  } catch (err) {
    console.error("Error updating user:", err);
  }
};

const handleUserDelete = async (userData: IUser) => {
  try {
    await UserModel.findByIdAndDelete(userData._id);
    console.log("User deleted from database:", userData._id);
  } catch (err) {
    console.error("Error deleting user:", err);
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
