import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Office } from "../models/Office.js";
import { Scheme } from "../models/Scheme.js";
import { Service } from "../models/Service.js";
import { User } from "../models/User.js";
const router = Router();
router.get("/stats", requireAuth, requireAdmin, async (_req, res) => {
    const [services, schemes, offices, users] = await Promise.all([
        Service.countDocuments(),
        Scheme.countDocuments(),
        Office.countDocuments(),
        User.countDocuments({ role: "user" })
    ]);
    res.json({ services, schemes, offices, users });
});
export default router;
