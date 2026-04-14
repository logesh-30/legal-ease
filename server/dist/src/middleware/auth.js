import { jwtVerify } from "jose";
export const requireAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secretKey);
        req.user = {
            id: String(payload.id),
            role: payload.role === "admin" ? "admin" : "user"
        };
        return next();
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
export const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "admin")
        return res.status(403).json({ message: "Admin only" });
    return next();
};
