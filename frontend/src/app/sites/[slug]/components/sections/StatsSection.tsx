"use client";

import { motion } from "framer-motion";
import { useInView } from "../../hooks/useInView";
import { useCounter } from "../../hooks/useCounter";
import { Tenant } from "../../types";
import { staggerContainer, scaleIn } from "../ui/Motion";
import { DiamondIcon } from "../ui/EthiopianGeometric";

function StatItem({
  value,
  suffix,
  label,
  start,
  duration = 2000,
}: {
  value: number;
  suffix: string;
  label: string;
  start: boolean;
  duration?: number;
}) {
  const count = useCounter(value, duration, start);
  return (
    <motion.div className="stat-item" variants={scaleIn}>
      <DiamondIcon accent="#0d0e11" size={12} />
      <div className="stat-number">
        {count}
        <span className="stat-suffix">{suffix}</span>
      </div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}

export function StatsSection({
  tenant,
  accent,
}: {
  tenant: Tenant;
  accent: string;
}) {
  const { ref, inView } = useInView(0.2);
  const yearsExp = tenant.founded_year
    ? new Date().getFullYear() - tenant.founded_year
    : 14;

  return (
    <div ref={ref} className="stats-section" style={{ background: accent }}>
      <motion.div
        className="stats-grid"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <StatItem
          value={yearsExp}
          suffix="+"
          label="Years of Experience"
          start={inView}
          duration={2000}
        />
        <StatItem
          value={120}
          suffix="+"
          label="Projects Completed"
          start={inView}
          duration={2200}
        />
        <StatItem
          value={98}
          suffix="%"
          label="Client Satisfaction"
          start={inView}
          duration={1800}
        />
        <StatItem
          value={45}
          suffix="+"
          label="Expert Engineers"
          start={inView}
          duration={2400}
        />
      </motion.div>
    </div>
  );
}
