"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/projects/:tenantId
router.get("/:tenantId", auth_1.requireAuth, async (req, res) => {
    try {
        const { rows } = await client_1.db.query("SELECT * FROM projects WHERE tenant_id = $1 ORDER BY sort_order, created_at DESC", [req.params.tenantId]);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});
// POST /api/projects/:tenantId
router.post("/:tenantId", auth_1.requireAuth, async (req, res) => {
    const { title, description, location, category, status, completed_at, cover_url, sort_order, } = req.body;
    if (!title) {
        res.status(400).json({ message: "title required" });
        return;
    }
    try {
        const { rows } = await client_1.db.query(`INSERT INTO projects (tenant_id, title, description, location, category, status, completed_at, cover_url, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [
            req.params.tenantId,
            title,
            description,
            location,
            category,
            status || "completed",
            completed_at || null,
            cover_url,
            sort_order || 0,
        ]);
        res.status(201).json(rows[0]);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});
// PUT /api/projects/:id
router.put("/:id", auth_1.requireAuth, async (req, res) => {
    const { title, description, location, category, status, completed_at, cover_url, sort_order, } = req.body;
    try {
        const { rows } = await client_1.db.query(`UPDATE projects SET title=$1, description=$2, location=$3, category=$4,
       status=$5, completed_at=$6, cover_url=$7, sort_order=$8
       WHERE id=$9 RETURNING *`, [
            title,
            description,
            location,
            category,
            status,
            completed_at || null,
            cover_url,
            sort_order,
            req.params.id,
        ]);
        if (!rows[0]) {
            res.status(404).json({ message: "Not found" });
            return;
        }
        res.json(rows[0]);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});
// DELETE /api/projects/:id
router.delete("/:id", auth_1.requireAuth, async (req, res) => {
    try {
        await client_1.db.query("DELETE FROM projects WHERE id = $1", [req.params.id]);
        res.json({ message: "Deleted" });
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
