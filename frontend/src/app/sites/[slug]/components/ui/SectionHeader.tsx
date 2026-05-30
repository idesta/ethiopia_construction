"use client";

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
    <div style={{ marginBottom: "3rem" }}>
      <div className="section-eyebrow" style={{ color: accent }}>
        {eyebrow}
      </div>
      <h2 className="section-title display">
        {title}{" "}
        <em style={{ fontStyle: "italic", color: accent }}>{highlight}</em>
      </h2>
    </div>
  );
}
