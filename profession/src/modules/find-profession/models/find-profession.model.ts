import { model, Schema } from "mongoose";
import { IFindProfession } from "../types/find-profession.type";

const findProfessionSchema = new Schema<IFindProfession>(
  {
    _id: { type: Schema.Types.ObjectId },
    type: {
      type: String,
      enum: ["Practitioner", "Organization"],
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    practitioner: {
      type: Schema.Types.ObjectId,
      ref: "Practitioner",
      default: null,
    },
    status: { type: String, default: "" },
    username: { type: String },
    business_url: { type: String, default: "" },
    practitioner_name: { type: String, default: "" },
    org_name: { type: String, default: "" },
    photo_url: { type: String, default: "" },
    category: { type: String, default: "" },
    sub_category: { type: [String], default: [] },
    list_of_degrees: { type: [String], default: [] },
    ranking: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    total_appointment: { type: Number, default: 0 },
    zone: { type: [String], default: [] },
    city: { type: [String], default: [] },
    address: { type: [String], default: [] },
    area_of_practice: { type: String, default: "" },
  },
  {
    timestamps: true,
    _id: false, // Disable automatic _id generation
  }
);
findProfessionSchema.index({ type: 1 });
findProfessionSchema.index({ username: 1 });
findProfessionSchema.index({ organization: 1 });
findProfessionSchema.index({ practitioner: 1 });

export const FindProfessionModel = model(
  "FindProfession",
  findProfessionSchema
);
