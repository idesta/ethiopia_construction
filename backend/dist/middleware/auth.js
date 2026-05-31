"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
function requireAuth(req, res, next) {
    // JWT comes from httpOnly cookie set at login
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ message: "Not authenticated" });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.adminEmail = payload.email;
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}
