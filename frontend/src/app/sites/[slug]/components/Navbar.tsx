"use client";

import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { useActiveSection } from "../hooks/useActiveSection";

const NAV_LINKS = ["services", "projects", "team", "contact"];

interface NavbarProps {
  companyName: string;
  accent: string;
  onScrollTo: (id: string) => void;
}

export function Navbar({ companyName, accent, onScrollTo }: NavbarProps) {
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
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <button className="nav-logo" onClick={() => handleNav("home")}>
          {shortName}
          <span style={{ color: accent }}>.</span>
        </button>
        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <button
                className={`nav-link${activeSection === link ? " active" : ""}`}
                onClick={() => handleNav(link)}
              >
                {link}
              </button>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            className="nav-cta"
            onClick={() => handleNav("contact")}
            style={{ background: accent }}
          >
            Get a Quote
          </button>
          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <button className="mobile-close" onClick={() => setMenuOpen(false)}>
          ✕
        </button>
        <nav className="mobile-nav">
          {NAV_LINKS.map((link, i) => (
            <button
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
          className="mobile-cta"
          onClick={() => handleNav("contact")}
          style={{ background: accent }}
        >
          Get a Quote →
        </button>
        <button className="mobile-theme-toggle" onClick={toggle}>
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
    </>
  );
}
