import { Router } from "express";
import { Office } from "../models/Office.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const toRad = (d: number) => (d * Math.PI) / 180;
const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const router = Router();

// Must be before /:id routes
router.get("/cities", async (_req, res) => {
  const offices = await Office.find({}, "address");
  const cities = [...new Set(
    offices.map((o) => {
      const parts = o.address.split(",");
      return parts[parts.length - 1].trim();
    })
  )].sort();
  res.json(cities);
});

router.get("/", async (req, res) => {
  const { lat, lng, radius, city } = req.query;

  if (city) {
    const all = await Office.find();
    const filtered = all.filter((o) =>
      o.address.toLowerCase().includes((city as string).toLowerCase())
    );
    return res.json(filtered);
  }

  if (lat && lng) {
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const km = parseFloat((radius as string) || "10");
    const all = await Office.find();
    return res.json(all.filter((o) => haversineKm(userLat, userLng, o.latitude, o.longitude) <= km));
  }

  res.json(await Office.find().sort({ createdAt: -1 }));
});
router.post("/", requireAuth, requireAdmin, async (req, res) => res.status(201).json(await Office.create(req.body)));
router.put("/:id", requireAuth, requireAdmin, async (req, res) =>
  res.json(await Office.findByIdAndUpdate(req.params.id, req.body, { new: true }))
);
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await Office.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
