import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import schemeRoutes from "./routes/schemeRoutes.js";
import officeRoutes from "./routes/officeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import saveRoutes from "./routes/saveRoutes.js";
import eligibilityRoutes from "./routes/eligibilityRoutes.js";
const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/offices", officeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/save", saveRoutes);
app.use("/api/saves", saveRoutes);
app.use("/api", eligibilityRoutes);
const start = async () => {
    await connectDb(process.env.MONGO_URI);
    app.listen(process.env.PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Server running on ${process.env.PORT}`);
    });
};
start();
