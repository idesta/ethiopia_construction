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
const router = (0, express_1.Router)();
const DATA_ROOT = process.env.UPLOAD_PATH || "/mnt/data/uploads";
const ALLOWED_LAYOUTS = ["split", "full-bleed"];
const ALLOWED_MEDIA_TYPES = ["builtin_scene", "uploaded"];
// Mirrors the relativePath/publicUrl relationship in routes/upload.ts
// (relativePath = path.relative(DATA_ROOT, file.path), publicUrl =
// `/uploads/${tenant}/${folder}/${filename}`) — stripping "/uploads/"
// off a stored media_ref recovers the same relative path, so there's
// no need for hero_slides to carry its own separate file_path column.
function removeUploadedFile(mediaRef) {
    if (!mediaRef)
        return;
    const fullPath = path_1.default.join(DATA_ROOT, mediaRef.replace(/^\/uploads\//, ""));
    if (fullPath.startsWith(DATA_ROOT) && fs_1.default.existsSync(fullPath)) {
        try {
            fs_1.default.unlinkSync(fullPath);
        }
        catch {
            /* ignore */
        }
    }
}
// ── GET /api/hero-slides/slide/:id ────────────────────────────────
router.get("/slide/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const { rows } = await client_1.db.query("SELECT * FROM hero_slides WHERE id = $1", [
            req.params.id,
        ]);
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
// ── GET /api/hero-slides/:tenantId (or :id for backward compat) ────
// Some admin UI paths may request hero slide by UUID at
// /api/hero-slides/:id. This handler supports both:
// - UUID => SELECT * FROM hero_slides WHERE id = $1
// - otherwise => SELECT * FROM hero_slides WHERE tenant_id = $1 ORDER BY...
router.get("/:tenantId", auth_1.requireAuth, async (req, res) => {
    const tenantOrId = req.params.tenantId;
    // UUID v1-v5 heuristic
    // Express types allow string | string[]. Normalize to string.
    const tenantOrIdStr = Array.isArray(tenantOrId)
        ? tenantOrId[0] || ""
        : tenantOrId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenantOrIdStr);
    try {
        if (isUuid) {
            const { rows } = await client_1.db.query("SELECT * FROM hero_slides WHERE id = $1", [tenantOrId]);
            if (!rows[0]) {
                res.status(404).json({ message: "Not found" });
                return;
            }
            res.json(rows[0]);
            return;
        }
        const { rows } = await client_1.db.query("SELECT * FROM hero_slides WHERE tenant_id = $1 ORDER BY sort_order, created_at", [tenantOrId]);
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
// ── POST /api/hero-slides/:tenantId ────────────────────────────────
// Plain JSON, same shape as projects/team/services. For media_type
// 'uploaded', the admin uploads the file via the existing generic
// POST /api/upload first and sends the resulting URL as media_ref —
// exactly how project cover photos and team photos already work.
router.post("/:tenantId", auth_1.requireAuth, async (req, res) => {
    const body = req.body || {};
    if (!body.headline) {
        res.status(400).json({ message: "Headline is required" });
        return;
    }
    const layout = ALLOWED_LAYOUTS.includes(body.layout) ? body.layout : "split";
    const mediaType = ALLOWED_MEDIA_TYPES.includes(body.media_type)
        ? body.media_type
        : "builtin_scene";
    try {
        const { rows: orderRows } = await client_1.db.query("SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM hero_slides WHERE tenant_id = $1", [req.params.tenantId]);
        const nextOrder = parseInt(orderRows[0].max_order, 10) + 1;
        const { rows } = await client_1.db.query(`INSERT INTO hero_slides
         (tenant_id, headline, tagline, cta_label, cta_target,
          layout, media_type, media_ref, poster_url, accent_override, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`, [
            req.params.tenantId,
            body.headline,
            body.tagline || null,
            body.cta_label || "View Our Work",
            body.cta_target || "projects",
            layout,
            mediaType,
            body.media_ref || null,
            body.poster_url || null,
            body.accent_override || null,
            nextOrder,
        ]);
        res.status(201).json(rows[0]);
    }
    catch (err) {
        console.error("Hero slide create failed:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// ── PUT /api/hero-slides/:id ────────────────────────────────────────
router.put("/:id", auth_1.requireAuth, async (req, res) => {
    const body = req.body || {};
    try {
        const { rows: existingRows } = await client_1.db.query("SELECT * FROM hero_slides WHERE id = $1", [req.params.id]);
        const existing = existingRows[0];
        if (!existing) {
            res.status(404).json({ message: "Not found" });
            return;
        }
        const layout = ALLOWED_LAYOUTS.includes(body.layout)
            ? body.layout
            : existing.layout;
        const mediaType = ALLOWED_MEDIA_TYPES.includes(body.media_type)
            ? body.media_type
            : existing.media_type;
        const mediaRef = body.media_ref ?? existing.media_ref;
        // If the slide previously pointed at an uploaded file and that URL
        // actually changed (re-uploaded, or switched to a builtin_scene),
        // the old file is now orphaned — clean it up, plus its bookkeeping
        // row in media_assets (best-effort; a missing row is harmless).
        if (existing.media_type === "uploaded" &&
            existing.media_ref &&
            existing.media_ref !== mediaRef) {
            removeUploadedFile(existing.media_ref);
            await client_1.db.query("DELETE FROM media_assets WHERE public_url = $1", [
                existing.media_ref,
            ]);
        }
        const { rows } = await client_1.db.query(`UPDATE hero_slides SET
         headline = $1, tagline = $2, cta_label = $3, cta_target = $4,
         layout = $5, media_type = $6, media_ref = $7,
         poster_url = $8, accent_override = $9
       WHERE id = $10
       RETURNING *`, [
            body.headline ?? existing.headline,
            body.tagline ?? existing.tagline,
            body.cta_label ?? existing.cta_label,
            body.cta_target ?? existing.cta_target,
            layout,
            mediaType,
            mediaRef,
            body.poster_url ?? existing.poster_url,
            body.accent_override ?? existing.accent_override,
            req.params.id,
        ]);
        res.json(rows[0]);
    }
    catch (err) {
        console.error("Hero slide update failed:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// ── PATCH /api/hero-slides/:tenantId/reorder ──────────────────────
router.patch("/:tenantId/reorder", auth_1.requireAuth, async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
        res.status(400).json({ message: "order must be an array of IDs" });
        return;
    }
    try {
        await Promise.all(order.map((id, idx) => client_1.db.query("UPDATE hero_slides SET sort_order = $1 WHERE id = $2 AND tenant_id = $3", [idx, id, req.params.tenantId])));
        res.json({ message: "Reordered" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
// ── DELETE /api/hero-slides/:id ────────────────────────────────────
router.delete("/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const { rows } = await client_1.db.query("SELECT media_type, media_ref FROM hero_slides WHERE id = $1", [req.params.id]);
        if (!rows[0]) {
            res.status(404).json({ message: "Not found" });
            return;
        }
        if (rows[0].media_type === "uploaded" && rows[0].media_ref) {
            removeUploadedFile(rows[0].media_ref);
            await client_1.db.query("DELETE FROM media_assets WHERE public_url = $1", [
                rows[0].media_ref,
            ]);
        }
        await client_1.db.query("DELETE FROM hero_slides WHERE id = $1", [req.params.id]);
        res.json({ message: "Deleted" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Delete failed" });
    }
});
exports.default = router;
