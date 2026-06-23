"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Service } from "../../types";
import { FadeSection } from "../../components/ui/FadeSection";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { staggerContainer, scaleIn } from "../ui/Motion";
import { BuildingIcon } from "../ui/Icons";
import { GeoRule } from "../ui/EthiopianGeometric";
import { ServiceDetail } from "./ServiceDetail";

export function ServicesSection({
  services,
  accent,
  onScrollTo,
}: {
  services: Service[];
  accent: string;
  /**
   * Optional on purpose — if a caller doesn't pass it, the detail
   * panel's "Request a Quote" button still closes the panel, it just
   * won't also jump to #contact. Only `page.tsx` needs updating to
   * wire this through; nothing breaks if it's temporarily omitted.
   */
  onScrollTo?: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = services.find((s) => s.id === selectedId) ?? null;

  return (
    <>
      <FadeSection variant="scrub">
        <section id="services" className="services-section">
          <div className="section-inner">
            <SectionHeader
              eyebrow="What We Do"
              title="Our"
              highlight="Services"
              accent={accent}
            />
            <GeoRule accent={accent} className="section-rule" />
            {services.length === 0 ? (
              <div className="projects-empty">
                <BuildingIcon size={48} />
                <p>
                  Services will appear here once added from the admin dashboard.
                </p>
              </div>
            ) : (
              <motion.div
                className="services-grid"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                {services.map((s, i) => (
                  <motion.div
                    className="service-card"
                    key={s.id}
                    variants={scaleIn}
                    layoutId={`service-${s.id}`}
                    onClick={() => setSelectedId(s.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(s.id);
                      }
                    }}
                    aria-label={`View details for ${s.title}`}
                  >
                    <span className="service-icon">
                      <BuildingIcon size={24} />
                    </span>
                    <div className="service-title">{s.title}</div>
                    <p className="service-desc">{s.description}</p>
                    <div className="service-number">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </FadeSection>

      {/* Sibling of FadeSection — see the comment in ProjectsSection
          for why this can't be nested inside the scroll-scrub wrapper. */}
      <AnimatePresence>
        {selected && (
          <ServiceDetail
            service={selected}
            accent={accent}
            onClose={() => setSelectedId(null)}
            onRequestQuote={() => onScrollTo?.("contact")}
          />
        )}
      </AnimatePresence>
    </>
  );
}
