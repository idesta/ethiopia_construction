"use client";

import { Tenant } from "../../types";

interface HeroSectionProps {
  tenant: Tenant;
  accent: string;
  onScrollTo: (id: string) => void;
}

export function HeroSection({ tenant, accent, onScrollTo }: HeroSectionProps) {
  const contact = tenant.contacts?.[0];
  const words = tenant.name.split(" ");
  const lastName = words.slice(-1)[0];
  const firstName = words.slice(0, -1).join(" ");
  const yearsActive = tenant.founded_year
    ? new Date().getFullYear() - tenant.founded_year
    : null;

  return (
    <section id="home" className="hero">
      <div className="hero-bg" />
      <div className="hero-grid" />
      <div
        className="hero-accent-line"
        style={{
          background: `linear-gradient(to bottom, transparent, ${accent}44, transparent)`,
        }}
      />
      {yearsActive && <div className="hero-number">{yearsActive}</div>}

      <div className="hero-content">
        {tenant.logo_url ? (
          <div className="hero-brand">
            <img
              src={tenant.logo_url}
              alt={`${tenant.name} logo`}
              className="hero-logo"
            />
          </div>
        ) : null}
        <div className="hero-eyebrow" style={{ color: accent }}>
          <span className="hero-eyebrow-line" style={{ background: accent }} />
          {contact?.city || "Addis Ababa"}, Ethiopia
          {tenant.founded_year && ` · Est. ${tenant.founded_year}`}
        </div>
        <h1 className="hero-title display">
          {firstName}&nbsp;<em style={{ color: accent }}>{lastName}</em>
        </h1>
        <p className="hero-tagline">
          {tenant.tagline ||
            "Building the future of Ethiopia, one structure at a time."}
        </p>
        <div className="hero-actions">
          <button
            className="btn-primary"
            onClick={() => onScrollTo("projects")}
            style={{ background: accent }}
          >
            View Our Work
          </button>
          <button className="btn-outline" onClick={() => onScrollTo("contact")}>
            Contact Us
          </button>
        </div>
      </div>

      <div className="hero-scroll">
        <span>Scroll</span>
        <div
          className="scroll-line"
          style={{
            background: `linear-gradient(to bottom, ${accent}, transparent)`,
          }}
        />
      </div>
    </section>
  );
}
