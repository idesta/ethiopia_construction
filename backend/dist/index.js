"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const tenants_1 = __importDefault(require("./routes/tenants"));
const contacts_1 = __importDefault(require("./routes/contacts"));
const projects_1 = __importDefault(require("./routes/projects"));
const team_1 = __importDefault(require("./routes/team"));
const services_1 = __importDefault(require("./routes/services"));
const upload_1 = __importDefault(require("./routes/upload"));
const contact_1 = __importDefault(require("./routes/contact"));
const heroScenes_1 = __importDefault(require("./routes/heroScenes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// ── Trust proxy headers (nginx sets X-Forwarded-* headers) ──
app.set("trust proxy", 1);
// ── CORS — allow frontend origin ──────────
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://10.0.0.14", // VM local access
        "http://10.0.0.14:3000",
        "http://196.188.249.162", // public IP access
        "http://196.188.249.162:3000",
        "https://yourdomain.com", // future domain
    ],
    credentials: true,
}));
// ── Body parsing ──────────────────────────
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// ── Serve uploaded files statically ──────
// /uploads/company-one/projects/image.jpg → /mnt/data/uploads/company-one/projects/image.jpg
const UPLOAD_PATH = process.env.UPLOAD_PATH || "/mnt/data/uploads";
app.use("/uploads", express_1.default.static(UPLOAD_PATH));
// ── Routes ───────────────────────────────
app.use("/api/auth", auth_1.default);
app.use("/api/tenants", tenants_1.default);
app.use("/api/contacts", contacts_1.default);
app.use("/api/projects", projects_1.default);
app.use("/api/team", team_1.default);
app.use("/api/services", services_1.default);
app.use("/api/upload", upload_1.default);
app.use("/api/hero-scenes", heroScenes_1.default);
// ── Health check ──────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Mount public contact route
app.use("/api/contact", contact_1.default);
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
exports.default = app;
