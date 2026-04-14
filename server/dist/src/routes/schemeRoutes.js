import { Router } from "express";
import { Scheme } from "../models/Scheme.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
const router = Router();
router.get("/", async (_req, res) => res.json(await Scheme.find().sort({ createdAt: -1 })));
router.get("/:id", async (req, res) => res.json(await Scheme.findById(req.params.id)));
router.post("/", requireAuth, requireAdmin, async (req, res) => res.status(201).json(await Scheme.create(req.body)));
router.put("/:id", requireAuth, requireAdmin, async (req, res) => res.json(await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
    await Scheme.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});
export default router;
