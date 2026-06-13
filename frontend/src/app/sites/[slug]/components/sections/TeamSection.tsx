"use client";

import { motion } from "framer-motion";
import { TeamMember } from "../../types";
import { FadeSection } from "../../components/ui/FadeSection";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { staggerContainer, scaleIn } from "../ui/Motion";
import { GeoRule } from "../ui/EthiopianGeometric";

export function TeamSection({
  team,
  accent,
}: {
  team: TeamMember[];
  accent: string;
}) {
  if (team.length === 0) return null;

  return (
    <FadeSection>
      <section id="team" className="team-section">
        <div className="section-inner">
          <SectionHeader
            eyebrow="The People"
            title="Our"
            highlight="Team"
            accent={accent}
          />
          <GeoRule accent={accent} className="section-rule" />
          <motion.div
            className="team-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {team.map((m) => (
              <motion.div className="team-card" key={m.id} variants={scaleIn}>
                <div className="team-photo-wrap">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.name} className="team-photo" />
                  ) : (
                    <div className="team-avatar" style={{ color: accent }}>
                      {m.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="team-name display">{m.name}</div>
                <div className="team-role" style={{ color: accent }}>
                  {m.role}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </FadeSection>
  );
}
