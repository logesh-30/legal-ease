import { Schema, model } from "mongoose";

const eligibilitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    // A. Personal
    age: { type: Number, required: true, min: 1 },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    maritalStatus: { type: String, enum: ["Single", "Married", "Widow", "Divorced"], default: "Single" },
    // B. Location
    state: { type: String, default: "Tamil Nadu" },
    district: { type: String, default: "" },
    areaType: { type: String, enum: ["Rural", "Urban"], default: "Rural" },
    // C. Income
    annualIncome: { type: Number, required: true, min: 0 },
    hasIncomeCertificate: { type: Boolean, default: false },
    isBPL: { type: Boolean, default: false },
    // D. Occupation
    occupation: {
      type: String,
      required: true,
      enum: ["Farmer", "Student", "Govt Employee", "Private Employee", "Self Employed", "Unemployed", "Other"]
    },
    educationLevel: { type: String, enum: ["School", "UG", "PG", "Other", ""], default: "" },
    institutionType: { type: String, enum: ["Government", "Private", ""], default: "" },
    hasLand: { type: Boolean, default: false },
    landSize: { type: String, default: "" },
    // E. Education
    highestQualification: { type: String, default: "" },
    isCurrentlyStudying: { type: Boolean, default: false },
    // F. Social
    category: { type: String, required: true, enum: ["General", "OBC", "SC", "ST"] },
    isMinority: { type: Boolean, default: false },
    // G. Family
    familySize: { type: Number, default: 1, min: 1 },
    earningMembers: { type: Number, default: 1, min: 0 },
    // H. Special conditions (derived + explicit)
    isSeniorCitizen: { type: Boolean, default: false },
    isWidow: { type: Boolean, default: false },
    isDifferentlyAbled: { type: Boolean, default: false },
    isFarmer: { type: Boolean, default: false },
    isStudent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Eligibility = model("Eligibility", eligibilitySchema);
