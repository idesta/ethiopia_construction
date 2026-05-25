"use client";

import Image from "next/image";
import { TeamMember } from "../../types";
import { FadeSection } from "../ui/FadeSection";
import { SectionHeader } from "../ui/SectionHeader";

interface TeamSectionProps {
  team: TeamMember[];
  accent: string;
}

function TeamCard({ member, accent }: { member: TeamMember; accent: string }) {
  const initial = member.name.charAt(0).toUpperCase();

  return (
    <div className="team-card">
      {member.photo_url ? (
        <Image
          src={member.photo_url}
          alt={member.name}
          className="team-photo"
          width={200}
          height={200}
          style={{ "--accent": accent } as React.CSSProperties}
        />
      ) : (
        <div className="team-avatar" style={{ color: accent }}>
          {initial}
        </div>
      )}
    </div>
  );
}
// ...rest of the file

export function TeamSection({ team, accent }: TeamSectionProps) {
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

          {team.length === 0 ? (
            <div className="team-empty">
              <p>No team members have been added yet.</p>
            </div>
          ) : (
            <div className="team-grid">
              {team.map((member) => (
                <TeamCard key={member.id} member={member} accent={accent} />
              ))}
            </div>
          )}
        </div>
      </section>
    </FadeSection>
  );
}
