"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef } from "react";
import { revealDepth, revealTilt } from "./Motion";

const VARIANTS = { depth: revealDepth, tilt: revealTilt };

type FadeVariant = "depth" | "tilt" | "scrub" | "scrub-tilt";

/**
 * Fusion scroll-reveal wrapper.
 *
 * variant="depth" / "tilt" (default family) — the original one-shot
 * entrance: fires once via Framer's `whileInView` and stays visible,
 * even if you scroll back up past it. Cheap, and the right choice for
 * anything that shouldn't replay (see StatsSection, which still uses
 * this internally for its counters).
 *
 * variant="scrub" / "scrub-tilt" — continuously bound to scroll
 * position via `useScroll`/`useTransform` instead of a discrete
 * trigger, so the reveal runs backward if you scroll back up past the
 * section instead of staying revealed. "scrub-tilt" adds the same
 * restrained 3D rotation "tilt" uses, just scroll-driven instead of
 * one-shot.
 *
 * The scrub variants check `useReducedMotion` directly (rather than
 * relying on `MotionConfig`'s reduced-motion opt-out) because they
 * drive `style` from raw motion values, not a `transition` Framer can
 * intercept — so they render a plain, fully-visible div instead.
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
  variant?: FadeVariant;
}) {
  if (variant === "scrub" || variant === "scrub-tilt") {
    return (
      <ScrubSection className={className} tilt={variant === "scrub-tilt"}>
        {children}
      </ScrubSection>
    );
  }

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

function ScrubSection({
  children,
  className,
  tilt,
}: {
  children: React.ReactNode;
  className?: string;
  tilt: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();

  // The reveal completes well before the section is centered in the
  // viewport, so it reads as "arriving" rather than something you have
  // to keep scrolling to finish watching. Scrolling back up runs the
  // same map in reverse automatically — nothing extra to wire up.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "start 38%"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [34, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [tilt ? 14 : 0, 0]);

  if (shouldReduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ opacity, y, scale, rotateX, transformPerspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}
