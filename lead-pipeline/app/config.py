# config.py
import os

# ── Test mode ──────────────────────────────────────────────────
TEST_MODE  = os.getenv("TEST_MODE", "false").lower() == "true"
TEST_LIMIT = int(os.getenv("TEST_LIMIT", "5"))

# ── Single run targets (used in test mode) ─────────────────────
CITY    = os.getenv("CITY", "Addis Ababa")
KEYWORD = os.getenv("KEYWORD", "Construction Company")

# ── Pipeline behavior ──────────────────────────────────────────
RESULTS_PER_QUERY  = int(os.getenv("RESULTS_PER_QUERY", "50"))
API_DELAY_SECONDS  = int(os.getenv("API_DELAY_SECONDS", "2"))

# ── Output ─────────────────────────────────────────────────────
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "/mnt/data/leads")

# ── Full run targets ───────────────────────────────────────────
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
PAGE_LOAD_WAIT   = 4
SCROLL_WAIT      = 2
DETAIL_LOAD_WAIT = 3
MAX_SCROLLS      = 8