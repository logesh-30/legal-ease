import "dotenv/config";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { Service } from "./src/models/Service.js";

const data = JSON.parse(
  readFileSync(new URL("./filtered_document_services.json", import.meta.url), "utf-8")
);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Connected to MongoDB");

  const docs = data.services.map((s: any) => ({
    nameEn:        s.name_en,
    nameTa:        s.name_ta,
    descriptionEn: s.description_en,
    descriptionTa: s.description_ta,
    stepsEn:       s.steps_en,
    stepsTa:       s.steps_ta,
    documentsEn:   s.documents_en,
    documentsTa:   s.documents_ta,
    legalDetailsEn: s.legal_en,
    legalDetailsTa: s.legal_ta,
    officialPortalUrl: s.portal,
    icon:          s.emoji ?? "📄",
  }));

  const inserted = await Service.insertMany(docs, { ordered: false });
  console.log(`✅ Inserted ${inserted.length} services`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
