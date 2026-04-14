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
    eligibilityRules: {
      ageMin: { type: Number },
      ageMax: { type: Number },
      incomeMax: { type: Number },
      categories: [{ type: String, enum: ["General", "OBC", "SC", "ST"] }],
      occupations: [{ type: String }],
      genders: [{ type: String, enum: ["male", "female", "other"] }],
      states: [{ type: String }],
      tags: [{ type: String, enum: ["student", "farmer", "seniorCitizen", "differentlyAbled"] }]
    },
    benefitsEn: { type: String, required: true },
    benefitsTa: { type: String, required: true },
    howToApplyEn: { type: String, required: true },
    howToApplyTa: { type: String, required: true },
    officialLink: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Scheme = model("Scheme", schemeSchema);
