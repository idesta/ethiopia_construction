"use client";

import { motion } from "framer-motion";
import { Project } from "../../types";
import { FadeSection } from "../../components/ui/FadeSection";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { staggerContainer, scaleIn } from "../ui/Motion";
import { BuildingIcon, MapPinIcon } from "../ui/Icons";
import { GeoRule } from "../ui/EthiopianGeometric";

export function ProjectsSection({
  projects,
  accent,
}: {
  projects: Project[];
  accent: string;
}) {
  return (
    <FadeSection>
      <section id="projects" className="projects-section">
        <div className="section-inner">
          <SectionHeader
            eyebrow="Portfolio"
            title="Featured"
            highlight="Projects"
            accent={accent}
          />
          <GeoRule accent={accent} className="section-rule" />
          {projects.length === 0 ? (
            <div className="projects-empty">
              <BuildingIcon size={48} />
              <p>
                Portfolio projects will appear here once added from the admin
                dashboard.
              </p>
            </div>
          ) : (
            <motion.div
              className="projects-grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {projects.map((p) => (
                <motion.div className="project-card" key={p.id} variants={scaleIn}>
                  {p.cover_url ? (
                    <img
                      src={p.cover_url}
                      alt={p.title}
                      className="project-img"
                    />
                  ) : (
                    <div className="project-placeholder">
                      <BuildingIcon size={48} />
                    </div>
                  )}
                  {p.status && (
                    <div
                      className="project-status"
                      style={{ background: accent, color: "#000" }}
                    >
                      {p.status}
                    </div>
                  )}
                  <div className="project-overlay">
                    {p.category && (
                      <div
                        className="project-category"
                        style={{ color: accent }}
                      >
                        {p.category}
                      </div>
                    )}
                    <div className="project-title display">{p.title}</div>
                    {p.location && (
                      <div className="project-location">
                        <MapPinIcon size={14} />
                        {p.location}
                      </div>
                    )}
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
