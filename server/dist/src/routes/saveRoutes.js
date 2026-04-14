import { Router } from "express";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
const isSaveType = (value) => value === "service" || value === "scheme";
const toSavedId = (item) => {
    if (item && typeof item === "object" && "_id" in item) {
        const id = item._id;
        if (typeof id === "string")
            return id;
        if (id && typeof id.toString === "function") {
            return id.toString();
        }
    }
    return String(item);
};
router.post("/", requireAuth, async (req, res) => {
    const { type, itemId } = req.body;
    if (!type || !itemId || !isSaveType(type)) {
        return res.status(400).json({ message: "type and itemId are required" });
    }
    const update = type === "service"
        ? { $addToSet: { savedServices: itemId } }
        : { $addToSet: { savedSchemes: itemId } };
    await User.findByIdAndUpdate(req.user.id, update);
    return res.json({ message: "Saved" });
});
router.delete("/", requireAuth, async (req, res) => {
    const { type, itemId } = req.body;
    if (!type || !itemId || !isSaveType(type)) {
        return res.status(400).json({ message: "type and itemId are required" });
    }
    const update = type === "service"
        ? { $pull: { savedServices: itemId } }
        : { $pull: { savedSchemes: itemId } };
    await User.findByIdAndUpdate(req.user.id, update);
    return res.json({ message: "Unsaved" });
});
router.get("/", requireAuth, async (req, res) => {
    const user = await User.findById(req.user.id).populate("savedServices").populate("savedSchemes");
    if (!user)
        return res.status(404).json({ message: "User not found" });
    return res.json({
        services: user.savedServices,
        schemes: user.savedSchemes,
        serviceIds: user.savedServices.map(toSavedId),
        schemeIds: user.savedSchemes.map(toSavedId)
    });
});
export default router;
