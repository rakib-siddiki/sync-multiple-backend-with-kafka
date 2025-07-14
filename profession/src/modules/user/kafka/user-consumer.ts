
import { UserModel } from "../models/user.model";
import type { IUser } from "../types/user.type";
import { FindProfessionModel } from "@/modules/find-profession/models/find-profession.model";
import { DB_OPERATION, type TDbOperation } from "@/constant/db-operation";
import { logger } from "@/utils/logger";
import { startSession } from "mongoose";


const handleUserCreate = async (userData: IUser) => {
  const session = await startSession();
  session.startTransaction();
  try {
    const newUser = new UserModel(userData);
    const savedUser = await newUser.save({ session }).then((user) => {
      return user.populate(["organization practitioner"]);
    });

    logger.success("User created successfully:", savedUser);
    const findProfessionData = {
      _id: savedUser._id,
      status: savedUser.status,
      username: savedUser.username,
      photoUrl: savedUser.profile_photo_src,
    };

    const findProfession = await FindProfessionModel.create(
      [findProfessionData],
      { session }
    );
    logger.success("FindProfession created successfully:", findProfession);
    await session.commitTransaction();
    return savedUser;
  } catch (err) {
    await session.abortTransaction();
    logger.error("Error saving user:", err);
  } finally {
    session.endSession();
  }
};

const handleUserUpdate = async (userData: IUser) => {
  const session = await startSession();
  session.startTransaction();
  try {
    await UserModel.findOneAndUpdate({ _id: userData._id }, userData, {
      new: true,
      session,
    });
    logger.success("User updated in database:", userData._id);
    await FindProfessionModel.updateOne(
      { _id: userData._id },
      {
        ...userData,
      },
      { session }
    ).catch((err) => {
      logger.error("Error updating FindProfession:", err);
    });
    await session.commitTransaction();
    return userData;
  } catch (err) {
    await session.abortTransaction();
    logger.error("Error updating user:", err);
  } finally {
    session.endSession();
  }
};

const handleUserDelete = async (userData: IUser) => {
  const session = await startSession();
  session.startTransaction();
  try {
    await UserModel.findByIdAndDelete(userData._id, { session });
    logger.success("User deleted from database:", userData._id);
    await FindProfessionModel.deleteOne({ _id: userData._id }, { session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    logger.error("Error deleting user:", err);
  } finally {
    session.endSession();
  }
};

export const userConsumer = async (
  operation: TDbOperation,
  userData: IUser
) => {
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
