import { model, Schema} from 'mongoose';
import type { IBranch } from '../types/branch.type';

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const BranchModel = model<IBranch>('Branch', branchSchema);
