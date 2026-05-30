import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { db } from "../db/client";
import { requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

const DATA_ROOT = process.env.UPLOAD_PATH || "/mnt/data/uploads";
const PUBLIC_BASE = process.env.PUBLIC_URL || "http://localhost:4000";

// POST /api/upload
// Body: multipart/form-data  { file, tenant (slug), folder }
router.post(
  "/",
  requireAuth,
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const { tenant, folder } = req.body;

    // Relative path from DATA_ROOT for storage in DB
    const relativePath = path.relative(DATA_ROOT, req.file.path);

    // Public URL the frontend will use to display the file
    const publicUrl = `${PUBLIC_BASE}/uploads/${tenant}/${folder}/${req.file.filename}`;

    try {
      // Look up tenant id from slug
      const tenantResult = await db.query(
        "SELECT id FROM tenants WHERE slug = $1",
        [tenant],
      );
      const tenantId = tenantResult.rows[0]?.id;

      // Save metadata to DB
      if (tenantId) {
        await db.query(
          `INSERT INTO media_assets (tenant_id, file_path, public_url, asset_type, file_name, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            tenantId,
            relativePath,
            publicUrl,
            folder === "logo" ? "logo" : folder === "team" ? "photo" : "photo",
            req.file.originalname,
            req.file.size,
            req.file.mimetype,
          ],
        );
      }

      res.json({ url: publicUrl, path: relativePath });
    } catch (err) {
      console.error("Upload metadata error:", err);
      // File was saved, just metadata failed — still return URL
      res.json({ url: publicUrl, path: relativePath });
    }
  },
);

// DELETE /api/upload  — delete a file by path
router.delete("/", requireAuth, async (req: Request, res: Response) => {
  const { filePath } = req.body;
  if (!filePath) {
    res.status(400).json({ message: "filePath required" });
    return;
  }

  const fullPath = path.join(DATA_ROOT, filePath);

  // Safety check — prevent path traversal
  if (!fullPath.startsWith(DATA_ROOT)) {
    res.status(400).json({ message: "Invalid path" });
    return;
  }

  try {
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    await db.query("DELETE FROM media_assets WHERE file_path = $1", [filePath]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
