import "dotenv/config";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { Scheme } from "./src/models/Scheme.js";

const data = JSON.parse(
  readFileSync(new URL("./india_government_schemes_2026_transformed.json", import.meta.url), "utf-8")
);

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

  const deleted = await Scheme.deleteMany({});
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing schemes`);

  const docs = data.schemes.map((s: any) => ({
    nameEn:        s.name_en,
    nameTa:        s.name_ta,
    category:      categoryMap[s.category] ?? "Financial",
    eligibilityEn: s.eligibility_en,
    eligibilityTa: s.eligibility_ta,
    benefitsEn:    s.benefits_en,
    benefitsTa:    s.benefits_ta,
    howToApplyEn:  s.apply_en_steps.join(" "),
    howToApplyTa:  s.apply_ta_steps.join(" "),
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
