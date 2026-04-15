import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { Scheme } from "../models/Scheme.js";
import { Eligibility } from "../models/Eligibility.js";

const router = Router();

type EligibilityData = {
  age: number;
  gender: "Male" | "Female" | "Other";
  maritalStatus: string;
  state: string;
  district: string;
  areaType: string;
  annualIncome: number;
  hasIncomeCertificate: boolean;
  isBPL: boolean;
  occupation: string;
  educationLevel: string;
  institutionType: string;
  hasLand: boolean;
  landSize: string;
  highestQualification: string;
  isCurrentlyStudying: boolean;
  category: "General" | "OBC" | "SC" | "ST";
  isMinority: boolean;
  familySize: number;
  earningMembers: number;
  isSeniorCitizen: boolean;
  isWidow: boolean;
  isDifferentlyAbled: boolean;
  isFarmer: boolean;
  isStudent: boolean;
};

type MatchResult = { eligible: boolean; reasons: string[] };

// ── Each check is independent: only fails if the scheme REQUIRES it and user doesn't meet it ──
const matchScheme = (eligibilityText: string, user: EligibilityData): MatchResult => {
  const text = eligibilityText.toLowerCase();
  const reasons: string[] = [];

  // ── Income ──
  const incomeLakhMatches = Array.from(text.matchAll(/(\d+(?:\.\d+)?)\s*lakh/g));
  if (incomeLakhMatches.length > 0) {
    const incomeMax = Math.max(...incomeLakhMatches.map((m) => Number(m[1]) * 100000));
    if (user.annualIncome > incomeMax) return { eligible: false, reasons: [] };
    reasons.push(`Income ≤ ₹${(incomeMax / 100000).toFixed(1)}L`);
  }

  // ── Age ──
  const betweenAge = text.match(/between\s+(\d{1,3})\s*(?:and|-)\s*(\d{1,3})/i);
  const rangeAge = text.match(/(\d{1,3})\s*[-–]\s*(\d{1,3})\s*(?:years|yrs|year)/i);
  const aboveAge = text.match(/(?:above|at least|greater than)\s+(\d{1,3})\s*(?:years|yrs|year)?/i);
  const belowAge = text.match(/(?:below|under|less than)\s+(\d{1,3})\s*(?:years|yrs|year)?/i);

  if (betweenAge) {
    const [min, max] = [Number(betweenAge[1]), Number(betweenAge[2])];
    if (user.age < min || user.age > max) return { eligible: false, reasons: [] };
    reasons.push(`Age ${min}–${max}`);
  } else if (rangeAge) {
    const [min, max] = [Number(rangeAge[1]), Number(rangeAge[2])];
    if (user.age < min || user.age > max) return { eligible: false, reasons: [] };
    reasons.push(`Age ${min}–${max}`);
  } else {
    if (aboveAge) {
      const min = Number(aboveAge[1]);
      if (user.age < min) return { eligible: false, reasons: [] };
      reasons.push(`Age ≥ ${min}`);
    }
    if (belowAge) {
      const max = Number(belowAge[1]);
      if (user.age > max) return { eligible: false, reasons: [] };
      reasons.push(`Age ≤ ${max}`);
    }
  }

  // ── Category — only restrict if scheme explicitly names a specific caste group ──
  const needsSC  = /\bsc\b|scheduled caste/i.test(text);
  const needsST  = /\bst\b|scheduled tribe/i.test(text);
  const needsOBC = /\bobc\b|other backward/i.test(text);
  if (needsSC && user.category !== "SC") return { eligible: false, reasons: [] };
  if (needsST && user.category !== "ST") return { eligible: false, reasons: [] };
  if (needsOBC && user.category !== "OBC") return { eligible: false, reasons: [] };
  if (needsSC || needsST || needsOBC) reasons.push(`Category: ${user.category}`);

  // ── Gender — only restrict if scheme is explicitly for women/girls ──
  const femaleOnly = /\bwomen\b|\bwoman\b|\bfemale\b|\bgirl\b|\bmahila\b/i.test(text);
  if (femaleOnly && user.gender !== "Female") return { eligible: false, reasons: [] };
  if (femaleOnly) reasons.push("Female");

  // ── Occupation-based conditions — independent checks ──
  const requiresFarmer = /\bfarmer\b|\bagriculture\b|\bcultivator\b|\bkisan\b|\bfisherm/i.test(text);
  const requiresStudent = /\bstudent\b|\bschool\b|\bcollege\b|\bscholarship\b/i.test(text);
  const requiresBusiness = /\bentrepreneur\b|\bmsme\b|\bself.?employed\b|\bstartup\b|\bvendor\b|\bstreet vendor\b/i.test(text);
  const requiresWorker = /\bunorganized worker\b|\blabour\b|\bworker\b|\bartisan\b|\bcraftspeo/i.test(text);

  if (requiresFarmer && !(user.isFarmer || user.occupation === "Farmer")) return { eligible: false, reasons: [] };
  if (requiresStudent && !(user.isStudent || user.occupation === "Student")) return { eligible: false, reasons: [] };
  if (requiresBusiness && user.occupation !== "Self Employed") return { eligible: false, reasons: [] };
  if (requiresWorker && !["Farmer", "Self Employed", "Unemployed", "Other"].includes(user.occupation)) return { eligible: false, reasons: [] };

  if (requiresFarmer) reasons.push("Farmer");
  if (requiresStudent) reasons.push("Student");
  if (requiresBusiness) reasons.push("Self Employed");

  // ── Special conditions — only fail if scheme explicitly requires them ──
  const requiresSenior = /senior citizen|elderly|old age|\bage\s*60\b|above\s*60/i.test(text);
  const requiresDisabled = /\bdisabled\b|\bdisability\b|differently.?abled|\budid\b/i.test(text);
  const requiresWidow = /\bwidow\b|\bwidower\b/i.test(text);
  const requiresBPL = /\bbpl\b|below poverty|ration card|antyodaya/i.test(text);

  if (requiresSenior && !(user.isSeniorCitizen || user.age >= 60)) return { eligible: false, reasons: [] };
  if (requiresDisabled && !user.isDifferentlyAbled) return { eligible: false, reasons: [] };
  if (requiresWidow && !user.isWidow) return { eligible: false, reasons: [] };
  if (requiresBPL && !user.isBPL) return { eligible: false, reasons: [] };

  if (requiresSenior) reasons.push("Senior Citizen");
  if (requiresDisabled) reasons.push("Differently Abled");
  if (requiresWidow) reasons.push("Widow/Widower");
  if (requiresBPL) reasons.push("BPL");

  return { eligible: true, reasons };
};

// ── Routes ────────────────────────────────────────────────────────────────────
router.post("/eligibility", requireAuth, async (req: AuthedRequest, res) => {
  const payload = req.body as Partial<EligibilityData>;
  if (!payload?.age || payload.age <= 0)
    return res.status(400).json({ message: "Age must be greater than 0" });
  if (!Number.isFinite(payload.annualIncome) || Number(payload.annualIncome) <= 0)
    return res.status(400).json({ message: "Annual income must be a valid number greater than 0" });
  if (!payload.gender || !payload.occupation || !payload.category || !payload.state?.trim())
    return res.status(400).json({ message: "Required fields cannot be empty" });

  const normalized: EligibilityData = {
    age: payload.age,
    gender: payload.gender,
    maritalStatus: payload.maritalStatus ?? "Single",
    state: payload.state?.trim() ?? "Tamil Nadu",
    district: payload.district?.trim() ?? "",
    areaType: payload.areaType ?? "Rural",
    annualIncome: Number(payload.annualIncome),
    hasIncomeCertificate: Boolean(payload.hasIncomeCertificate),
    isBPL: Boolean(payload.isBPL),
    occupation: payload.occupation,
    educationLevel: payload.educationLevel ?? "",
    institutionType: payload.institutionType ?? "",
    hasLand: Boolean(payload.hasLand),
    landSize: payload.landSize ?? "",
    highestQualification: payload.highestQualification ?? "",
    isCurrentlyStudying: Boolean(payload.isCurrentlyStudying),
    category: payload.category,
    isMinority: Boolean(payload.isMinority),
    familySize: Number(payload.familySize) || 1,
    earningMembers: Number(payload.earningMembers) || 1,
    isSeniorCitizen: Boolean(payload.isSeniorCitizen),
    isWidow: Boolean(payload.isWidow) || payload.maritalStatus === "Widow",
    isDifferentlyAbled: Boolean(payload.isDifferentlyAbled),
    isFarmer: Boolean(payload.isFarmer) || payload.occupation === "Farmer",
    isStudent: Boolean(payload.isStudent) || payload.occupation === "Student",
  };

  const saved = await Eligibility.findOneAndUpdate(
    { userId: req.user!.id },
    { $set: normalized },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return res.json(saved);
});

router.get("/eligibility", requireAuth, async (req: AuthedRequest, res) => {
  const eligibility = await Eligibility.findOne({ userId: req.user!.id });
  return res.json(eligibility ?? null);
});

router.get("/eligible-schemes", requireAuth, async (req: AuthedRequest, res) => {
  const eligibility = await Eligibility.findOne({ userId: req.user!.id });
  if (!eligibility)
    return res.status(400).json({ message: "Please fill eligibility form first" });

  const schemes = await Scheme.find().sort({ createdAt: -1 });
  const user = eligibility as unknown as EligibilityData;

  const matched = schemes
    .map((scheme) => {
      const { eligible, reasons } = matchScheme(scheme.eligibilityEn, user);
      return eligible ? { ...scheme.toObject(), matchedReasons: reasons } : null;
    })
    .filter(Boolean)
    // Sort by number of matched reasons descending (best match first)
    .sort((a: any, b: any) => (b.matchedReasons?.length ?? 0) - (a.matchedReasons?.length ?? 0));

  return res.json(matched);
});

export default router;
