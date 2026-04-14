import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    savedServices: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    savedSchemes: [{ type: Schema.Types.ObjectId, ref: "Scheme" }],
    eligibilityProfile: {
      age: { type: Number, min: 1 },
      gender: { type: String, enum: ["male", "female", "other"] },
      annualIncome: { type: Number, min: 0 },
      occupation: { type: String },
      category: { type: String, enum: ["General", "OBC", "SC", "ST"] },
      state: { type: String, default: "Tamil Nadu" },
      specialConditions: {
        student: { type: Boolean, default: false },
        farmer: { type: Boolean, default: false },
        seniorCitizen: { type: Boolean, default: false },
        differentlyAbled: { type: Boolean, default: false }
      }
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = model("User", userSchema);
