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
const MAX_SCENES = 10;
// ── GET /api/hero-scenes/:tenantId ─────────────────────────────────
// Returns all hero scenes for a tenant, ordered by sort_order.
router.get("/:tenantId", auth_1.requireAuth, async (req, res) => {
    try {
        const { rows } = await client_1.db.query("SELECT * FROM hero_scenes WHERE tenant_id = $1 ORDER BY sort_order, created_at", [req.params.tenantId]);
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
// ── POST /api/hero-scenes/:tenantId ────────────────────────────────
// Upload one or more hero scene images/SVGs.
// Accepts: multipart/form-data { files: File[], label? }
router.post("/:tenantId", auth_1.requireAuth, async (req, res, next) => {
    try {
        const { rows } = await client_1.db.query("SELECT slug FROM tenants WHERE id = $1", [req.params.tenantId]);
        if (!rows[0]) {
            res.status(404).json({ message: "Tenant not found" });
            return;
        }
        req.body = req.body || {};
        req.body.tenant = rows[0].slug;
        // Multer's destination() reads req.body.folder or req.query.folder.
        // In practice req.body may not be populated yet when multer runs,
        // so also set the query param to ensure correct destination.
        req.body.folder = "hero-scenes";
        req.query.folder = "hero-scenes";
        next();
    }
    catch (err) {
        next(err);
    }
}, (req, res, next) => {
    upload_1.upload.array("files", 10)(req, res, (err) => {
        if (err) {
            return res
                .status(400)
                .json({ message: err.message || "Upload failed" });
        }
        next();
    });
}, async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        res.status(400).json({ message: "No files uploaded" });
        return;
    }
    // Optional per-file labels. Can be sent as multipart field `labels`
    // (multiple occurrences) to match uploaded file order.
    const labelsField = req.body?.labels;
    const labelsFromRequest = (() => {
        if (!labelsField)
            return undefined;
        return Array.isArray(labelsField) ? labelsField : [labelsField];
    })();
    try {
        const tenantResult = await client_1.db.query("SELECT slug FROM tenants WHERE id = $1", [req.params.tenantId]);
        if (!tenantResult.rows[0]) {
            res.status(404).json({ message: "Tenant not found" });
            return;
        }
        const slug = tenantResult.rows[0].slug;
        // Count existing scenes and enforce max (check AFTER upload so we know file count)
        const { rows: countRows } = await client_1.db.query("SELECT COUNT(*) FROM hero_scenes WHERE tenant_id = $1", [req.params.tenantId]);
        const current = parseInt(countRows[0].count, 10);
        if (current + files.length > MAX_SCENES) {
            // Cleanup: remove uploaded files since we can't use them
            for (const file of files) {
                try {
                    fs_1.default.unlinkSync(file.path);
                }
                catch {
                    /* ignore */
                }
            }
            res.status(400).json({
                message: `Only ${MAX_SCENES - current} slot(s) remaining, but ${files.length} file(s) uploaded. Delete some first.`,
            });
            return;
        }
        // Get current max sort_order
        const { rows: orderRows } = await client_1.db.query("SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM hero_scenes WHERE tenant_id = $1", [req.params.tenantId]);
        let nextOrder = parseInt(orderRows[0].max_order, 10) + 1;
        const created = [];
        for (let idx = 0; idx < files.length; idx++) {
            const file = files[idx];
            const filePath = path_1.default.relative(DATA_ROOT, file.path);
            const publicUrl = `/uploads/${slug}/hero-scenes/${file.filename}`;
            const label = labelsFromRequest && labelsFromRequest[idx]
                ? labelsFromRequest[idx]
                : null;
            const { rows } = await client_1.db.query(`INSERT INTO hero_scenes (tenant_id, url, file_path, label, sort_order)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`, [req.params.tenantId, publicUrl, filePath, label, nextOrder++]);
            created.push(rows[0]);
        }
        res.status(201).json(created);
    }
    catch (err) {
        console.error("Hero scene upload failed:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// ── PATCH /api/hero-scenes/:id/label ──────────────────────────────
// Update the label of a scene.
router.patch("/:id/label", auth_1.requireAuth, async (req, res) => {
    const { label } = req.body;
    try {
        const { rows } = await client_1.db.query("UPDATE hero_scenes SET label = $1 WHERE id = $2 RETURNING *", [label || null, req.params.id]);
        if (!rows[0]) {
            res.status(404).json({ message: "Not found" });
            return;
        }
        res.json(rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
// ── PATCH /api/hero-scenes/:tenantId/reorder ──────────────────────
// Accepts: { order: string[] }  — array of scene IDs in desired order
router.patch("/:tenantId/reorder", auth_1.requireAuth, async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
        res.status(400).json({ message: "order must be an array of IDs" });
        return;
    }
    try {
        await Promise.all(order.map((id, idx) => client_1.db.query("UPDATE hero_scenes SET sort_order = $1 WHERE id = $2 AND tenant_id = $3", [idx, id, req.params.tenantId])));
        res.json({ message: "Reordered" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
// ── DELETE /api/hero-scenes/:id ────────────────────────────────────
// Delete a single scene (file + DB row).
router.delete("/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const { rows } = await client_1.db.query("SELECT file_path FROM hero_scenes WHERE id = $1", [req.params.id]);
        if (!rows[0]) {
            res.status(404).json({ message: "Not found" });
            return;
        }
        const fullPath = path_1.default.join(DATA_ROOT, rows[0].file_path);
        if (!fullPath.startsWith(DATA_ROOT)) {
            res.status(400).json({ message: "Invalid path" });
            return;
        }
        if (fs_1.default.existsSync(fullPath)) {
            fs_1.default.unlinkSync(fullPath);
        }
        await client_1.db.query("DELETE FROM hero_scenes WHERE id = $1", [req.params.id]);
        res.json({ message: "Deleted" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Delete failed" });
    }
});
exports.default = router;
