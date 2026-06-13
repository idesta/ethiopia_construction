"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { useActiveSection } from "../hooks/useActiveSection";
import { SunIcon, MoonIcon, CloseIcon, ArrowRightIcon } from "./ui/Icons";

const NAV_LINKS = ["services", "projects", "team", "contact"];

interface NavbarProps {
  companyName: string;
  logoUrl?: string;
  accent: string;
  onScrollTo: (id: string) => void;
}

export function Navbar({
  companyName,
  logoUrl,
  accent,
  onScrollTo,
}: NavbarProps) {
  const { theme, toggle } = useTheme();
  const activeSection = useActiveSection();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleNav = (id: string) => {
    onScrollTo(id);
    setMenuOpen(false);
  };
  const shortName = companyName.split(" ")[0];

  return (
    <>
      <motion.nav
        className={`nav${scrolled ? " scrolled" : ""}`}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <button type="button" className="nav-logo" onClick={() => handleNav("home")}>
          {logoUrl ? (
            <img
              className="nav-logo-image"
              src={logoUrl}
              alt={`${companyName} logo`}
            />
          ) : (
            <>
              {shortName}
              <span style={{ color: accent }}>.</span>
            </>
          )}
        </button>
        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <button
                type="button"
                className={`nav-link${activeSection === link ? " active" : ""}`}
                onClick={() => handleNav(link)}
                aria-current={activeSection === link ? "page" : undefined}
              >
                {link}
              </button>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            className="nav-cta"
            onClick={() => handleNav("contact")}
            style={{ background: accent }}
          >
            Get a Quote
          </button>
          <button
            type="button"
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-controls="site-mobile-menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="site-mobile-menu"
            className="mobile-menu open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              className="mobile-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
            <nav className="mobile-nav">
              {NAV_LINKS.map((link, i) => (
                <button
                  type="button"
                  key={link}
                  className="mobile-nav-link"
                  onClick={() => handleNav(link)}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="mobile-nav-num" style={{ color: accent }}>
                    0{i + 1}
                  </span>
                  {link.charAt(0).toUpperCase() + link.slice(1)}
                </button>
              ))}
            </nav>
            <button
              type="button"
              className="mobile-cta"
              onClick={() => handleNav("contact")}
              style={{ background: accent }}
            >
              Get a Quote <ArrowRightIcon />
            </button>
            <button
              type="button"
              className="mobile-theme-toggle"
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <span className="mobile-theme-icon" aria-hidden="true">
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </span>
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
