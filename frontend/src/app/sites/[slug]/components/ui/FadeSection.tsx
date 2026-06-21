"use client";

import { motion } from "framer-motion";
import { revealDepth, revealTilt } from "./Motion";

const VARIANTS = { depth: revealDepth, tilt: revealTilt };

/**
 * Fusion scroll-reveal wrapper.
 * Replaces the old IntersectionObserver approach with
 * Framer Motion's `whileInView` for smooth, cascading entrances.
 * Automatically respects `prefers-reduced-motion`.
 *
 * variant="depth" (default) — fade + rise + a restrained 3D tilt,
 * used for everyday section content (stats, cards, text blocks).
 * variant="tilt" — a stronger perspective swing, reserved for one
 * or two standout sections so it still feels special.
 */
export function FadeSection({
  children,
  delay = 0,
  className,
  variant = "depth",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variant?: "depth" | "tilt";
}) {
  return (
    <motion.div
      className={className}
      variants={VARIANTS[variant]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
