import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { createToken, setAuthCookie } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ message: "Name, email and password are required" });
    }
    const exists = await User.findOne({ email });
    if (exists)
        return res.status(400).json({ message: "Email already used" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: "user" });
    const token = await createToken({ id: user.id, role: "user" }, process.env.JWT_SECRET);
    setAuthCookie(res, token);
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ message: "Invalid credentials" });
    const token = await createToken({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    setAuthCookie(res, token);
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
router.post("/logout", (_req, res) => {
    res.clearCookie("token");
    return res.json({ message: "Logged out" });
});
router.get("/me", requireAuth, async (req, res) => {
    const user = await User.findById(req.user.id).select("-passwordHash");
    return res.json(user);
});
export default router;
