import { UserModel } from '@/modules/user/models/user.model';
import { BranchModel } from '../models/branch.model';
import { CreateBranchInput, UpdateBranchInput } from '../validators/branch.validator';

export const createBranch = async (input: CreateBranchInput) => {
  const user = await UserModel.findById(input.userId);
  if (!user) {
    throw new Error('User not found');
  }
  const branch = await BranchModel.create(input);
  if (!branch) {
    throw new Error('Failed to create branch');
  }
  await UserModel.updateOne(
    { _id: input.userId },
    { $addToSet: { branch: branch._id } }
  ).catch((err) => {
    console.error('Error updating user with new branch:', err);
  });
  return branch;
};

export const getBranchById = async (id: string) => {
  return await BranchModel.findById(id);
};

export const getAllBranches = async () => {
  return await BranchModel.find().sort({ createdAt: -1 });
};

export const updateBranch = async (id: string, input: UpdateBranchInput) => {
  const updated = await BranchModel.findOneAndUpdate(
    { _id: id },
    { $set: input },
    { new: true, runValidators: true }
  );
  if (!updated) {
    throw new Error('Branch not found or update failed');
  }
  await UserModel.updateOne(
    { _id: updated.userId },
    { $addToSet: { branch: updated._id } }
  ).catch((err) => {
    console.error('Error updating user with updated branch:', err);
  });
  return updated;
};

export const deleteBranch = async (id: string) => {
  const result = await BranchModel.findByIdAndRemove(id);
  if (!result) {
    throw new Error('Branch not found or delete failed');
  }
  await UserModel.updateOne(
    {  _id: result.userId },
    { $pull: { branch: id } }
  ).catch((err) => {
    console.error('Error updating user after branch deletion:', err);
  });
  return !!result;
};
