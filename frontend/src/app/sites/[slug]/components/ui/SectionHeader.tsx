"use client";

import { motion } from "framer-motion";
import { DiamondIcon } from "./EthiopianGeometric";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  highlight: string;
  accent: string;
}

export function SectionHeader({
  eyebrow,
  title,
  highlight,
  accent,
}: SectionHeaderProps) {
  return (
    <motion.div
      style={{ marginBottom: "3rem" }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="section-eyebrow" style={{ color: accent }}>
        <DiamondIcon accent={accent} />
        {eyebrow}
      </div>
      <h2 className="section-title display">
        {title}{" "}
        <em style={{ fontStyle: "italic", color: accent }}>{highlight}</em>
      </h2>
    </motion.div>
  );
}