import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/:tenantId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM services WHERE tenant_id = $1 ORDER BY sort_order",
      [req.params.tenantId],
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:tenantId", requireAuth, async (req: Request, res: Response) => {
  const { title, description, icon, sort_order } = req.body;
  if (!title) {
    res.status(400).json({ message: "title required" });
    return;
  }
  try {
    const { rows } = await db.query(
      "INSERT INTO services (tenant_id, title, description, icon, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [req.params.tenantId, title, description, icon || "🏗️", sort_order || 0],
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const { title, description, icon, sort_order } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE services SET title=$1, description=$2, icon=$3, sort_order=$4 WHERE id=$5 RETURNING *",
      [title, description, icon, sort_order, req.params.id],
    );
    if (!rows[0]) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    await db.query("DELETE FROM services WHERE id = $1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
