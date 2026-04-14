import { Schema, model } from "mongoose";

const schemeSchema = new Schema(
  {
    nameEn: { type: String, required: true },
    nameTa: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Education", "Business", "Financial", "Health", "Agriculture"]
    },
    eligibilityEn: { type: String, required: true },
    eligibilityTa: { type: String, required: true },
    benefitsEn: { type: String, required: true },
    benefitsTa: { type: String, required: true },
    howToApplyEn: { type: String, required: true },
    howToApplyTa: { type: String, required: true },
    officialLink: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Scheme = model("Scheme", schemeSchema);
