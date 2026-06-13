"use client";

import { motion } from "framer-motion";
import { geoReveal } from "./Motion";

/* ── Ethiopian Diamond Meander Rule (section separator) ─── */

interface GeoRuleProps {
  accent?: string;
  className?: string;
}

export function GeoRule({ accent, className = "" }: GeoRuleProps) {
  return (
    <div
      className={`geo-rule ${className}`}
      style={accent ? { color: accent } : undefined}
    >
      <span className="geo-diamond" />
      <span className="geo-diamond geo-diamond--fill" />
      <span className="geo-diamond" />
    </div>
  );
}

/* ── Heritage Lattice background wrapper (diamond reveal) ─ */

interface HeritageRevealProps {
  children: React.ReactNode;
  className?: string;
}

export function HeritageReveal({
  children,
  className = "",
}: HeritageRevealProps) {
  return (
    <motion.div
      className={`eth-lattice ${className}`}
      variants={geoReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {children}
    </motion.div>
  );
}

/* ── Gold Diamond icon ─────────────────────────────────── */

export function DiamondIcon({
  size = 12,
  fill = false,
  accent,
}: {
  size?: number;
  fill?: boolean;
  accent?: string;
}) {
  const color = accent || "var(--accent, #d4af37)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="6"
        y="1"
        width="7.07"
        height="7.07"
        rx="1"
        transform="rotate(45 6 1)"
        stroke={color}
        strokeWidth="1.2"
        fill={fill ? color : "none"}
      />
    </svg>
  );
}

/* ── Heritage Motif (decorative SVG for sections) ──────── */

interface MotifProps {
  accent?: string;
  className?: string;
}

export function HeritageMotif({ accent, className = "" }: MotifProps) {
  const color = accent || "var(--accent, #d4af37)";
  return (
    <svg
      className={className}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      opacity="0.6"
    >
      <rect
        x="60"
        y="20"
        width="28.28"
        height="28.28"
        rx="2"
        transform="rotate(45 60 20)"
        stroke={color}
        strokeWidth="1"
      />
      <rect
        x="20"
        y="60"
        width="14"
        height="14"
        rx="1"
        transform="rotate(45 20 60)"
        stroke={color}
        strokeWidth="0.8"
      />
      <rect
        x="86"
        y="60"
        width="14"
        height="14"
        rx="1"
        transform="rotate(45 86 60)"
        stroke={color}
        strokeWidth="0.8"
      />
      <rect
        x="60"
        y="60"
        width="14"
        height="14"
        rx="1"
        transform="rotate(45 60 60)"
        stroke={color}
        strokeWidth="0.8"
        fill={color}
        fillOpacity="0.15"
      />
      <rect
        x="60"
        y="100"
        width="28.28"
        height="28.28"
        rx="2"
        transform="rotate(45 60 100)"
        stroke={color}
        strokeWidth="0.8"
      />
    </svg>
  );
}