"use client";

import { motion } from "framer-motion";
import { fadeUp } from "./ui/Motion";
import { GeoRule } from "./ui/EthiopianGeometric";
import { ArrowUpIcon } from "./ui/Icons";

const NAV_LINKS = ["services", "projects", "team", "contact"];

interface FooterProps {
  companyName: string;
  accent: string;
  onScrollTo: (id: string) => void;
}

export function Footer({ companyName, accent, onScrollTo }: FooterProps) {
  const shortName = companyName.split(" ")[0];

  return (
    <motion.footer
      className="footer"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <GeoRule accent={accent} />
      <div className="footer-inner" style={{ marginTop: "2rem" }}>
        <div>
          <div className="footer-logo">
            {shortName}
            <span style={{ color: accent }}>.</span>
          </div>
          <p className="footer-tagline">
            Building Ethiopia&apos;s future, one structure at a time.
          </p>
        </div>
        <div className="footer-links-col">
          <div className="footer-col-title">Navigation</div>
          {NAV_LINKS.map((link) => (
            <button
              type="button"
              key={link}
              className="footer-link"
              onClick={() => onScrollTo(link)}
            >
              {link.charAt(0).toUpperCase() + link.slice(1)}
            </button>
          ))}
        </div>
        <div className="footer-links-col">
          <div className="footer-col-title">Quick</div>
          <button
            type="button"
            className="footer-link footer-link-icon"
            onClick={() => onScrollTo("home")}
          >
            <ArrowUpIcon /> Back to top
          </button>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {companyName}. All rights reserved.
        </span>
        <span style={{ color: accent, fontSize: "0.75rem" }}>
          Addis Ababa, Ethiopia
        </span>
      </div>
    </motion.footer>
  );
}
