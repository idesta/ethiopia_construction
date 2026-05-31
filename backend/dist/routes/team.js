"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/:tenantId", auth_1.requireAuth, async (req, res) => {
    try {
        const { rows } = await client_1.db.query("SELECT * FROM team WHERE tenant_id = $1 ORDER BY sort_order", [req.params.tenantId]);
        res.json(rows);
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
});
router.post("/:tenantId", auth_1.requireAuth, async (req, res) => {
    const { name, role, photo_url, sort_order } = req.body;
    if (!name) {
        res.status(400).json({ message: "name required" });
        return;
    }
    try {
        const { rows } = await client_1.db.query("INSERT INTO team (tenant_id, name, role, photo_url, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *", [req.params.tenantId, name, role, photo_url, sort_order || 0]);
        res.status(201).json(rows[0]);
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
});
router.put("/:id", auth_1.requireAuth, async (req, res) => {
    const { name, role, photo_url, sort_order } = req.body;
    try {
        const { rows } = await client_1.db.query("UPDATE team SET name=$1, role=$2, photo_url=$3, sort_order=$4 WHERE id=$5 RETURNING *", [name, role, photo_url, sort_order, req.params.id]);
        if (!rows[0]) {
            res.status(404).json({ message: "Not found" });
            return;
        }
        res.json(rows[0]);
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
});
router.delete("/:id", auth_1.requireAuth, async (req, res) => {
    try {
        await client_1.db.query("DELETE FROM team WHERE id = $1", [req.params.id]);
        res.json({ message: "Deleted" });
    }
    catch {
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
