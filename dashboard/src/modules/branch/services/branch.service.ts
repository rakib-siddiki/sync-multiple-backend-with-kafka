import { BranchModel } from '../models/branch.model';
import { CreateBranchInput, UpdateBranchInput } from '../validators/branch.validator';

export const createBranch = async (input: CreateBranchInput) => {
  const branch = await BranchModel.create(input);
  return branch;
};

export const getBranchById = async (id: string) => {
  return await BranchModel.findById(id);
};

export const getAllBranches = async () => {
  return await BranchModel.find().sort({ createdAt: -1 });
};

export const updateBranch = async (id: string, input: UpdateBranchInput) => {
  return await BranchModel.findOneAndUpdate(
    { _id: id },
    { $set: input },
    { new: true, runValidators: true }
  );
};

export const deleteBranch = async (id: string) => {
  const result = await BranchModel.findOneAndDelete({ _id: id });
  return !!result;
};
