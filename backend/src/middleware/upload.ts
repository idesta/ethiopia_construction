import multer from "multer";
import path from "path";
import fs from "fs";

const DATA_ROOT = process.env.UPLOAD_PATH || "/mnt/data/uploads";

function getUploadDir(tenant: string, folder: string): string {
  // Sanitize inputs to prevent path traversal
  const safeTenant = (tenant || "unknown").replace(/[^a-zA-Z0-9-_]/g, "");
  const safeFolder = (folder || "uploads").replace(/[^a-zA-Z0-9-_]/g, "");
  const dir = path.join(DATA_ROOT, safeTenant, safeFolder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    // multer processes body BEFORE this runs for multipart forms
    // but sometimes body fields arrive after — use a fallback
    const tenant =
      req.body?.tenant || (req.query?.tenant as string) || "unknown";
    const folder =
      req.body?.folder || (req.query?.folder as string) || "uploads";
    cb(null, getUploadDir(tenant, folder));
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
