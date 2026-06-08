# main.py
import asyncio
import logging
import sys

from config import (
    TEST_MODE, TEST_LIMIT,
    CITY, KEYWORD,
    ALL_CITIES, ALL_KEYWORDS,
)
from scraper  import scrape
from enricher import enrich_leads
from scorer   import score_all
from exporter import export

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("main")


async def run():
    if TEST_MODE:
        logger.info("="*55)
        logger.info("  TEST MODE — 1 keyword, 1 city, 5 results max")
        logger.info(f"  Keyword : {KEYWORD}")
        logger.info(f"  City    : {CITY}")
        logger.info(f"  Limit   : {TEST_LIMIT} companies")
        logger.info("="*55)

        leads = await scrape(KEYWORD, CITY)

        logger.info("Enriching websites and extracting brand colors...")
        leads = await enrich_leads(leads)

        leads = score_all(leads)
        export(leads, label="test")

    else:
        logger.info("="*55)
        logger.info("  FULL RUN — all cities and keywords")
        logger.info("="*55)

        all_leads  = []
        seen       = set()
        total      = len(ALL_CITIES) * len(ALL_KEYWORDS)
        current    = 0

        for city in ALL_CITIES:
            for keyword in ALL_KEYWORDS:
                current += 1
                logger.info(f"[{current}/{total}] {keyword} — {city}")

                leads = await scrape(keyword, city)
                leads = await enrich_leads(leads)
                for lead in leads:
                    h = lead.get("dedup_hash")
                    if h and h in seen:
                        continue
                    if h:
                        seen.add(h)
                    all_leads.append(lead)

                logger.info(f"  Running total: {len(all_leads)} unique leads")

        all_leads = score_all(all_leads)
        export(all_leads, label="full_run")


if __name__ == "__main__":
    asyncio.run(run())
