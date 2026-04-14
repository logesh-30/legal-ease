import { Schema, model } from "mongoose";

const officeSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    workingHours: { type: String, required: true },
    servicesOffered: [{ type: String, required: true }]
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Office = model("Office", officeSchema);
