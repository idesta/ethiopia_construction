import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/tenants  — list all (auth required)
router.get("/", requireAuth, async (_req: Request, res: Response) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM tenants ORDER BY created_at DESC",
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/tenants/slug/:slug  — public, used by frontend site pages
router.get("/slug/:slug", async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM tenants WHERE slug = $1 AND is_active = TRUE",
      [req.params.slug],
    );
    if (!rows[0]) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    const tenant = rows[0];

    // Fetch related data in parallel
    const [contacts, projects, teamRows, services] = await Promise.all([
      db.query("SELECT * FROM contacts WHERE tenant_id = $1", [tenant.id]),
      db.query(
        "SELECT * FROM projects WHERE tenant_id = $1 ORDER BY sort_order",
        [tenant.id],
      ),
      db.query("SELECT * FROM team WHERE tenant_id = $1 ORDER BY sort_order", [
        tenant.id,
      ]),
      db.query(
        "SELECT * FROM services WHERE tenant_id = $1 ORDER BY sort_order",
        [tenant.id],
      ),
    ]);

    res.json({
      ...tenant,
      contacts: contacts.rows,
      projects: projects.rows,
      team: teamRows.rows,
      services: services.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/tenants/:id  — get one with all relations (auth required)
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query("SELECT * FROM tenants WHERE id = $1", [
      req.params.id,
    ]);
    if (!rows[0]) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    const tenant = rows[0];
    const [contacts, projects, teamRows, services] = await Promise.all([
      db.query("SELECT * FROM contacts WHERE tenant_id = $1", [tenant.id]),
      db.query(
        "SELECT * FROM projects WHERE tenant_id = $1 ORDER BY sort_order",
        [tenant.id],
      ),
      db.query("SELECT * FROM team WHERE tenant_id = $1 ORDER BY sort_order", [
        tenant.id,
      ]),
      db.query(
        "SELECT * FROM services WHERE tenant_id = $1 ORDER BY sort_order",
        [tenant.id],
      ),
    ]);

    res.json({
      ...tenant,
      contacts: contacts.rows,
      projects: projects.rows,
      team: teamRows.rows,
      services: services.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/tenants  — create
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const {
    name,
    slug,
    tagline,
    logo_url,
    primary_color,
    accent_color,
    founded_year,
    is_active,
  } = req.body;
  if (!name || !slug) {
    res.status(400).json({ message: "name and slug required" });
    return;
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO tenants (name, slug, tagline, logo_url, primary_color, accent_color, founded_year, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        name,
        slug,
        tagline,
        logo_url,
        primary_color || "#1a1a2e",
        accent_color || "#f4a61d",
        founded_year,
        is_active ?? true,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ message: "Slug already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

// PUT /api/tenants/:id  — update
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const {
    name,
    slug,
    tagline,
    logo_url,
    primary_color,
    accent_color,
    founded_year,
    is_active,
  } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE tenants SET name=$1, slug=$2, tagline=$3, logo_url=$4,
       primary_color=$5, accent_color=$6, founded_year=$7, is_active=$8
       WHERE id=$9 RETURNING *`,
      [
        name,
        slug,
        tagline,
        logo_url,
        primary_color,
        accent_color,
        founded_year,
        is_active,
        req.params.id,
      ],
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

export default router;
