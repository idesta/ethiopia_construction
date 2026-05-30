"use client";

import { TeamMember } from "../../types";
import { FadeSection } from "../../components/ui/FadeSection";
import { SectionHeader } from "../../components/ui/SectionHeader";

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
          <div className="team-grid">
            {team.map((m) => (
              <div className="team-card" key={m.id}>
                {m.photo_url ? (
                  <img src={m.photo_url} alt={m.name} className="team-photo" />
                ) : (
                  <div className="team-avatar" style={{ color: accent }}>
                    {m.name.charAt(0)}
                  </div>
                )}
                <div className="team-name display">{m.name}</div>
                <div className="team-role" style={{ color: accent }}>
                  {m.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeSection>
  );
}
