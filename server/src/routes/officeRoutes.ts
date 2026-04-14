import { Router } from "express";
import { Office } from "../models/Office.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/", async (_req, res) => res.json(await Office.find().sort({ createdAt: -1 })));
router.post("/", requireAuth, requireAdmin, async (req, res) => res.status(201).json(await Office.create(req.body)));
router.put("/:id", requireAuth, requireAdmin, async (req, res) =>
  res.json(await Office.findByIdAndUpdate(req.params.id, req.body, { new: true }))
);
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await Office.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
