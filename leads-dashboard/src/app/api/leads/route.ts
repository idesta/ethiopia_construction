import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LEADS_DIR = process.env.LEADS_DIR || "/mnt/data/leads";
const RUNS_DIR  = path.join(LEADS_DIR, "runs");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const run = searchParams.get("run");

  if (!run) {
    return NextResponse.json(
      { error: "run parameter required" },
      { status: 400 }
    );
  }

  // Security: prevent path traversal
  const safe = path.basename(run);
  const jsonFile = path.join(RUNS_DIR, safe, "leads.json");

  if (!fs.existsSync(jsonFile)) {
    return NextResponse.json(
      { error: "Run not found", leads: [] },
      { status: 404 }
    );
  }

  try {
    const raw   = fs.readFileSync(jsonFile, "utf-8");
    const leads = JSON.parse(raw);
    return NextResponse.json({ leads: Array.isArray(leads) ? leads : [] });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse leads", leads: [] },
      { status: 500 }
    );
  }
}
