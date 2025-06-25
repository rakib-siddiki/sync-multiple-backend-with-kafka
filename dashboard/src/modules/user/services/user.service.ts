import { UserModel } from "../models/user.model";
import { CreateUserInput, UpdateUserInput } from "../validators/user.validate";

export const createUser = async (input: CreateUserInput) => {
  const user = await UserModel.create(input);
  return user;
};

export const getAllUsers = async () => {
  return UserModel.find();
};

export const updateUser = async (userId: string, input: UpdateUserInput) => {
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
