import { model, Schema } from "mongoose";
import { IFindProfession } from "../types/find-profession.type";

const findProfessionSchema = new Schema<IFindProfession>(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    type: {
      type: String,
      enum: ["Practitioner", "Organization"],
      required: true,
    },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", default: null },
    pracId: { type: Schema.Types.ObjectId, ref: "Practitioner", default: null },
    status: { type: String, default: "" },
    username: { type: String, required: true },
    businessUrl: { type: String, default: "" },
    practitionerName: { type: String, default: "" },
    orgName: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    category: { type: String, default: "" },
    subCategory: { type: [String], default: [] },
    listOfDegrees: { type: [String], default: [] },
    ranking: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalAppointment: { type: Number, default: 0 },
    zone: { type: [String], default: [] },
    city: { type: [String], default: [] },
    address: { type: [String], default: [] },
    areaOfPractice: { type: String, default: "" },
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
