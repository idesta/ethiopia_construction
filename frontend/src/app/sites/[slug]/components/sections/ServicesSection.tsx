"use client";

import { motion } from "framer-motion";
import { Service } from "../../types";
import { FadeSection } from "../../components/ui/FadeSection";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { staggerContainer, scaleIn } from "../ui/Motion";
import { BuildingIcon } from "../ui/Icons";
import { GeoRule } from "../ui/EthiopianGeometric";

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
                <motion.div className="service-card" key={s.id} variants={scaleIn}>
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
  );
}
