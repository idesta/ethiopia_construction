import multer from "multer";
import path from "path";
import fs from "fs";

const DATA_ROOT = process.env.UPLOAD_PATH || "/mnt/data/uploads";

// Build the folder path: /mnt/data/uploads/{tenant}/{folder}
// e.g. /mnt/data/uploads/company-one/projects
function getUploadDir(tenant: string, folder: string): string {
  const dir = path.join(DATA_ROOT, tenant, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const tenant = req.body.tenant || "unknown";
    const folder = req.body.folder || "uploads";
    cb(null, getUploadDir(tenant, folder));
  },
  filename(_req, file, cb) {
    const timestamp = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    cb(null, `${timestamp}-${safe}`);
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
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});
