"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
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
// Test connection on startup
exports.db.connect()
    .then((client) => {
    console.log("✅ PostgreSQL connected");
    client.release();
})
    .catch((err) => {
    console.error("❌ PostgreSQL connection failed:", err.message);
});
