"use client";

import { Tenant } from "../../types";
import { PrimaryButton, OutlineButton } from "../ui/Buttons";

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
      {/* Background layers */}
      <div className="hero-bg" />
      <div className="hero-grid" />
      <div
        className="hero-accent-line"
        style={{
          background: `linear-gradient(to bottom, transparent, ${accent}44, transparent)`,
        }}
      />

      {/* Large ghost year number */}
      {yearsActive && <div className="hero-number">{yearsActive}</div>}

      {/* Main content */}
      <div className="hero-content">
        <div className="hero-eyebrow" style={{ color: accent }}>
          <span className="hero-eyebrow-line" style={{ background: accent }} />
          {contact?.city || "Addis Ababa"}, Ethiopia
          {tenant.founded_year && ` · Est. ${tenant.founded_year}`}
        </div>

        <h1 className="hero-title display">
          {firstName}&nbsp;
          <em style={{ color: accent }}>{lastName}</em>
        </h1>

        <p className="hero-tagline">
          {tenant.tagline ||
            "Building the future of Ethiopia, one structure at a time."}
        </p>

        <div className="hero-actions">
          <PrimaryButton onClick={() => onScrollTo("projects")} accent={accent}>
            View Our Work
          </PrimaryButton>
          <OutlineButton onClick={() => onScrollTo("contact")} accent={accent}>
            Contact Us
          </OutlineButton>
        </div>
      </div>

      {/* Scroll indicator */}
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
