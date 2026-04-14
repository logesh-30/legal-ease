import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
const router = Router();
router.get("/", requireAuth, requireAdmin, async (_req, res) => res.json(await User.find().select("-passwordHash").sort({ createdAt: -1 })));
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
});
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
    const updated = await User.findByIdAndUpdate(req.params.id, { name: req.body.name, email: req.body.email, role: req.body.role }, { new: true }).select("-passwordHash");
    res.json(updated);
});
router.post("/save/:type/:id", requireAuth, async (req, res) => {
    const user = await User.findById(req.user.id);
    const saveId = String(req.params.id);
    if (!user)
        return res.status(404).json({ message: "User not found" });
    if (req.params.type === "service") {
        const existing = user.savedServices.map((v) => v.toString());
        if (!existing.includes(saveId))
            user.savedServices.push(saveId);
    }
    else {
        const existing = user.savedSchemes.map((v) => v.toString());
        if (!existing.includes(saveId))
            user.savedSchemes.push(saveId);
    }
    await user.save();
    return res.json({ message: "Saved" });
});
router.get("/saved", requireAuth, async (req, res) => {
    const user = await User.findById(req.user.id).populate("savedServices").populate("savedSchemes");
    return res.json({ services: user?.savedServices ?? [], schemes: user?.savedSchemes ?? [] });
});
export default router;
