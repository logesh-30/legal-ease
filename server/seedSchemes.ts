import "dotenv/config";
import mongoose from "mongoose";
import { Scheme } from "./src/models/Scheme.js";
import { readFileSync } from "fs";
const data = JSON.parse(readFileSync(new URL("./india_government_schemes_2026.json", import.meta.url), "utf-8"));

// Map JSON categories → Scheme model enum
const categoryMap: Record<string, string> = {
  Agriculture:     "Agriculture",
  Education:       "Education",
  Business:        "Business",
  Financial:       "Financial",
  Health:          "Health",
  Housing:         "Financial",
  Women:           "Financial",
  Pension:         "Financial",
  Insurance:       "Financial",
  Employment:      "Business",
  "Skill Development": "Education",
  Food:            "Financial",
  Sanitation:      "Health",
  Infrastructure:  "Financial",
  Energy:          "Financial",
  Technology:      "Education",
  "Social Welfare": "Financial",
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Connected to MongoDB");

  const docs = data.schemes.map((s) => ({
    nameEn:        s.name_en,
    nameTa:        s.name_ta,
    category:      categoryMap[s.category] ?? "Financial",
    eligibilityEn: s.eligibility_en,
    eligibilityTa: s.eligibility_ta,
    benefitsEn:    s.benefits_en,
    benefitsTa:    s.benefits_ta,
    howToApplyEn:  s.apply_en,
    howToApplyTa:  s.apply_ta,
    officialLink:  s.portal,
  }));

  const inserted = await Scheme.insertMany(docs, { ordered: false });
  console.log(`✅ Inserted ${inserted.length} schemes`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
