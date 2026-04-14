import { Schema, model } from "mongoose";
const eligibilitySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    age: { type: Number, required: true, min: 1 },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    annualIncome: { type: Number, required: true, min: 0 },
    occupation: {
        type: String,
        required: true,
        enum: ["Farmer", "Student", "Salaried", "Self Employed", "Unemployed", "Other"]
    },
    category: { type: String, required: true, enum: ["General", "OBC", "SC", "ST"] },
    state: { type: String, default: "Tamil Nadu" },
    isStudent: { type: Boolean, default: false },
    isFarmer: { type: Boolean, default: false },
    isSeniorCitizen: { type: Boolean, default: false },
    isDifferentlyAbled: { type: Boolean, default: false }
}, { timestamps: true });
export const Eligibility = model("Eligibility", eligibilitySchema);
