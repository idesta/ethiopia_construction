"use client";

import { motion } from "framer-motion";
import { Project } from "../../types";
import { BuildingIcon, MapPinIcon, CloseIcon } from "../ui/Icons";

function formatCompletedDate(value: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Expanded detail view for a single project, shown via a shared
 * `layoutId` with its origin card in ProjectsSection — Framer Motion
 * interpolates the position/size between the two automatically, the
 * same technique behind the iOS App Store's card → detail transition.
 *
 * Surfaces `description` and `completed_at`, neither of which appears
 * on the card itself, so this earns its place as more than just "the
 * same info, bigger."
 */
export function ProjectDetail({
  project,
  accent,
  onClose,
}: {
  project: Project;
  accent: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        layoutId={`project-${project.id}`}
        className="detail-panel project-detail-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="detail-close"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        <div className="project-detail-media">
          {project.cover_url ? (
            <img src={project.cover_url} alt={project.title} />
          ) : (
            <div className="project-detail-media-placeholder">
              <BuildingIcon size={56} />
            </div>
          )}
          {project.status && (
            <div
              className="project-status project-detail-status"
              style={{ background: accent, color: "#000" }}
            >
              {project.status}
            </div>
          )}
        </div>

        <div className="project-detail-body">
          {project.category && (
            <div className="project-category" style={{ color: accent }}>
              {project.category}
            </div>
          )}
          <h3 className="project-detail-title display">{project.title}</h3>

          {(project.location || project.completed_at) && (
            <div className="project-detail-meta">
              {project.location && (
                <span className="project-detail-meta-item">
                  <MapPinIcon size={14} /> {project.location}
                </span>
              )}
              {project.completed_at && (
                <span className="project-detail-meta-item">
                  Completed {formatCompletedDate(project.completed_at)}
                </span>
              )}
            </div>
          )}

          {project.description && (
            <p className="project-detail-desc">{project.description}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
