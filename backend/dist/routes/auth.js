"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("../db/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
// Helper: Determine if connection is secure (via proxy headers or direct HTTPS)
const isSecure = (req) => {
    return req.header("x-forwarded-proto") === "https" || req.protocol === "https";
};
const COOKIE_OPTS = {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
// POST /api/auth/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Email and password required" });
        return;
    }
    try {
        const result = await client_1.db.query("SELECT * FROM admin_users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!valid) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email }, JWT_SECRET, {
            expiresIn: "7d",
        });
        // Set secure flag based on actual connection protocol (via proxy headers)
        res.cookie("token", token, { ...COOKIE_OPTS, secure: isSecure(req) });
        res.json({ user: { email: user.email } });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// POST /api/auth/logout
router.post("/logout", (_req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
});
// GET /api/auth/me
router.get("/me", auth_1.requireAuth, (req, res) => {
    res.json({ email: req.adminEmail });
});
// POST /api/auth/create-admin  (run once to create first admin)
// Remove or protect this route after first use
router.post("/create-admin", async (req, res) => {
    const { email, password, secret } = req.body;
    if (secret !== process.env.ADMIN_CREATE_SECRET) {
        res.status(403).json({ message: "Forbidden" });
        return;
    }
    try {
        const hash = await bcryptjs_1.default.hash(password, 12);
        const result = await client_1.db.query("INSERT INTO admin_users (email, password_hash) VALUES ($1, $2) RETURNING id, email", [email, hash]);
        res.status(201).json({ admin: result.rows[0] });
    }
    catch (err) {
        if (err.code === "23505") {
            res.status(409).json({ message: "Admin already exists" });
        }
        else {
            res.status(500).json({ message: "Server error" });
        }
    }
});
exports.default = router;
