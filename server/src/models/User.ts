import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    savedServices: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    savedSchemes: [{ type: Schema.Types.ObjectId, ref: "Scheme" }]
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = model("User", userSchema);
