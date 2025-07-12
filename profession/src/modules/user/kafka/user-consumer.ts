import { TOPICS } from "@/constant/topics";
import { UserModel } from "../models/user.model";
import type { IUser } from "../types/user.type";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";
import { OrganizationModel } from "@/modules/organization/models/organization.model";
import { DB_OPERATION, type TDbOperation } from "@/constant/db-operation";

export type TUserTopic = (typeof TOPICS.USER)[keyof typeof TOPICS.USER];

const handleUserCreate = async (userData: IUser) => {
  try {
    const newUser = new UserModel(userData);
    const savedUser = await newUser.save().then((user) => {
      return user.populate(["organization practitioner"]);
    });
    await OrganizationModel.updateOne(
      { _id: savedUser.organization },
      { $addToSet: { users: savedUser._id } }
    );
    console.log(" ✅ User saved to database:", savedUser._id);
    const findProfessionData = {
      _id: savedUser._id,
      type: savedUser.organization ? "Organization" : "Practitioner",
      organization: savedUser.organization,
      practitioner: savedUser.practitioner,
      status: savedUser.status,
      username: savedUser.username,
      photoUrl: savedUser.profile_photo_src,
    };

    const findProfession = await FindProfessionModel.create(findProfessionData);
    console.log("🚀 ~ findProfession:", findProfession);
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
      {
        ...userData,
      }
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

export const userConsumer = async (operation: TDbOperation, userData: IUser) => {
  switch (operation) {
    case DB_OPERATION.INSERT:
      await handleUserCreate(userData);
      break;
    case DB_OPERATION.UPDATE:
      await handleUserUpdate(userData);
      break;
    case DB_OPERATION.DELETE:
      await handleUserDelete(userData);
      break;
    default:
      console.warn(`Unhandled operation: ${operation}`);
  }
};
