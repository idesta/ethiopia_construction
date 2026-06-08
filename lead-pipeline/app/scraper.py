# scraper.py
import asyncio
import hashlib
import logging
import re
from datetime import date
from typing import Optional

from playwright.async_api import async_playwright, TimeoutError as PWTimeout
from config import (
    PAGE_LOAD_WAIT, SCROLL_WAIT, DETAIL_LOAD_WAIT,
    MAX_SCROLLS, TEST_MODE, TEST_LIMIT
)

logger = logging.getLogger(__name__)

SOCIAL_PATTERNS = {
    "facebook_url":  r'https?://(?:www\.)?facebook\.com/[\w./-]+',
    "instagram_url": r'https?://(?:www\.)?instagram\.com/[\w./-]+',
    "linkedin_url":  r'https?://(?:www\.)?linkedin\.com/[\w./-]+',
    "youtube_url":   r'https?://(?:www\.)?youtube\.com/[\w./-]+',
    "tiktok_url":    r'https?://(?:www\.)?tiktok\.com/@[\w./-]+',
    "telegram_url":  r'https?://(?:t\.me|telegram\.me)/[\w./-]+',
}


def normalize_phone(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    digits = re.sub(r'\D', '', raw)
    if digits.startswith('251') and len(digits) == 12:
        return f"+{digits}"
    if digits.startswith('0') and len(digits) == 10:
        return f"+251{digits[1:]}"
    if len(digits) == 9:
        return f"+251{digits}"
    return raw


def make_dedup_hash(phone: Optional[str], maps_url: Optional[str]) -> str:
    key = (phone or "") + (maps_url or "")
    return hashlib.md5(key.encode()).hexdigest()


def extract_socials(text: str) -> dict:
    result = {}
    for key, pattern in SOCIAL_PATTERNS.items():
        matches = re.findall(pattern, text or "")
        result[key] = matches[0] if matches else None
    return result


async def scrape(keyword: str, city: str) -> list[dict]:
    """
    Open Google Maps, search keyword+city,
    scroll through results, extract business data.
    """
    search_query = f"{keyword} in {city}, Ethiopia"
    # maps_url = f"https://www.google.com/maps/search/{search_query.replace(' ', '+')}"
    maps_url = f"https://www.google.com/maps/search/{search_query.replace(' ', '+')}?hl=en"

    leads = []

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-first-run",
                "--no-zygote",
                "--single-process",
                "--lang=en-US",
            ]
        )

        context = await browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent=(
                "Mozilla/5.0 (X11; Linux x86_64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            locale="en-US",
            extra_http_headers={
                "Accept-Language": "en-US,en;q=0.9",
            }
        )

        page = await context.new_page()

        logger.info(f"Opening Maps: {search_query}")
        await page.goto(maps_url, wait_until="domcontentloaded")
        await asyncio.sleep(PAGE_LOAD_WAIT)

        # ── Scroll sidebar to load more results ───────────
        scroll_count = 0
        while scroll_count < MAX_SCROLLS:
            # The results live in a scrollable sidebar div
            sidebar = page.locator('div[role="feed"]')
            try:
                await sidebar.evaluate("el => el.scrollBy(0, 800)")
                await asyncio.sleep(SCROLL_WAIT)
                scroll_count += 1

                # Stop early in test mode once enough cards loaded
                cards = await page.locator(
                    'div[role="feed"] > div > div > a'
                ).count()
                logger.info(f"  Scroll {scroll_count}: {cards} cards visible")

                if TEST_MODE and cards >= TEST_LIMIT:
                    logger.info(f"  Test limit reached ({TEST_LIMIT}) — stopping scroll")
                    break

            except Exception as e:
                logger.debug(f"  Scroll error: {e}")
                break

        # ── Collect all business card links ───────────────
        card_links = await page.locator(
            'div[role="feed"] > div > div > a'
        ).all()

        logger.info(f"Found {len(card_links)} business cards total")

        if TEST_MODE:
            card_links = card_links[:TEST_LIMIT]
            logger.info(f"Test mode: processing first {TEST_LIMIT} only")

        # ── Visit each business page for full details ─────
        for i, card in enumerate(card_links):
            try:
                href = await card.get_attribute("href")
                if not href:
                    continue

                logger.info(f"  [{i+1}/{len(card_links)}] Opening business page...")

                detail_page = await context.new_page()
                await detail_page.goto(href, wait_until="domcontentloaded")
                await asyncio.sleep(DETAIL_LOAD_WAIT)

                lead = await extract_business_details(detail_page, href)
                if lead:
                    leads.append(lead)
                    logger.info(f"  ✓ {lead.get('company_name', 'Unknown')}")

                await detail_page.close()

            except PWTimeout:
                logger.warning(f"  Timeout on card {i+1} — skipping")
                continue
            except Exception as e:
                logger.warning(f"  Error on card {i+1}: {e} — skipping")
                continue

        await browser.close()

    return leads


async def extract_business_details(page, url: str) -> Optional[dict]:
    """Extract all available data from one business detail page."""
    try:
        # ── Name ──────────────────────────────────────────
        name = None
        try:
            name = await page.locator('h1').first.inner_text(timeout=3000)
            name = name.strip()
        except Exception:
            pass

        if not name:
            return None

        # ── Category ──────────────────────────────────────
        category = None
        try:
            category = await page.locator(
                'button[jsaction*="category"]'
            ).first.inner_text(timeout=2000)
        except Exception:
            pass

        # ── Phone ─────────────────────────────────────────
        phone = None
        try:
            phone_el = page.locator('[data-tooltip="Copy phone number"]')
            if await phone_el.count() > 0:
                phone = await phone_el.first.get_attribute("data-item-id")
                if phone:
                    phone = phone.replace("phone:", "").strip()
        except Exception:
            pass

        # ── Website ───────────────────────────────────────
        website = None
        try:
            web_el = page.locator('a[data-tooltip="Open website"]')
            if await web_el.count() > 0:
                website = await web_el.first.get_attribute("href")
        except Exception:
            pass

        # ── Address ───────────────────────────────────────
        address = None
        try:
            addr_el = page.locator('[data-tooltip="Copy address"]')
            if await addr_el.count() > 0:
                address = await addr_el.first.get_attribute("aria-label")
                if address:
                    address = address.replace("Address: ", "").strip()
        except Exception:
            pass

        # ── Rating ────────────────────────────────────────
        rating = None
        review_count = 0
        try:
            rating_text = await page.locator(
                'div[role="main"] span[aria-hidden="true"]'
            ).first.inner_text(timeout=2000)
            rating_match = re.search(r'(\d+\.\d+)', rating_text)
            if rating_match:
                rating = float(rating_match.group(1))
        except Exception:
            pass

        try:
            review_text = await page.locator(
                'span[aria-label*="review"]'
            ).first.get_attribute("aria-label", timeout=2000)
            if review_text:
                review_match = re.search(r'(\d+)', review_text.replace(',', ''))
                if review_match:
                    review_count = int(review_match.group(1))
        except Exception:
            pass

        # ── Page full text for social link scanning ───────
        try:
            full_text = await page.content()
        except Exception:
            full_text = ""

        socials = extract_socials(full_text)

        # ── Normalize and build lead ───────────────────────
        phone = normalize_phone(phone)

        return {
            "company_name":        name,
            "business_category":   category,
            "phone":               phone,
            "email":               None,      # comes from enricher
            "website":             website,
            "street_address":      address,
            "city":                "Addis Ababa",
            "region":              "Addis Ababa",
            "country":             "Ethiopia",
            "google_maps_url":     url,
            "latitude":            None,
            "longitude":           None,
            "rating":              rating,
            "review_count":        review_count,
            **socials,
            "website_status":      "None" if not website else "Unknown",
            "lead_score":          None,
            "lead_priority":       None,
            "recommended_service": None,
            "data_source":         "playwright",
            "collection_date":     date.today().isoformat(),
            "dedup_hash":          make_dedup_hash(phone, url),
        }

    except Exception as e:
        logger.error(f"extract_business_details failed: {e}")
        return None
