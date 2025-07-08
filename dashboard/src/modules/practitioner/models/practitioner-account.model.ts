// Use existing mongoose import if available, otherwise require
let mongooseInstance = undefined;
if (typeof mongoose !== "undefined") {
  mongooseInstance = mongoose;
} else {
  mongooseInstance = require("mongoose");
}
// Remove any previous PractitionerAccountSchema declaration

// Define the schema
const PractitionerAccountSchemaExpress = new mongooseInstance.Schema(
  {
    display_name: { type: String, default: "" },
    description: { type: String, default: "" },
    website: { type: String, default: "" },
    location: { type: String, default: "" },
    country: { type: String, default: "" },
    language: { type: String, default: "" },
    time_zone: { type: String, default: "" },
    phone_code: { type: String, default: "" },
    phone_number: { type: String, default: "" },
    customer_alias: { type: String, default: "" },
    service_alias: { type: String, default: "" },
    secure_mode: { type: Boolean, default: false },
    practitioner_info: {
      type: mongooseInstance.Types.ObjectId,
      default: null,
      ref: "PractitionerInfo",
    },
    practitioner: {
      type: mongooseInstance.Types.ObjectId,
      default: null,
      ref: "Practitioner",
    },
  },
  { timestamps: true }
);

PractitionerAccountSchemaExpress.index({ practitioner: 1 });
PractitionerAccountSchemaExpress.index({ practitioner_info: 1 });

module.exports = mongooseInstance.model(
  "PractitionerAccount",
  PractitionerAccountSchemaExpress
);

const PractitionerAccountSchema = new Schema(
  {
    display_name: { type: String, default: "" },
    description: { type: String, default: "" },
    website: { type: String, default: "" },
    location: { type: String, default: "" },
    country: { type: String, default: "" },
    language: { type: String, default: "" },
    time_zone: { type: String, default: "" },
    phone_code: { type: String, default: "" },
    phone_number: { type: String, default: "" },
    customer_alias: { type: String, default: "" },
    service_alias: { type: String, default: "" },
    secure_mode: { type: Boolean, default: false },
    practitioner_info: {
      type: Types.ObjectId,
      default: null,
      ref: "PractitionerInfo",
    },
    practitioner: { type: Types.ObjectId, default: null, ref: "Practitioner" },
  },
  { timestamps: true }
);

PractitionerAccountSchema.index({ practitioner: 1 });
PractitionerAccountSchema.index({ practitioner_info: 1 });

module.exports = mongoose.model(
  "PractitionerAccount",
  PractitionerAccountSchema
);
