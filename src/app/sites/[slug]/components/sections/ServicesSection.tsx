"use client";

import { Service } from "../../types";
import { FadeSection } from "../ui/FadeSection";
import { SectionHeader } from "../ui/SectionHeader";

const DEFAULT_SERVICES: Service[] = [
  {
    id: "1",
    title: "Building Construction",
    icon: "🏗️",
    description:
      "Residential and commercial buildings built to the highest structural standards.",
  },
  {
    id: "2",
    title: "Road & Infrastructure",
    icon: "🛣️",
    description:
      "Highway, road, and civil infrastructure projects across Ethiopia.",
  },
  {
    id: "3",
    title: "Interior & Design",
    icon: "🏛️",
    description:
      "Architectural interior finishes combining function with elegance.",
  },
  {
    id: "4",
    title: "Project Management",
    icon: "📐",
    description:
      "End-to-end supervision, planning, and delivery of complex projects.",
  },
];

interface ServicesSectionProps {
  services: Service[];
  accent: string;
}

export function ServicesSection({ services, accent }: ServicesSectionProps) {
  const list = services.length ? services : DEFAULT_SERVICES;

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
            {list.map((service, i) => (
              <div className="service-card" key={service.id}>
                <span className="service-icon">{service.icon || "🏗️"}</span>
                <div className="service-title">{service.title}</div>
                <p className="service-desc">{service.description}</p>
                {/* Ghost number in background */}
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
