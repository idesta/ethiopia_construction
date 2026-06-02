import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth";
import tenantRoutes from "./routes/tenants";
import contactRoutes from "./routes/contacts";
import projectRoutes from "./routes/projects";
import teamRoutes from "./routes/team";
import serviceRoutes from "./routes/services";
import uploadRoutes from "./routes/upload";
import contactRoute from "./routes/contact";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Trust proxy headers (nginx sets X-Forwarded-* headers) ──
app.set("trust proxy", 1);

// ── CORS — allow frontend origin ──────────
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://10.0.0.14", // VM local access
      "http://10.0.0.14:3000",
      "http://196.188.249.162", // public IP access
      "http://196.188.249.162:3000",
      "https://yourdomain.com", // future domain
    ],
    credentials: true,
  }),
);

// ── Body parsing ──────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Serve uploaded files statically ──────
// /uploads/company-one/projects/image.jpg → /mnt/data/uploads/company-one/projects/image.jpg
const UPLOAD_PATH = process.env.UPLOAD_PATH || "/mnt/data/uploads";
app.use("/uploads", express.static(UPLOAD_PATH));

// ── Routes ───────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/services", serviceRoutes);

// ── Health check ──────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount public contact route
app.use("/api/contact", contactRoute);

// ── 404 handler ───────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Start ────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📁 Serving uploads from ${UPLOAD_PATH}`);
  console.log(`🌐 Allowing CORS from ${FRONTEND_URL}`);
});

export default app;
