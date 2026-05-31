"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/contacts/:tenantId
router.get("/:tenantId", auth_1.requireAuth, async (req, res) => {
    try {
        const { rows } = await client_1.db.query("SELECT * FROM contacts WHERE tenant_id = $1", [req.params.tenantId]);
        res.json(rows[0] || null);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});
// POST /api/contacts/:tenantId  — upsert
router.post("/:tenantId", auth_1.requireAuth, async (req, res) => {
    const { email, phone, address, city, maps_url } = req.body;
    const { tenantId } = req.params;
    try {
        // Check if contact exists
        const existing = await client_1.db.query("SELECT id FROM contacts WHERE tenant_id = $1", [tenantId]);
        let result;
        if (existing.rows[0]) {
            result = await client_1.db.query(`UPDATE contacts SET email=$1, phone=$2, address=$3, city=$4, maps_url=$5, updated_at=NOW()
         WHERE tenant_id=$6 RETURNING *`, [email, phone, address, city, maps_url, tenantId]);
        }
        else {
            result = await client_1.db.query(`INSERT INTO contacts (tenant_id, email, phone, address, city, maps_url)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [tenantId, email, phone, address, city, maps_url]);
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
