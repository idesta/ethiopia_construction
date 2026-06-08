# config.py
import os

# ── Test mode settings ─────────────────────────────────────────
# When TEST_MODE=true, stops after TEST_LIMIT results
TEST_MODE  = os.getenv("TEST_MODE", "false").lower() == "true"
TEST_LIMIT = int(os.getenv("TEST_LIMIT", "5"))

# ── Search settings (overridable via env) ──────────────────────
CITY    = os.getenv("CITY", "Addis Ababa")
KEYWORD = os.getenv("KEYWORD", "Construction Company")

# ── Full run targets (used when not in test mode) ──────────────
ALL_CITIES = [
    "Addis Ababa",
    "Adama",
    "Hawassa",
    "Bahir Dar",
    "Dire Dawa",
]

ALL_KEYWORDS = [
    "Construction Company",
    "Building Contractor",
    "General Contractor",
    "Civil Engineering Company",
    "Architecture Firm",
    "Real Estate Developer",
    "Road Contractor",
    "Construction Consultant",
    "Water Works Contractor",
    "Electrical Contractor",
    "HVAC Contractor",
    "Construction Material Supplier",
    "Infrastructure Company",
    "Engineering Consultant",
]

# ── Browser settings ───────────────────────────────────────────
# Seconds to wait for Maps results to load
PAGE_LOAD_WAIT    = 4
# Seconds to wait after each scroll
SCROLL_WAIT       = 2
# Seconds to wait when opening a business detail page
DETAIL_LOAD_WAIT  = 3
# Max scrolls before moving on (prevents infinite loops)
MAX_SCROLLS       = 8

# ── Output ─────────────────────────────────────────────────────
OUTPUT_DIR = "/output"
