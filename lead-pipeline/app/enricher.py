# enricher.py
import asyncio
import logging
import re
from typing import Optional
from collections import Counter

import httpx

logger = logging.getLogger(__name__)

EMAIL_PATTERN = re.compile(r'[\w.+-]+@[\w-]+\.[\w.]+')

# Common brand color extraction patterns
CSS_COLOR_PATTERN = re.compile(
    r'(?:color|background|background-color|border-color)\s*:\s*'
    r'(#[0-9a-fA-F]{3,6}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))',
    re.IGNORECASE
)

HEX_PATTERN = re.compile(r'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})')

# Colors to ignore — these are generic web defaults, not brand colors
IGNORE_COLORS = {
    '#ffffff', '#fff', '#000000', '#000',
    '#333333', '#333', '#666666', '#666',
    '#999999', '#999', '#cccccc', '#ccc',
    '#eeeeee', '#eee', '#f0f0f0', '#f5f5f5',
    '#fafafa', '#e0e0e0', '#bdbdbd', '#9e9e9e',
    '#212121', '#424242', '#757575',
    '#transparent', 'transparent',
}


def hex_to_normalized(hex_color: str) -> Optional[str]:
    """Normalize hex color to 6-digit lowercase."""
    hex_color = hex_color.strip().lower()
    if not hex_color.startswith('#'):
        hex_color = f'#{hex_color}'
    if len(hex_color) == 4:
        # Expand 3-digit to 6-digit: #abc → #aabbcc
        hex_color = f'#{hex_color[1]*2}{hex_color[2]*2}{hex_color[3]*2}'
    return hex_color if len(hex_color) == 7 else None


def is_dark(hex_color: str) -> bool:
    """Check if a color is dark (good for primary brand color detection)."""
    try:
        h = hex_color.lstrip('#')
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        return luminance < 0.5
    except Exception:
        return False


def is_light(hex_color: str) -> bool:
    return not is_dark(hex_color)


def extract_brand_colors(html: str, css: str = "") -> dict:
    """
    Extract the most likely primary and accent brand colors
    from a company website's HTML and CSS.

    Strategy:
    1. Find all hex colors in CSS/style tags
    2. Remove generic/default web colors
    3. Count frequency — most used = likely brand color
    4. Split into dark colors (primary) and light/vivid (accent)
    """
    combined = html + " " + css

    # Find all hex colors
    all_colors = []
    for match in HEX_PATTERN.finditer(combined):
        color = hex_to_normalized(f'#{match.group(1)}')
        if color and color not in IGNORE_COLORS:
            all_colors.append(color)

    if not all_colors:
        return {
            "brand_primary_color": None,
            "brand_accent_color":  None,
            "brand_colors_found":  [],
        }

    # Count frequency
    color_counts = Counter(all_colors)

    # Top 10 most frequent non-generic colors
    top_colors = [color for color, count in color_counts.most_common(10)]

    # Primary = most frequent dark color (likely header/navbar/text color)
    primary = next(
        (c for c in top_colors if is_dark(c)),
        top_colors[0] if top_colors else None
    )

    # Accent = most frequent light/vivid color different from primary
    accent = next(
        (c for c in top_colors if c != primary and is_light(c)),
        None
    )

    # If no light accent found, take second most frequent
    if not accent and len(top_colors) > 1:
        accent = next(
            (c for c in top_colors if c != primary),
            None
        )

    return {
        "brand_primary_color": primary,
        "brand_accent_color":  accent,
        "brand_colors_found":  top_colors[:5],  # top 5 for reference
    }


async def check_website(url: Optional[str]) -> dict:
    """
    Check if a website is live and extract:
    - Website status
    - Email addresses
    - Brand colors
    """
    empty = {
        "website_status":      "None",
        "email":               None,
        "brand_primary_color": None,
        "brand_accent_color":  None,
        "brand_colors_found":  [],
    }

    if not url:
        return empty

    if not url.startswith("http"):
        url = f"https://{url}"

    try:
        async with httpx.AsyncClient(
            timeout=20,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; LeadBot/1.0)",
                "Accept-Language": "en-US,en;q=0.9",
            },
        ) as client:
            resp = await client.get(url)

            if resp.status_code >= 400:
                return {**empty, "website_status": "Broken"}

            html = resp.text

            # ── Email extraction ───────────────────────────
            emails = EMAIL_PATTERN.findall(html)
            clean_emails = [
                e for e in emails
                if not any(skip in e for skip in [
                    "@example", "@test", "@domain",
                    ".png", ".jpg", ".gif", ".svg",
                    "sentry", "wixpress", "schema",
                ])
            ]

            # ── Brand color extraction ─────────────────────
            # Also fetch CSS if we can find a stylesheet link
            css_content = ""
            css_links = re.findall(
                r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']([^"\']+)["\']',
                html, re.IGNORECASE
            )
            # Try fetching the first external stylesheet
            if css_links:
                css_url = css_links[0]
                if not css_url.startswith('http'):
                    base = url.rstrip('/')
                    css_url = f"{base}/{css_url.lstrip('/')}"
                try:
                    css_resp = await client.get(css_url)
                    if css_resp.status_code == 200:
                        css_content = css_resp.text
                except Exception:
                    pass

            brand_colors = extract_brand_colors(html, css_content)

            return {
                "website_status":      "Active",
                "email":               clean_emails[0] if clean_emails else None,
                **brand_colors,
            }

    except Exception as e:
        logger.debug(f"Website check failed for {url}: {e}")
        return {**empty, "website_status": "Broken"}


async def enrich_leads(leads: list[dict]) -> list[dict]:
    """Enrich all leads with website status, email, and brand colors."""
    enriched = []
    total = len(leads)

    for i, lead in enumerate(leads):
        website = lead.get("website")

        if website:
            logger.info(
                f"  [{i+1}/{total}] Checking: {website}"
            )
            result = await check_website(website)

            lead["website_status"]      = result["website_status"]
            lead["brand_primary_color"] = result.get("brand_primary_color")
            lead["brand_accent_color"]  = result.get("brand_accent_color")
            lead["brand_colors_found"]  = result.get("brand_colors_found", [])

            # Only set email if not already found
            if not lead.get("email"):
                lead["email"] = result.get("email")

            logger.info(
                f"       Status: {result['website_status']} | "
                f"Email: {result.get('email') or 'none'} | "
                f"Primary: {result.get('brand_primary_color') or 'none'} | "
                f"Accent: {result.get('brand_accent_color') or 'none'}"
            )
        else:
            lead["brand_primary_color"] = None
            lead["brand_accent_color"]  = None
            lead["brand_colors_found"]  = []

        enriched.append(lead)

    return enriched
