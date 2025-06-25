import { model, Schema, Document } from 'mongoose';
import { sendBranchCreated, sendBranchUpdated, sendBranchDeleted } from '../kafka/branch-producer';

export interface IBranch extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

branchSchema.post("save", async (doc) => {
    console.log(`Branch created: ${doc.name}`);
    await sendBranchCreated(doc);
  });

branchSchema.post("findOneAndUpdate", async (doc) => {
    console.log(`Branch updated: ${doc.name}`);
    await sendBranchUpdated(doc);
  });

branchSchema.post("findOneAndDelete", async (doc) => {
    console.log(`Branch deleted: ${doc.name}`);
    await sendBranchDeleted(doc);
  });

export const BranchModel = model<IBranch>('Branch', branchSchema);
