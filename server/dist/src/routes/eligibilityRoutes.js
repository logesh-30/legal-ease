import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Scheme } from "../models/Scheme.js";
import { Eligibility } from "../models/Eligibility.js";
const router = Router();
const parseRestrictions = (eligibilityText) => {
    const text = eligibilityText.toLowerCase();
    const incomeValues = Array.from(text.matchAll(/(\d+(?:\.\d+)?)\s*lakh/g)).map((item) => Number(item[1]) * 100000);
    const incomeMax = incomeValues.length ? Math.max(...incomeValues) : undefined;
    let ageMin;
    let ageMax;
    const betweenAge = text.match(/between\s+(\d{1,3})\s*(?:and|-)\s*(\d{1,3})/i);
    if (betweenAge) {
        ageMin = Number(betweenAge[1]);
        ageMax = Number(betweenAge[2]);
    }
    else {
        const aboveAge = text.match(/(?:above|at least|greater than)\s+(\d{1,3})\s*(?:years|yrs|year)?/i);
        const belowAge = text.match(/(?:below|under|less than)\s+(\d{1,3})\s*(?:years|yrs|year)?/i);
        if (aboveAge)
            ageMin = Number(aboveAge[1]);
        if (belowAge)
            ageMax = Number(belowAge[1]);
    }
    const categories = {
        sc: /\bsc\b|scheduled caste/i.test(text),
        st: /\bst\b|scheduled tribe/i.test(text),
        obc: /\bobc\b|backward class/i.test(text)
    };
    const requiresStudent = /student|school|college/i.test(text);
    const requiresFarmer = /farmer|agriculture|cultivator/i.test(text);
    const requiresSenior = /senior citizen|elderly|old age|above\s*60/i.test(text);
    const requiresDifferentlyAbled = /disabled|disability|differently abled/i.test(text);
    return {
        hasRestrictions: Boolean(incomeMax) ||
            Boolean(ageMin) ||
            Boolean(ageMax) ||
            categories.sc ||
            categories.st ||
            categories.obc ||
            requiresStudent ||
            requiresFarmer ||
            requiresSenior ||
            requiresDifferentlyAbled,
        incomeMax,
        ageMin,
        ageMax,
        categories,
        requiresStudent,
        requiresFarmer,
        requiresSenior,
        requiresDifferentlyAbled
    };
};
const isEligibleForScheme = (eligibilityText, userData) => {
    const rules = parseRestrictions(eligibilityText);
    if (!rules.hasRestrictions)
        return true;
    if (typeof rules.incomeMax === "number" && userData.annualIncome > rules.incomeMax)
        return false;
    if (typeof rules.ageMin === "number" && userData.age < rules.ageMin)
        return false;
    if (typeof rules.ageMax === "number" && userData.age > rules.ageMax)
        return false;
    if (rules.categories.sc || rules.categories.st || rules.categories.obc) {
        const categoryLower = userData.category.toLowerCase();
        if ((rules.categories.sc && categoryLower !== "sc") ||
            (rules.categories.st && categoryLower !== "st") ||
            (rules.categories.obc && categoryLower !== "obc")) {
            return false;
        }
    }
    if (rules.requiresStudent && !(userData.isStudent || userData.occupation === "Student"))
        return false;
    if (rules.requiresFarmer && !(userData.isFarmer || userData.occupation === "Farmer"))
        return false;
    if (rules.requiresSenior && !(userData.isSeniorCitizen || userData.age >= 60))
        return false;
    if (rules.requiresDifferentlyAbled && !userData.isDifferentlyAbled)
        return false;
    return true;
};
router.post("/eligibility", requireAuth, async (req, res) => {
    const payload = req.body;
    if (!payload?.age || payload.age <= 0) {
        return res.status(400).json({ message: "Age must be greater than 0" });
    }
    if (!Number.isFinite(payload.annualIncome) || Number(payload.annualIncome) <= 0) {
        return res.status(400).json({ message: "Annual income must be a valid number greater than 0" });
    }
    if (!payload.gender || !payload.occupation || !payload.category || !payload.state?.trim()) {
        return res.status(400).json({ message: "Required fields cannot be empty" });
    }
    const normalized = {
        age: payload.age,
        gender: payload.gender,
        annualIncome: Number(payload.annualIncome),
        occupation: payload.occupation,
        category: payload.category,
        state: payload.state.trim(),
        isStudent: Boolean(payload.isStudent),
        isFarmer: Boolean(payload.isFarmer),
        isSeniorCitizen: Boolean(payload.isSeniorCitizen),
        isDifferentlyAbled: Boolean(payload.isDifferentlyAbled)
    };
    const saved = await Eligibility.findOneAndUpdate({ userId: req.user.id }, { $set: normalized }, { new: true, upsert: true, setDefaultsOnInsert: true });
    return res.json(saved);
});
router.get("/eligibility", requireAuth, async (req, res) => {
    const eligibility = await Eligibility.findOne({ userId: req.user.id });
    return res.json(eligibility ?? null);
});
router.get("/eligible-schemes", requireAuth, async (req, res) => {
    const eligibility = await Eligibility.findOne({ userId: req.user.id });
    if (!eligibility) {
        return res.status(400).json({ message: "Please fill eligibility form first" });
    }
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    const matched = schemes.filter((scheme) => isEligibleForScheme(scheme.eligibilityEn, eligibility));
    return res.json(matched);
});
export default router;
