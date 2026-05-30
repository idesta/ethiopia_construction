"use client";

import { Project } from "../../types";
import { FadeSection } from "../../components/ui/FadeSection";
import { SectionHeader } from "../../components/ui/SectionHeader";

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
          {projects.length === 0 ? (
            <div className="projects-empty">
              <span style={{ fontSize: "3rem" }}>🏛️</span>
              <p>
                Portfolio projects will appear here once added from the admin
                dashboard.
              </p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((p) => (
                <div className="project-card" key={p.id}>
                  {p.cover_url ? (
                    <img
                      src={p.cover_url}
                      alt={p.title}
                      className="project-img"
                    />
                  ) : (
                    <div className="project-placeholder">🏗️</div>
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
                        <span>📍</span> {p.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </FadeSection>
  );
}
