import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { db } from "../db/client";
import { requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();
const DATA_ROOT = process.env.UPLOAD_PATH || "/mnt/data/uploads";
const MAX_SCENES = 10;

// ── GET /api/hero-scenes/:tenantId ─────────────────────────────────
// Returns all hero scenes for a tenant, ordered by sort_order.
router.get("/:tenantId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM hero_scenes WHERE tenant_id = $1 ORDER BY sort_order, created_at",
      [req.params.tenantId],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── POST /api/hero-scenes/:tenantId ────────────────────────────────
// Upload a new hero scene image/SVG.
// Accepts: multipart/form-data { file, label? }
router.post(
  "/:tenantId",
  requireAuth,
  async (req: Request, res: Response, next) => {
    // Inject tenant (slug) and folder so the multer middleware saves to the right path
    try {
      const { rows } = await db.query(
        "SELECT slug FROM tenants WHERE id = $1",
        [req.params.tenantId],
      );
      if (!rows[0]) {
        res.status(404).json({ message: "Tenant not found" });
        return;
      }
      req.body = req.body || {};
      req.body.tenant = rows[0].slug;
      req.body.folder = "hero-scenes";
      next();
    } catch (err) {
      next(err);
    }
  },
  async (req: Request, res: Response, next) => {
    // Enforce max scenes limit before accepting the file
    try {
      const { rows } = await db.query(
        "SELECT COUNT(*) FROM hero_scenes WHERE tenant_id = $1",
        [req.params.tenantId],
      );
      if (parseInt(rows[0].count, 10) >= MAX_SCENES) {
        res
          .status(400)
          .json({ message: `Maximum ${MAX_SCENES} hero scenes allowed. Delete one first.` });
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  },
  (req: Request, res: Response, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Upload failed" });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // Resolve tenant slug for URL generation
    try {
      const tenantResult = await db.query(
        "SELECT slug FROM tenants WHERE id = $1",
        [req.params.tenantId],
      );
      if (!tenantResult.rows[0]) {
        res.status(404).json({ message: "Tenant not found" });
        return;
      }

      const slug       = tenantResult.rows[0].slug;
      const filePath   = path.relative(DATA_ROOT, req.file.path);
      const publicUrl  = `/uploads/${slug}/hero-scenes/${req.file.filename}`;
      const label      = (req.body.label || "").trim() || null;

      // Get current max sort_order
      const { rows: orderRows } = await db.query(
        "SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM hero_scenes WHERE tenant_id = $1",
        [req.params.tenantId],
      );
      const sortOrder = parseInt(orderRows[0].max_order, 10) + 1;

      const { rows } = await db.query(
        `INSERT INTO hero_scenes (tenant_id, url, file_path, label, sort_order)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.params.tenantId, publicUrl, filePath, label, sortOrder],
      );

      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("Hero scene upload failed:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ── PATCH /api/hero-scenes/:id/label ──────────────────────────────
// Update the label of a scene.
router.patch("/:id/label", requireAuth, async (req: Request, res: Response) => {
  const { label } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE hero_scenes SET label = $1 WHERE id = $2 RETURNING *",
      [label || null, req.params.id],
    );
    if (!rows[0]) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── PATCH /api/hero-scenes/:tenantId/reorder ──────────────────────
// Accepts: { order: string[] }  — array of scene IDs in desired order
router.patch(
  "/:tenantId/reorder",
  requireAuth,
  async (req: Request, res: Response) => {
    const { order } = req.body as { order: string[] };
    if (!Array.isArray(order)) {
      res.status(400).json({ message: "order must be an array of IDs" });
      return;
    }
    try {
      await Promise.all(
        order.map((id, idx) =>
          db.query(
            "UPDATE hero_scenes SET sort_order = $1 WHERE id = $2 AND tenant_id = $3",
            [idx, id, req.params.tenantId],
          ),
        ),
      );
      res.json({ message: "Reordered" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ── DELETE /api/hero-scenes/:id ────────────────────────────────────
// Delete a single scene (file + DB row).
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(
      "SELECT file_path FROM hero_scenes WHERE id = $1",
      [req.params.id],
    );
    if (!rows[0]) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    const fullPath = path.join(DATA_ROOT, rows[0].file_path);
    if (!fullPath.startsWith(DATA_ROOT)) {
      res.status(400).json({ message: "Invalid path" });
      return;
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await db.query("DELETE FROM hero_scenes WHERE id = $1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
