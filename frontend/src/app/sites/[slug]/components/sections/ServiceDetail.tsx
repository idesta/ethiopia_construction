"use client";

import { motion } from "framer-motion";
import { Service } from "../../types";
import { BuildingIcon, CloseIcon, ArrowRightIcon } from "../ui/Icons";

/**
 * Expanded detail view for a single service. Title/icon/description
 * are already all visible on the card itself, so the genuine
 * additive value here is the "Request a Quote" shortcut into the
 * contact section rather than new information — worth knowing if you
 * later want to skip this one and keep only the Projects version.
 */
export function ServiceDetail({
  service,
  accent,
  onClose,
  onRequestQuote,
}: {
  service: Service;
  accent: string;
  onClose: () => void;
  onRequestQuote: () => void;
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
        layoutId={`service-${service.id}`}
        className="detail-panel service-detail-panel"
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

        <span
          className="service-icon service-detail-icon"
          style={{ color: accent }}
        >
          <BuildingIcon size={28} />
        </span>

        <h3 className="service-detail-title display">{service.title}</h3>

        {service.description && (
          <p className="service-detail-desc">{service.description}</p>
        )}

        <button
          type="button"
          className="btn-primary service-detail-cta"
          style={{ background: accent }}
          onClick={() => {
            onClose();
            onRequestQuote();
          }}
        >
          Request a Quote <ArrowRightIcon />
        </button>
      </motion.div>
    </motion.div>
  );
}
