import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";

export interface AuthRequest extends Request {
  adminEmail?: string;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  // JWT comes from httpOnly cookie set at login
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email: string };
    req.adminEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
