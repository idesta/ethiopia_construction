import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/client";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";

// Helper: Determine if connection is secure (via proxy headers or direct HTTPS)
const isSecure = (req: Request): boolean => {
  return (
    req.header("x-forwarded-proto") === "https" || req.protocol === "https"
  );
};

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password required" });
    return;
  }

  try {
    const result = await db.query(
      "SELECT * FROM admin_users WHERE email = $1",
      [email],
    );
    const user = result.rows[0];

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set secure flag based on actual connection protocol (via proxy headers)
    res.cookie("token", token, { ...COOKIE_OPTS, secure: isSecure(req) });
    res.json({ user: { email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ email: req.adminEmail });
});

// POST /api/auth/create-admin  (run once to create first admin)
// Remove or protect this route after first use
router.post("/create-admin", async (req: Request, res: Response) => {
  const { email, password, secret } = req.body;

  if (secret !== process.env.ADMIN_CREATE_SECRET) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await db.query(
      "INSERT INTO admin_users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, hash],
    );
    res.status(201).json({ admin: result.rows[0] });
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ message: "Admin already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

export default router;
