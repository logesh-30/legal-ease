import { Router } from "express";
import { User } from "../models/User.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

type SaveType = "service" | "scheme";

const isSaveType = (value: string): value is SaveType => value === "service" || value === "scheme";
const toSavedId = (item: unknown) => {
  if (item && typeof item === "object" && "_id" in item) {
    const id = (item as { _id?: unknown })._id;
    if (typeof id === "string") return id;
    if (id && typeof (id as { toString?: () => string }).toString === "function") {
      return (id as { toString: () => string }).toString();
    }
  }
  return String(item);
};

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const { type, itemId } = req.body as { type?: string; itemId?: string };
  if (!type || !itemId || !isSaveType(type)) {
    return res.status(400).json({ message: "type and itemId are required" });
  }

  const update =
    type === "service"
      ? { $addToSet: { savedServices: itemId } }
      : { $addToSet: { savedSchemes: itemId } };

  await User.findByIdAndUpdate(req.user!.id, update);
  return res.json({ message: "Saved" });
});

router.delete("/", requireAuth, async (req: AuthedRequest, res) => {
  const { type, itemId } = req.body as { type?: string; itemId?: string };
  if (!type || !itemId || !isSaveType(type)) {
    return res.status(400).json({ message: "type and itemId are required" });
  }

  const update =
    type === "service"
      ? { $pull: { savedServices: itemId } }
      : { $pull: { savedSchemes: itemId } };

  await User.findByIdAndUpdate(req.user!.id, update);
  return res.json({ message: "Unsaved" });
});

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const user = await User.findById(req.user!.id).populate("savedServices").populate("savedSchemes");
  if (!user) return res.status(404).json({ message: "User not found" });

  return res.json({
    services: user.savedServices,
    schemes: user.savedSchemes,
    serviceIds: user.savedServices.map(toSavedId),
    schemeIds: user.savedSchemes.map(toSavedId)
  });
});

export default router;
