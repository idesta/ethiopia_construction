import multer from "multer";
import path from "path";
import fs from "fs";

const DATA_ROOT = process.env.UPLOAD_PATH || "/mnt/data/uploads";

function getUploadDir(tenant: string, folder: string): string {
  // Sanitize inputs to prevent path traversal
  // NOTE: tenant MUST be provided - do not default to "unknown"
  const safeTenant = tenant.replace(/[^a-zA-Z0-9-_]/g, "");
  const safeFolder = (folder || "uploads").replace(/[^a-zA-Z0-9-_]/g, "");
  const dir = path.join(DATA_ROOT, safeTenant, safeFolder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    // Extract tenant and folder from body (FormData fields)
    const tenant =
      req.body?.tenant || ((req.query?.tenant as string) || "").trim();
    const folder =
      req.body?.folder || ((req.query?.folder as string) || "uploads").trim();

    // Tenant is required - will be validated by route handler but check here too
    if (!tenant) {
      cb(new Error("tenant slug is required"), "");
      return;
    }

    try {
      cb(null, getUploadDir(tenant, folder));
    } catch (err) {
      cb(err as Error, "");
    }
  },
  filename(_req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 40);
    cb(null, `${timestamp}-${base}${ext}`);
  },
});

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    // Lottie JSON
    "application/json",
    "application/*+json",
    "text/json",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
