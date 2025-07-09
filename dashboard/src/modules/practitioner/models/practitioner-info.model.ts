import { model, Schema, Types } from "mongoose";

const PractitionerInfoSchema = new Schema(
  {
    category: { type: String, default: "" },
    sub_category: { type: String, default: "" },
    educations: {
      type: [
        {
          country: String,
          degree: String,
          institution: String,
          subject: String,
          year: Number,
        },
      ],
      default: [],
    },
    field_of_practice: {
      type: [
        {
          specialized_filed: String,
          experience: String,
          designation: String,
        },
      ],
      default: [],
    },
    certificates_or_awards: {
      type: [
        {
          title: String,
          issued_by: String,
          receiving_year: Number,
          img: String,
        },
      ],
      default: [],
    },
    working_history: {
      type: [
        {
          role: String,
          organization: String,
          start_date: String,
          end_date: String,
        },
      ],
      default: [],
    },
    area_of_practice: { type: String, default: "" },
    list_of_degrees: { type: String, default: "" },
    practitioner: { type: Types.ObjectId, default: null, ref: "Practitioner" },
  },
  { timestamps: true }
);

PractitionerInfoSchema.index({ practitioner: 1 });

export const PractitionerInfoModel = model("PractitionerInfo", PractitionerInfoSchema);
