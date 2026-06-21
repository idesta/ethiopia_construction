/**
 * Modern-Heritage Fusion - Framer Motion animation presets.
 *
 * Every variant respects `reducedMotion` via the `whileInView` pattern.
 * Usage: <motion.div variants={fadeUp} initial="hidden" whileInView="visible" ...>
 */

import { type Variants } from "framer-motion";

/* ── Staggered container ───────────────────────────────── */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

/* ── Fade + slide up (section entrances) ──────────────── */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ── Fade + slide left ────────────────────────────────── */
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ── Fade + slide right ───────────────────────────────── */
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ── Scale-in (cards, avatars, icons) ─────────────────── */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ── Ethiopian geometric reveal (diamond clip-path) ───── */
export const geoReveal: Variants = {
  hidden: {
    clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
  },
  visible: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
  },
};

/* ── Hero child stagger ───────────────────────────────── */
export const heroStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.3 },
  },
};

export const heroChild: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ── Depth reveal (new default section entrance) ──────── */
/* Fade + rise + a restrained 3D tilt — enough to read as       */
/* "depth" without fighting legibility of stats/cards/text.     */
export const revealDepth: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.96,
    rotateX: 6,
    transformPerspective: 1000,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transformPerspective: 1000,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ── Tilt reveal (reserved for one or two standout moments) ── */
export const revealTilt: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.88,
    rotateX: 22,
    transformPerspective: 1000,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transformPerspective: 1000,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
};
