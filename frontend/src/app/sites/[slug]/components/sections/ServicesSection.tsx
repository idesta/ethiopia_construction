"use client";

import { Service } from "../../types";
import { FadeSection } from "../../components/ui/FadeSection";
import { SectionHeader } from "../../components/ui/SectionHeader";

export function ServicesSection({
  services,
  accent,
}: {
  services: Service[];
  accent: string;
}) {
  return (
    <FadeSection>
      <section id="services" className="services-section">
        <div className="section-inner">
          <SectionHeader
            eyebrow="What We Do"
            title="Our"
            highlight="Services"
            accent={accent}
          />
          <div className="services-grid">
            {services.map((s, i) => (
              <div className="service-card" key={s.id}>
                <span className="service-icon">{s.icon || "🏗️"}</span>
                <div className="service-title">{s.title}</div>
                <p className="service-desc">{s.description}</p>
                <div className="service-number">
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeSection>
  );
}
