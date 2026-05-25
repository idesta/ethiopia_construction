"use client";

interface FooterProps {
  companyName: string;
  accent: string;
  onScrollTo: (id: string) => void;
}

const NAV_LINKS = ["services", "projects", "team", "contact"];

export function Footer({ companyName, accent, onScrollTo }: FooterProps) {
  const shortName = companyName.split(" ")[0];
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            {shortName}
            <span style={{ color: accent }}>.</span>
          </div>
          <p className="footer-tagline">
            Building Ethiopia&apos;s future, one structure at a time.
          </p>
        </div>

        {/* Quick links */}
        <div className="footer-links-col">
          <div className="footer-col-title">Navigation</div>
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              className="footer-link"
              onClick={() => onScrollTo(link)}
            >
              {link.charAt(0).toUpperCase() + link.slice(1)}
            </button>
          ))}
        </div>

        {/* Back to top */}
        <div className="footer-links-col">
          <div className="footer-col-title">Quick</div>
          <button className="footer-link" onClick={() => onScrollTo("home")}>
            ↑ Back to top
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {year} {companyName}. All rights reserved.
        </span>
        <span style={{ color: accent, fontSize: "0.75rem" }}>
          Addis Ababa, Ethiopia
        </span>
      </div>
    </footer>
  );
}
