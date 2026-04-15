import "dotenv/config";
import mongoose from "mongoose";
import { Scheme } from "./src/models/Scheme.js";
import schemesData from "./india_government_schemes_2026.json" with { type: "json" };

type EligibilityRules = {
  ageMin?: number;
  ageMax?: number;
  incomeMax?: number;
  categories?: string[];
  occupations?: string[];
  genders?: string[];
  states?: string[];
  tags?: string[];
};

function extractRules(eligibilityEn: string, nameEn: string): EligibilityRules {
  const t = eligibilityEn.toLowerCase();
  const rules: EligibilityRules = {};

  // Skip age parsing for schemes about company/entity age, not person age
  const isEntityAge = /startup|company|enterprise|years old.*registered|incorporated/i.test(t);

  if (!isEntityAge) {
  // Age range: "aged 18–40", "18-40 years", "between 18 and 40", "17.5–23"
  const ageRange =
    t.match(/aged?\s+([\d.]{1,5})\s*[–\-to]+\s*([\d.]{1,5})\s*years?/) ||
    t.match(/between\s+([\d.]{1,5})\s*(?:and|–|-)\s*([\d.]{1,5})\s*years?/) ||
    t.match(/([\d.]{1,5})\s*[–\-]\s*([\d.]{1,5})\s*years?/);
  if (ageRange) {
    const min = parseFloat(ageRange[1]);
    const max = parseFloat(ageRange[2]);
    // Only treat as person age if values are plausible (5–100)
    if (min >= 5 && max <= 100) {
      rules.ageMin = Math.ceil(min);
      rules.ageMax = Math.floor(max);
    }
  } else {
    const above = t.match(/(?:above|at least|minimum)\s+(\d{1,3})\s*years/);
    const below = t.match(/(?:below|under|less than)\s+(\d{1,3})\s*years/);
    if (above) rules.ageMin = Number(above[1]);
    if (below) rules.ageMax = Number(below[1]);
    // "aged 60 years and above"
    const seniorAbove = t.match(/aged?\s+([\d.]{1,5})\s*years?\s*and\s*above/);
    if (seniorAbove) rules.ageMin = Math.ceil(Number(seniorAbove[1]));
    const childBelow = t.match(/below\s+(\d{1,3})\s*years/);
    if (childBelow) rules.ageMax = Number(childBelow[1]);
  }
  } // end !isEntityAge

  // Income: "annual income below ₹72,000", "monthly income up to ₹15,000", "X lakh"
  const incomeLakh = t.match(/(?:below|up to|under|less than|within)\s*(?:₹|rs\.?)?\s*([\d.]+)\s*lakh/);
  if (incomeLakh) {
    rules.incomeMax = Math.round(Number(incomeLakh[1]) * 100000);
  } else {
    const incomeNum = t.match(/(?:annual income|income)\s*(?:below|up to|under|less than)\s*(?:₹|rs\.?)?\s*([\d,]+)/);
    if (incomeNum) rules.incomeMax = Number(incomeNum[1].replace(/,/g, ""));
    // monthly income → annual
    const monthly = t.match(/monthly income\s*(?:up to|below|under)\s*(?:₹|rs\.?)?\s*([\d,]+)/);
    if (monthly) rules.incomeMax = Number(monthly[1].replace(/,/g, "")) * 12;
  }

  // Caste/category
  const cats: string[] = [];
  if (/\bsc\b|scheduled caste/.test(t)) cats.push("SC");
  if (/\bst\b|scheduled tribe/.test(t)) cats.push("ST");
  if (/\bobc\b|other backward/.test(t)) cats.push("OBC");
  if (cats.length) rules.categories = cats;

  // Gender
  if (/\bwomen\b|\bwoman\b|\bgirl\b|\bfemale\b/.test(t)) rules.genders = ["female"];

  // Occupation tags
  const tags: string[] = [];
  if (/\bfarmer\b|\bagriculture\b|\bcultivat/.test(t)) tags.push("farmer");
  if (/\bstudent\b|\bschool\b|\bcollege\b/.test(t)) tags.push("student");
  if (/senior citizen|elderly|aged?\s*60\s*(?:years?\s*)?and\s*above|above\s*60/.test(t)) tags.push("seniorCitizen");
  if (/disabled|disability|differently.?abled/.test(t)) tags.push("differentlyAbled");
  if (tags.length) rules.tags = tags;

  // State restriction
  if (/tamil nadu/.test(t)) rules.states = ["Tamil Nadu"];

  return rules;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Connected to DB");

  const allSchemes = await Scheme.find({});
  console.log(`Found ${allSchemes.length} schemes in DB`);

  let updated = 0;
  for (const scheme of allSchemes) {
    const match = schemesData.schemes.find(
      (s) =>
        s.name_en.toLowerCase().trim() === scheme.nameEn.toLowerCase().trim() ||
        s.eligibility_en.toLowerCase().trim() === scheme.eligibilityEn.toLowerCase().trim()
    );

    const eligibilityText = match ? match.eligibility_en : scheme.eligibilityEn;
    const rules = extractRules(eligibilityText, scheme.nameEn);

    await Scheme.findByIdAndUpdate(scheme._id, { $set: { eligibilityRules: rules } });
    console.log(`✓ ${scheme.nameEn} → rules:`, JSON.stringify(rules));
    updated++;
  }

  console.log(`\nDone. Updated ${updated} schemes.`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
