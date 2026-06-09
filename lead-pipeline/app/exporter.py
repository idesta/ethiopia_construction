# exporter.py
import json
import logging
import os
from datetime import datetime
from config import OUTPUT_DIR

import pandas as pd

logger = logging.getLogger(__name__)

#OUTPUT_DIR = os.getenv("OUTPUT_DIR", "/output")

COLUMN_ORDER = [
    "company_name", "business_category", "phone", "email",
    "website", "street_address", "city", "region", "country",
    "google_maps_url", "latitude", "longitude",
    "rating", "review_count",
    "facebook_url", "instagram_url", "linkedin_url",
    "youtube_url", "tiktok_url", "telegram_url",
    "website_status",
    "brand_primary_color", "brand_accent_color", "brand_colors_found",
    "lead_score", "lead_priority", "recommended_service",
    "completeness_score", "completeness_pct", "completeness_label",
    "data_source", "collection_date",
]

def export(leads: list[dict], label: str = "test"):
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
    run_dir   = os.path.join(OUTPUT_DIR, "runs", f"{timestamp}_{label}")
    os.makedirs(run_dir, exist_ok=True)

    # ── JSON ──────────────────────────────────────────────
    json_path = os.path.join(run_dir, "leads.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(leads, f, ensure_ascii=False, indent=2, default=str)

    # ── CSV ───────────────────────────────────────────────
    df = pd.DataFrame(leads)
    for col in COLUMN_ORDER:
        if col not in df.columns:
            df[col] = None
    df = df[[c for c in COLUMN_ORDER if c in df.columns]]
    df = df.drop(columns=["dedup_hash"], errors="ignore")

    csv_path = os.path.join(run_dir, "leads.csv")
    df.to_csv(csv_path, index=False, encoding="utf-8-sig")

    # ── Summary ───────────────────────────────────────────
    print("\n" + "="*55)
    print(f"  RUN COMPLETE — {len(leads)} leads collected")
    print(f"  Folder → {run_dir}")
    print(f"  CSV    → leads.csv")
    print(f"  JSON   → leads.json")
    print("="*55)

    if len(df):
        print("\n  Priority breakdown:")
        if "lead_priority" in df.columns:
            print(df["lead_priority"].value_counts().to_string())
        print("\n  Recommended services:")
        if "recommended_service" in df.columns:
            print(df["recommended_service"].value_counts().to_string())
        print("\n  Website status:")
        if "website_status" in df.columns:
            print(df["website_status"].value_counts().to_string())
    print()

    return run_dir
