"use client";

import Image from "next/image";
import { Project } from "../../types";
import { FadeSection } from "../ui/FadeSection";
import { SectionHeader } from "../ui/SectionHeader";

interface ProjectsSectionProps {
  projects: Project[];
  accent: string;
}

function ProjectCard({
  project,
  accent,
}: {
  project: Project;
  accent: string;
}) {
  return (
    <div className="project-card">
      {project.cover_url ? (
        <Image
          src={project.cover_url}
          alt={project.title}
          className="project-img"
          width={400}
          height={250}
          sizes="(max-width: 768px) 100vw, 400px"
          priority={false}
        />
      ) : (
        <div className="project-img-placeholder">{project.title}</div>
      )}

      {project.status && (
        <div
          className="project-status"
          style={{ background: accent, color: "#000" }}
        >
          {project.status}
        </div>
      )}

      <div className="project-overlay">
        {project.category && (
          <div className="project-category" style={{ color: accent }}>
            {project.category}
          </div>
        )}
        <div className="project-title display">{project.title}</div>
        {project.location && (
          <div className="project-location">
            <span>📍</span> {project.location}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyProjects() {
  return (
    <div className="projects-empty">
      <span style={{ fontSize: "3rem" }}>🏛️</span>
      <p>
        Portfolio projects will appear here once added from the admin dashboard.
      </p>
    </div>
  );
}

export function ProjectsSection({ projects, accent }: ProjectsSectionProps) {
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
            <EmptyProjects />
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  accent={accent}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </FadeSection>
  );
}
