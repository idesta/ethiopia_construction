import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LEADS_DIR = process.env.LEADS_DIR || "/mnt/data/leads";
const RUNS_DIR  = path.join(LEADS_DIR, "runs");

export async function GET() {
  try {
    if (!fs.existsSync(RUNS_DIR)) {
      return NextResponse.json({ runs: [] });
    }

    const entries = fs.readdirSync(RUNS_DIR, { withFileTypes: true });

    const runs = entries
      .filter((e) => e.isDirectory())
      .map((e) => {
        const runPath  = path.join(RUNS_DIR, e.name);
        const jsonFile = path.join(runPath, "leads.json");
        let count      = 0;
        let sizeKB     = 0;

        if (fs.existsSync(jsonFile)) {
          try {
            const raw  = fs.readFileSync(jsonFile, "utf-8");
            const data = JSON.parse(raw);
            count      = Array.isArray(data) ? data.length : 0;
            sizeKB     = Math.round(
              fs.statSync(jsonFile).size / 1024
            );
          } catch {
            count = 0;
          }
        }

        return {
          name:    e.name,
          count,
          sizeKB,
          hasData: fs.existsSync(jsonFile),
        };
      })
      // Latest run first
      .sort((a, b) => b.name.localeCompare(a.name));

    return NextResponse.json({ runs });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list runs", runs: [] },
      { status: 500 }
    );
  }
}
