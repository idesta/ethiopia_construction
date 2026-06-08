# scorer.py

def score_lead(lead: dict) -> dict:
    score = 50
    website_status = lead.get("website_status", "None")
    review_count   = lead.get("review_count") or 0
    has_telegram   = bool(lead.get("telegram_url"))
    has_facebook   = bool(lead.get("facebook_url"))
    has_instagram  = bool(lead.get("instagram_url"))
    has_linkedin   = bool(lead.get("linkedin_url"))
    social_count   = sum([has_telegram, has_facebook, has_instagram, has_linkedin])

    if website_status == "None":
        score = 82
        service = "Website Development"
    elif website_status == "Broken":
        score = 72
        service = "Website Redesign"
    else:
        score = 45
        if review_count < 5:
            score += 15
            service = "SEO Optimization"
        elif review_count < 20:
            score += 8
            service = "Digital Marketing"
        else:
            score += 2
            service = "CRM System Integration"
        if social_count >= 3:
            score -= 10
            service = "AI Automation"
        if not lead.get("email"):
            score += 8

    if has_telegram and website_status == "None":
        score += 5

    rating = lead.get("rating") or 0
    if rating >= 4.5 and review_count >= 10:
        score += 5

    score = max(0, min(100, score))

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
    }


def score_all(leads: list[dict]) -> list[dict]:
    return [score_lead(lead) for lead in leads]
