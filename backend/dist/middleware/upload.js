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
// Build the folder path: /mnt/data/uploads/{tenant}/{folder}
// e.g. /mnt/data/uploads/company-one/projects
function getUploadDir(tenant, folder) {
    const dir = path_1.default.join(DATA_ROOT, tenant, folder);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    return dir;
}
const storage = multer_1.default.diskStorage({
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
function fileFilter(_req, file, cb) {
    const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
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
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});
