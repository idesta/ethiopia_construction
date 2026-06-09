# scorer.py

def compute_completeness(lead: dict) -> dict:
    """
    Check 6 contact fields and return:
      - completeness_score: 0-6 (raw count)
      - completeness_pct:   0-100 (percentage)
      - completeness_label: High / Medium / Low
      - completeness_fields: dict showing which fields present
    """
    has_phone   = bool(lead.get("phone"))
    has_email   = bool(lead.get("email"))
    has_website = lead.get("website_status") == "Active"
    has_address = bool(lead.get("street_address"))
    has_maps    = bool(lead.get("google_maps_url"))
    has_social  = any([
        lead.get("telegram_url"),
        lead.get("facebook_url"),
        lead.get("instagram_url"),
        lead.get("linkedin_url"),
        lead.get("youtube_url"),
        lead.get("tiktok_url"),
    ])

    fields = {
        "phone":   has_phone,
        "email":   has_email,
        "website": has_website,
        "address": has_address,
        "maps":    has_maps,
        "social":  has_social,
    }

    raw   = sum(fields.values())
    pct   = round((raw / 6) * 100)

    if raw >= 5:
        label = "High"
    elif raw >= 3:
        label = "Medium"
    else:
        label = "Low"

    return {
        "completeness_score":  raw,
        "completeness_pct":    pct,
        "completeness_label":  label,
        "completeness_fields": fields,
    }


def score_lead(lead: dict) -> dict:
    """
    Assign lead_score (0-100), lead_priority,
    recommended_service, and completeness fields.
    """
    score          = 50
    website_status = lead.get("website_status", "None")
    review_count   = lead.get("review_count") or 0
    has_telegram   = bool(lead.get("telegram_url"))
    has_facebook   = bool(lead.get("facebook_url"))
    has_instagram  = bool(lead.get("instagram_url"))
    has_linkedin   = bool(lead.get("linkedin_url"))
    social_count   = sum([
        has_telegram, has_facebook,
        has_instagram, has_linkedin
    ])

    # ── Website status base score ──────────────────────────
    if website_status == "None":
        score   = 82
        service = "Website Development"

    elif website_status == "Broken":
        score   = 72
        service = "Website Redesign"

    else:
        score = 45
        if review_count < 5:
            score  += 15
            service = "SEO Optimization"
        elif review_count < 20:
            score  += 8
            service = "Digital Marketing"
        else:
            score  += 2
            service = "CRM System Integration"

        if social_count >= 3:
            score  -= 10
            service = "AI Automation"

        if not lead.get("email"):
            score += 8

    # ── Telegram bonus ─────────────────────────────────────
    if has_telegram and website_status == "None":
        score += 5

    # ── Rating bonus ───────────────────────────────────────
    rating = lead.get("rating") or 0
    if rating >= 4.5 and review_count >= 10:
        score += 5

    # ── Completeness bonus (NEW) ───────────────────────────
    # Compute completeness first
    completeness = compute_completeness(lead)
    raw          = completeness["completeness_score"]

    # +3 per completeness field present (max +18 bonus)
    completeness_bonus = raw * 3
    score += completeness_bonus

    # Extra bonus for having phone specifically
    if lead.get("phone"):
        score += 5

    # Extra bonus for having both phone AND email
    if lead.get("phone") and lead.get("email"):
        score += 5

    # ── Clamp to 0-100 ────────────────────────────────────
    score = max(0, min(100, score))

    # ── Priority bands ─────────────────────────────────────
    if score >= 70:
        priority = "High"
    elif score >= 45:
        priority = "Medium"
    else:
        priority = "Low"

    return {
        **lead,
        "lead_score":          score,
        "lead_priority":       priority,
        "recommended_service": service,
        **completeness,
    }


def score_all(leads: list[dict]) -> list[dict]:
    return [score_lead(lead) for lead in leads]