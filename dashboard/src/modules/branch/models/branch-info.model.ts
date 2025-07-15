import { model, Schema } from "mongoose";

const BranchInfoSchema = new Schema(
  {
    address: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    zip: { type: String, default: "" },
    phone_code: { type: String, default: "" },
    phone_number: { type: String, default: "" },
    open_day: {
      type: [
        {
          start_day: { type: String },
          end_day: { type: String },
          start_hour: { type: String },
          end_hour: { type: String },
        },
      ],
      default: [],
    },
    location: {
      type: {
        lat: { type: String },
        long: { type: String },
      },
      default: { lat: "", long: "" },
    },
    online_booking: { type: Boolean, default: false },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", default: null },
  },
  { timestamps: true }
);

export const BranchInfoModel = model("BranchInfo", BranchInfoSchema);
