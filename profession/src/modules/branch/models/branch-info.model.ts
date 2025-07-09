import { model, Schema } from "mongoose";

const BranchInfoSchema = new Schema(
  {
    practitioner: { type: Schema.Types.ObjectId, ref: "Practitioner", default: null },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", default: null },
    address: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    zip: { type: String, default: "" },
  },
  { timestamps: true }
);

export const BranchInfoModel = model("BranchInfo", BranchInfoSchema);
