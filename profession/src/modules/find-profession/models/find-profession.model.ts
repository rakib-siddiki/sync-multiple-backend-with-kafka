import { model, Schema } from "mongoose";

const findProfessionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    branch: [{ type: Schema.Types.ObjectId, ref: "Branch" }],
  },
  {
    timestamps: true,
    _id: false, // Disable automatic _id generation
  }
);

export const FindProfessionModel = model(
  "FindProfession",
  findProfessionSchema
);
