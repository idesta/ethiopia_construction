"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Connection pool — reused across all requests
exports.db = new pg_1.Pool({
    host: process.env.POSTGRES_HOST || "postgres", // Docker service name
    port: Number(process.env.POSTGRES_PORT) || 5432,
    database: process.env.POSTGRES_DB || "construction",
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "changeme",
    max: 10, // max connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
// Run schema.sql on startup to create any missing tables.
// Split by semicolons and run each statement individually
// (pg Pool doesn't support multi-statement queries).
async function initSchema() {
    try {
        const schemaPath = path_1.default.join(__dirname, "schema.sql");
        if (!fs_1.default.existsSync(schemaPath)) {
            console.warn("⚠️  Schema file not found:", schemaPath);
            return;
        }
        const schema = fs_1.default.readFileSync(schemaPath, "utf-8");
        const statements = schema
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !s.startsWith("--"));
        for (const stmt of statements) {
            await exports.db.query(stmt);
        }
        console.log("✅ Schema initialized (tables verified)");
    }
    catch (err) {
        console.error("⚠️  Schema init failed:", err.message);
    }
}
// Test connection on startup + run schema
exports.db.connect()
    .then(async (client) => {
    console.log("✅ PostgreSQL connected");
    client.release();
    await initSchema();
})
    .catch((err) => {
    console.error("❌ PostgreSQL connection failed:", err.message);
});
