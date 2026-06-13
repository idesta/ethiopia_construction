"use client";

import { motion } from "framer-motion";
import { Tenant } from "../../types";
import { heroStagger, heroChild } from "../ui/Motion";
import { HeritageMotif } from "../ui/EthiopianGeometric";

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

      <motion.div
        className="hero-content"
        variants={heroStagger}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative motif */}
        <HeritageMotif
          accent={accent}
          className="absolute -top-16 -left-16 opacity-40"
        />

        {tenant.logo_url ? (
          <motion.div className="hero-brand" variants={heroChild}>
            <img
              src={tenant.logo_url}
              alt={`${tenant.name} logo`}
              className="hero-logo"
            />
          </motion.div>
        ) : null}

        <motion.div className="hero-eyebrow" style={{ color: accent }} variants={heroChild}>
          <span className="hero-eyebrow-line" style={{ background: accent }} />
          {contact?.city || "Addis Ababa"}, Ethiopia
          {tenant.founded_year && ` · Est. ${tenant.founded_year}`}
        </motion.div>

        <motion.h1 className="hero-title display" variants={heroChild}>
          {firstName ? `${firstName} ` : ""}
          <em style={{ color: accent }}>{lastName}</em>
        </motion.h1>

        <motion.p className="hero-tagline" variants={heroChild}>
          {tenant.tagline ||
            "Building the future of Ethiopia, one structure at a time."}
        </motion.p>

        <motion.div className="hero-actions" variants={heroChild}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onScrollTo("projects")}
            style={{ background: accent }}
          >
            View Our Work
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => onScrollTo("contact")}
          >
            Contact Us
          </button>
        </motion.div>
      </motion.div>

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
