"use client";

interface SectionHeaderProps {
  eyebrow: string;
  title: string; // plain part of title
  highlight: string; // italic accent-colored word
  accent: string; // hex color
}

export function SectionHeader({
  eyebrow,
  title,
  highlight,
  accent,
}: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: "3rem" }}>
      <div className="section-eyebrow">{eyebrow}</div>
      <h2 className="section-title display">
        {title}{" "}
        <em style={{ fontStyle: "italic", color: accent }}>{highlight}</em>
      </h2>
    </div>
  );
}
