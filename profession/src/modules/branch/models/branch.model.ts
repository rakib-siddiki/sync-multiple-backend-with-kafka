import { model, Schema} from 'mongoose';
import type { IBranch } from '../types/branch.type';

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

export const BranchModel = model<IBranch>('Branch', branchSchema);
