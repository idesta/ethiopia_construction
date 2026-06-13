"use client";

import { motion } from "framer-motion";
import { fadeUp } from "./Motion";

/**
 * Fusion scroll-reveal wrapper.
 * Replaces the old IntersectionObserver approach with
 * Framer Motion's `whileInView` for smooth, cascading entrances.
 * Automatically respects `prefers-reduced-motion`.
 */
export function FadeSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}