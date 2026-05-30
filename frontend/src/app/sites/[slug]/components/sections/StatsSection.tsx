"use client";

import { useInView } from "../../hooks/useInView";
import { useCounter } from "../../hooks/useCounter";
import { Tenant } from "../../types";

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
    <div className="stat-item">
      <div className="stat-number">
        {count}
        <span className="stat-suffix">{suffix}</span>
      </div>
      <div className="stat-label">{label}</div>
    </div>
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
      <div className="stats-grid">
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
      </div>
    </div>
  );
}
