"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DATA_ROOT = process.env.UPLOAD_PATH || "/mnt/data/uploads";
function getUploadDir(tenant, folder) {
    // Sanitize inputs to prevent path traversal
    // NOTE: tenant MUST be provided - do not default to "unknown"
    const safeTenant = tenant.replace(/[^a-zA-Z0-9-_]/g, "");
    const safeFolder = (folder || "uploads").replace(/[^a-zA-Z0-9-_]/g, "");
    const dir = path_1.default.join(DATA_ROOT, safeTenant, safeFolder);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    return dir;
}
const storage = multer_1.default.diskStorage({
    destination(req, _file, cb) {
        // Extract tenant and folder from body (FormData fields)
        const tenant = req.body?.tenant || (req.query?.tenant || "").trim();
        const folder = req.body?.folder || (req.query?.folder || "uploads").trim();
        // Tenant is required - will be validated by route handler but check here too
        if (!tenant) {
            cb(new Error("tenant slug is required"), "");
            return;
        }
        try {
            cb(null, getUploadDir(tenant, folder));
        }
        catch (err) {
            cb(err, "");
        }
    },
    filename(_req, file, cb) {
        const timestamp = Date.now();
        const ext = path_1.default.extname(file.originalname);
        const base = path_1.default
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9-_]/g, "-")
            .slice(0, 40);
        cb(null, `${timestamp}-${base}${ext}`);
    },
});
function fileFilter(_req, file, cb) {
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
    }
    else {
        cb(new Error("Only image files are allowed"));
    }
}
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});
