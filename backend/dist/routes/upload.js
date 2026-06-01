"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("../db/client");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
const DATA_ROOT = process.env.UPLOAD_PATH || "/mnt/data/uploads";
// POST /api/upload
// Body: multipart/form-data  { file, tenant (slug), folder }
router.post("/", auth_1.requireAuth, (req, res, next) => {
    upload_1.upload.single("file")(req, res, (err) => {
        if (err) {
            console.error("Upload error:", err);
            return res
                .status(400)
                .json({ message: err.message || "Upload failed" });
        }
        next();
    });
}, async (req, res) => {
    if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
    const tenant = (req.body?.tenant ||
        req.query?.tenant ||
        "").trim();
    const folder = (req.body?.folder ||
        req.query?.folder ||
        "uploads").trim();
    if (!tenant) {
        res.status(400).json({ message: "tenant slug is required" });
        return;
    }
    const relativePath = path_1.default.relative(DATA_ROOT, req.file.path);
    const publicUrl = `/uploads/${tenant}/${folder}/${req.file.filename}`;
    try {
        const tenantResult = await client_1.db.query("SELECT id FROM tenants WHERE slug = $1", [tenant]);
        const tenantId = tenantResult.rows[0]?.id;
        if (tenantId) {
            await client_1.db.query(`INSERT INTO media_assets
           (tenant_id, file_path, public_url, asset_type, file_name, file_size, mime_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
                tenantId,
                relativePath,
                publicUrl,
                folder === "logo" ? "logo" : "photo",
                req.file.originalname,
                req.file.size,
                req.file.mimetype,
            ]);
        }
        res.json({ url: publicUrl, path: relativePath });
    }
    catch (err) {
        console.error("Upload metadata error:", err);
        res.json({ url: publicUrl, path: relativePath });
    }
});
// DELETE /api/upload  — delete a file by path
router.delete("/", auth_1.requireAuth, async (req, res) => {
    const { filePath } = req.body;
    if (!filePath) {
        res.status(400).json({ message: "filePath required" });
        return;
    }
    const fullPath = path_1.default.join(DATA_ROOT, filePath);
    // Safety check — prevent path traversal
    if (!fullPath.startsWith(DATA_ROOT)) {
        res.status(400).json({ message: "Invalid path" });
        return;
    }
    try {
        if (fs_1.default.existsSync(fullPath))
            fs_1.default.unlinkSync(fullPath);
        await client_1.db.query("DELETE FROM media_assets WHERE file_path = $1", [filePath]);
        res.json({ message: "Deleted" });
    }
    catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
});
exports.default = router;
