import { Schema, model } from "mongoose";

const serviceSchema = new Schema(
  {
    nameEn: { type: String, required: true },
    nameTa: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    descriptionTa: { type: String, required: true },
    stepsEn: [{ type: String, required: true }],
    stepsTa: [{ type: String, required: true }],
    documentsEn: [{ type: String, required: true }],
    documentsTa: [{ type: String, required: true }],
    legalDetailsEn: { type: String, required: true },
    legalDetailsTa: { type: String, required: true },
    officialPortalUrl: { type: String, required: true },
    icon: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Service = model("Service", serviceSchema);
