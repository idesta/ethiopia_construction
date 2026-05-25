"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────
interface Contact {
  email: string;
  phone: string;
  address: string;
  city: string;
  maps_url: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  status: string;
  completed_at: string;
  cover_url: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo_url: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface Tenant {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logo_url: string;
  primary_color: string;
  accent_color: string;
  founded_year: number;
  contacts: Contact[];
  projects: Project[];
  team: TeamMember[];
  services: Service[];
}

// ─── Counter animation hook ───────────────────────────────
function useCounter(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// ─── Intersection observer hook ──────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Default services if none in DB ─────────────────────
const DEFAULT_SERVICES = [
  {
    id: "1",
    title: "Building Construction",
    description:
      "Residential and commercial building projects built to the highest structural standards.",
    icon: "🏗️",
  },
  {
    id: "2",
    title: "Road & Infrastructure",
    description:
      "Highway, road, and civil infrastructure projects across Ethiopia.",
    icon: "🛣️",
  },
  {
    id: "3",
    title: "Interior & Design",
    description:
      "Architectural interior finishes that combine function with elegance.",
    icon: "🏛️",
  },
  {
    id: "4",
    title: "Project Management",
    description:
      "End-to-end supervision, planning, and delivery of complex projects.",
    icon: "📐",
  },
];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function TenantSite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Resolve params
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Fetch tenant data
  useEffect(() => {
    if (!slug) return;
    const supabase = createClient();
    async function load() {
      const { data } = await supabase
        .from("tenants")
        .select("*, contacts(*), projects(*), team(*), services(*)")
        .eq("slug", slug)
        .single();
      setTenant(data);
      setLoading(false);
    }
    load();
  }, [slug]);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const sections = ["home", "services", "projects", "team", "contact"];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  // Stats section
  const statsRef = useInView();
  const y1 = useCounter(
    tenant?.founded_year ? new Date().getFullYear() - tenant.founded_year : 14,
    2000,
    statsRef.inView,
  );
  const y2 = useCounter(120, 2200, statsRef.inView);
  const y3 = useCounter(98, 1800, statsRef.inView);
  const y4 = useCounter(45, 2400, statsRef.inView);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="loader" />
          <p
            style={{
              color: "#666",
              fontFamily: "serif",
              marginTop: "1rem",
              letterSpacing: "0.2em",
              fontSize: "12px",
              textTransform: "uppercase",
            }}
          >
            Loading
          </p>
        </div>
      </div>
    );

  if (!tenant)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "4rem", marginBottom: "1rem" }}>404</p>
          <p style={{ color: "#888" }}>Company not found</p>
        </div>
      </div>
    );

  const accent = tenant.accent_color || "#f4a61d";
  const primary = tenant.primary_color || "#0a0a0a";
  const contact = tenant.contacts?.[0];
  const services = tenant.services?.length ? tenant.services : DEFAULT_SERVICES;
  const projects = tenant.projects || [];
  const team = tenant.team || [];
  const navLinks = ["services", "projects", "team", "contact"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        body {
          background: #0c0c0c;
          color: #e8e4dc;
          font-family: 'Barlow', sans-serif;
          font-weight: 300;
          overflow-x: hidden;
        }

        .display { font-family: 'Cormorant Garamond', serif; }
        .condensed { font-family: 'Barlow Condensed', sans-serif; }

        /* Loader */
        .loader {
          width: 40px; height: 40px;
          border: 2px solid #222;
          border-top-color: ${accent};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Nav */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 1.5rem 2.5rem;
          display: flex; align-items: center; justify-content: space-between;
          transition: all 0.4s ease;
        }
        .nav.scrolled {
          background: rgba(10,10,10,0.95);
          backdrop-filter: blur(12px);
          padding: 1rem 2.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-logo {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #fff;
          text-decoration: none;
        }
        .nav-logo span { color: ${accent}; }
        .nav-links { display: flex; gap: 2.5rem; list-style: none; }
        .nav-links a {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #aaa;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s;
          position: relative;
        }
        .nav-links a::after {
          content: '';
          position: absolute; bottom: -4px; left: 0; right: 0;
          height: 1px; background: ${accent};
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .nav-links a:hover, .nav-links a.active { color: #fff; }
        .nav-links a:hover::after, .nav-links a.active::after { transform: scaleX(1); }

        .nav-cta {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: ${accent};
          color: #000;
          border: none;
          padding: 0.6rem 1.4rem;
          cursor: pointer;
          font-weight: 600;
          transition: opacity 0.2s;
        }
        .nav-cta:hover { opacity: 0.85; }

        .hamburger {
          display: none;
          flex-direction: column; gap: 5px;
          cursor: pointer; background: none; border: none; padding: 4px;
        }
        .hamburger span {
          display: block; width: 24px; height: 1.5px;
          background: #fff; transition: all 0.3s ease;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        .mobile-menu {
          display: none;
          position: fixed; inset: 0; z-index: 99;
          background: rgba(10,10,10,0.98);
          flex-direction: column; align-items: center; justify-content: center;
          gap: 2.5rem;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 300;
          color: #fff;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .mobile-menu a:hover { color: ${accent}; }

        /* Hero */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 0 2.5rem 5rem;
          position: relative;
          overflow: hidden;
          background: ${primary};
        }
        .hero-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, ${primary} 0%, #1a1a1a 50%, #0a0a0a 100%);
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .hero-accent-line {
          position: absolute; top: 0; right: 15%;
          width: 1px; height: 100%;
          background: linear-gradient(to bottom, transparent, ${accent}44, transparent);
        }
        .hero-number {
          position: absolute; right: 2.5rem; top: 50%;
          transform: translateY(-50%);
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18vw;
          font-weight: 700;
          color: rgba(255,255,255,0.025);
          line-height: 1;
          letter-spacing: -0.05em;
          user-select: none;
          pointer-events: none;
        }
        .hero-content { position: relative; z-index: 1; max-width: 860px; }
        .hero-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: ${accent};
          margin-bottom: 1.5rem;
          display: flex; align-items: center; gap: 1rem;
        }
        .hero-eyebrow::before {
          content: '';
          display: block; width: 40px; height: 1px;
          background: ${accent};
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.5rem, 8vw, 7rem);
          font-weight: 300;
          line-height: 1.0;
          color: #fff;
          margin-bottom: 1.5rem;
        }
        .hero-title em { font-style: italic; color: ${accent}; }
        .hero-tagline {
          font-size: 1rem;
          font-weight: 300;
          color: #888;
          max-width: 480px;
          line-height: 1.7;
          margin-bottom: 3rem;
        }
        .hero-actions { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
        .btn-primary {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 600;
          background: ${accent};
          color: #000;
          border: none;
          padding: 1rem 2.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }
        .btn-primary:hover { background: #fff; }
        .btn-outline {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 500;
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 1rem 2.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }
        .btn-outline:hover { border-color: ${accent}; color: ${accent}; }

        .hero-scroll {
          position: absolute; bottom: 2rem; left: 50%;
          transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          z-index: 1;
        }
        .hero-scroll span {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #555;
        }
        .scroll-line {
          width: 1px; height: 50px;
          background: linear-gradient(to bottom, #555, transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.2); }
        }

        /* Section base */
        section { padding: 8rem 2.5rem; }
        .section-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: ${accent};
          margin-bottom: 1rem;
          display: flex; align-items: center; gap: 1rem;
        }
        .section-eyebrow::before {
          content: '';
          display: block; width: 30px; height: 1px; background: ${accent};
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 300;
          line-height: 1.1;
          color: #fff;
          margin-bottom: 1.5rem;
        }

        /* Fade-in animation */
        .fade-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Stats */
        .stats-section {
          background: ${accent};
          padding: 5rem 2.5rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          max-width: 1100px; margin: 0 auto;
        }
        .stat-item {
          background: rgba(0,0,0,0.08);
          padding: 3rem 2rem;
          text-align: center;
          transition: background 0.3s;
        }
        .stat-item:hover { background: rgba(0,0,0,0.15); }
        .stat-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: 4.5rem;
          font-weight: 600;
          line-height: 1;
          color: #000;
        }
        .stat-suffix {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2rem;
          font-weight: 400;
          color: #000;
        }
        .stat-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.6);
          margin-top: 0.5rem;
        }

        /* Services */
        .services-section { background: #0c0c0c; }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1px;
          margin-top: 4rem;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .service-card {
          background: #111;
          padding: 3rem 2.5rem;
          position: relative;
          overflow: hidden;
          cursor: default;
          transition: background 0.4s ease;
        }
        .service-card::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 3px; height: 0;
          background: ${accent};
          transition: height 0.4s ease;
        }
        .service-card:hover { background: #161616; }
        .service-card:hover::before { height: 100%; }
        .service-icon {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          display: block;
        }
        .service-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.3rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 1rem;
        }
        .service-desc {
          font-size: 0.9rem;
          color: #666;
          line-height: 1.7;
        }
        .service-number {
          position: absolute; bottom: 1.5rem; right: 2rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 5rem;
          font-weight: 700;
          color: rgba(255,255,255,0.04);
          line-height: 1;
        }

        /* Projects */
        .projects-section { background: #0a0a0a; }
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-top: 4rem;
        }
        .project-card {
          position: relative;
          overflow: hidden;
          aspect-ratio: 4/3;
          cursor: pointer;
          background: #161616;
        }
        .project-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
          filter: brightness(0.7);
        }
        .project-card:hover .project-img { transform: scale(1.06); filter: brightness(0.5); }
        .project-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #161616, #222);
          font-size: 4rem;
          transition: transform 0.6s ease;
        }
        .project-card:hover .project-placeholder { transform: scale(1.06); }
        .project-overlay {
          position: absolute; inset: 0;
          padding: 2rem;
          display: flex; flex-direction: column; justify-content: flex-end;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%);
          transform: translateY(0);
        }
        .project-category {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: ${accent};
          margin-bottom: 0.5rem;
        }
        .project-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 400;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 0.5rem;
        }
        .project-location {
          font-size: 0.8rem;
          color: #aaa;
          display: flex; align-items: center; gap: 0.4rem;
        }
        .project-status {
          position: absolute; top: 1.5rem; right: 1.5rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 0.3rem 0.8rem;
          background: ${accent};
          color: #000;
          font-weight: 600;
        }

        /* Empty projects state */
        .projects-empty {
          margin-top: 4rem;
          border: 1px dashed rgba(255,255,255,0.1);
          padding: 5rem 2rem;
          text-align: center;
          color: #444;
        }
        .projects-empty p { font-size: 0.9rem; margin-top: 1rem; }

        /* Team */
        .team-section { background: #0e0e0e; }
        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem;
          margin-top: 4rem;
        }
        .team-card {
          text-align: center;
          cursor: default;
        }
        .team-photo {
          width: 140px; height: 140px;
          border-radius: 50%;
          object-fit: cover;
          margin: 0 auto 1.5rem;
          border: 2px solid rgba(255,255,255,0.08);
          transition: border-color 0.3s;
          display: block;
        }
        .team-card:hover .team-photo { border-color: ${accent}; }
        .team-avatar {
          width: 140px; height: 140px;
          border-radius: 50%;
          background: #1a1a1a;
          border: 2px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.5rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          color: ${accent};
          transition: border-color 0.3s;
        }
        .team-card:hover .team-avatar { border-color: ${accent}; }
        .team-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-weight: 400;
          color: #fff;
          margin-bottom: 0.4rem;
        }
        .team-role {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${accent};
        }

        /* Contact */
        .contact-section { background: #080808; }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          margin-top: 4rem;
          align-items: start;
        }
        .contact-info-item {
          display: flex; align-items: flex-start; gap: 1.5rem;
          margin-bottom: 2.5rem;
          padding-bottom: 2.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .contact-info-item:last-child { border-bottom: none; }
        .contact-icon {
          width: 48px; height: 48px;
          background: #111;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
          transition: border-color 0.3s, background 0.3s;
        }
        .contact-info-item:hover .contact-icon {
          border-color: ${accent};
          background: ${accent}22;
        }
        .contact-info-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 0.4rem;
        }
        .contact-info-value {
          font-size: 0.95rem;
          color: #ccc;
          line-height: 1.6;
        }
        .contact-info-value a { color: ${accent}; text-decoration: none; }
        .contact-info-value a:hover { text-decoration: underline; }

        .contact-form { display: flex; flex-direction: column; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #555;
        }
        .form-input {
          background: #111;
          border: 1px solid rgba(255,255,255,0.08);
          color: #e8e4dc;
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          padding: 0.9rem 1.2rem;
          outline: none;
          transition: border-color 0.3s;
          width: 100%;
          border-radius: 0;
        }
        .form-input:focus { border-color: ${accent}; }
        .form-input::placeholder { color: #444; }
        textarea.form-input { resize: vertical; min-height: 120px; }

        .form-submit {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 600;
          background: ${accent};
          color: #000;
          border: none;
          padding: 1rem 2.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
          align-self: flex-start;
        }
        .form-submit:hover { background: #fff; }

        /* Footer */
        .footer {
          background: #050505;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 3rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .footer-logo {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #fff;
        }
        .footer-logo span { color: ${accent}; }
        .footer-copy {
          font-size: 0.8rem;
          color: #444;
        }
        .footer-links { display: flex; gap: 1.5rem; }
        .footer-links a {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #555;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: ${accent}; }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-links, .nav-cta { display: none; }
          .hamburger { display: flex; }
          section { padding: 5rem 1.5rem; }
          .hero { padding: 0 1.5rem 4rem; }
          .hero-title { font-size: clamp(2.5rem, 10vw, 4rem); }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .contact-grid { grid-template-columns: 1fr; gap: 3rem; }
          .footer { flex-direction: column; text-align: center; }
          .hero-number { display: none; }
          .nav { padding: 1.2rem 1.5rem; }
          .nav.scrolled { padding: 0.8rem 1.5rem; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .stat-number { font-size: 3rem; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <a className="nav-logo">
          {tenant.name.split(" ")[0]}
          <span>.</span>
        </a>
        <ul className="nav-links">
          {navLinks.map((l) => (
            <li key={l}>
              <a
                className={activeSection === l ? "active" : ""}
                onClick={() => scrollTo(l)}
              >
                {l}
              </a>
            </li>
          ))}
        </ul>
        <button className="nav-cta" onClick={() => scrollTo("contact")}>
          Get a Quote
        </button>
        <button
          className={`hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* ── MOBILE MENU ── */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {navLinks.map((l) => (
          <a key={l} onClick={() => scrollTo(l)}>
            {l.charAt(0).toUpperCase() + l.slice(1)}
          </a>
        ))}
        <button className="btn-primary" onClick={() => scrollTo("contact")}>
          Get a Quote
        </button>
      </div>

      {/* ── HERO ── */}
      <section id="home" className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-accent-line" />
        <div className="hero-number">
          {tenant.founded_year
            ? new Date().getFullYear() - tenant.founded_year
            : ""}
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">
            {contact?.city || "Addis Ababa"}, Ethiopia
            {tenant.founded_year && ` · Est. ${tenant.founded_year}`}
          </div>
          <h1 className="hero-title display">
            {tenant.name.split(" ").slice(0, -1).join(" ")}&nbsp;
            <em>{tenant.name.split(" ").slice(-1)}</em>
          </h1>
          <p className="hero-tagline">
            {tenant.tagline ||
              "Building the future of Ethiopia, one structure at a time."}
          </p>
          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => scrollTo("projects")}
            >
              View Our Work
            </button>
            <button className="btn-outline" onClick={() => scrollTo("contact")}>
              Contact Us
            </button>
          </div>
        </div>
        <div className="hero-scroll">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ── STATS ── */}
      <div ref={statsRef.ref} className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">
              {y1}
              <span className="stat-suffix">+</span>
            </div>
            <div className="stat-label">Years of Experience</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {y2}
              <span className="stat-suffix">+</span>
            </div>
            <div className="stat-label">Projects Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {y3}
              <span className="stat-suffix">%</span>
            </div>
            <div className="stat-label">Client Satisfaction</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {y4}
              <span className="stat-suffix">+</span>
            </div>
            <div className="stat-label">Expert Engineers</div>
          </div>
        </div>
      </div>

      {/* ── SERVICES ── */}
      <FadeSection>
        <section id="services" className="services-section">
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div className="section-eyebrow">What We Do</div>
            <h2 className="section-title display">
              Our{" "}
              <em style={{ fontStyle: "italic", color: accent }}>Services</em>
            </h2>
            <div className="services-grid">
              {services.map((s, i) => (
                <div className="service-card" key={s.id}>
                  <span className="service-icon">{s.icon || "🏗️"}</span>
                  <div className="service-title">{s.title}</div>
                  <p className="service-desc">{s.description}</p>
                  <div className="service-number">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* ── PROJECTS ── */}
      <FadeSection>
        <section id="projects" className="projects-section">
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div className="section-eyebrow">Portfolio</div>
            <h2 className="section-title display">
              Featured{" "}
              <em style={{ fontStyle: "italic", color: accent }}>Projects</em>
            </h2>

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
                      <div className="project-status">{p.status}</div>
                    )}
                    <div className="project-overlay">
                      {p.category && (
                        <div className="project-category">{p.category}</div>
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

      {/* ── TEAM ── */}
      {team.length > 0 && (
        <FadeSection>
          <section id="team" className="team-section">
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
              <div className="section-eyebrow">The People</div>
              <h2 className="section-title display">
                Our <em style={{ fontStyle: "italic", color: accent }}>Team</em>
              </h2>
              <div className="team-grid">
                {team.map((m) => (
                  <div className="team-card" key={m.id}>
                    {m.photo_url ? (
                      <img
                        src={m.photo_url}
                        alt={m.name}
                        className="team-photo"
                      />
                    ) : (
                      <div className="team-avatar">{m.name.charAt(0)}</div>
                    )}
                    <div className="team-name display">{m.name}</div>
                    <div className="team-role">{m.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeSection>
      )}

      {/* ── CONTACT ── */}
      <FadeSection>
        <section id="contact" className="contact-section">
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div className="section-eyebrow">Get In Touch</div>
            <h2 className="section-title display">
              Start Your{" "}
              <em style={{ fontStyle: "italic", color: accent }}>Project</em>
            </h2>
            <div className="contact-grid">
              <div>
                {contact?.phone && (
                  <div className="contact-info-item">
                    <div className="contact-icon">📞</div>
                    <div>
                      <div className="contact-info-label">Phone</div>
                      <div className="contact-info-value">
                        <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                      </div>
                    </div>
                  </div>
                )}
                {contact?.email && (
                  <div className="contact-info-item">
                    <div className="contact-icon">✉️</div>
                    <div>
                      <div className="contact-info-label">Email</div>
                      <div className="contact-info-value">
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      </div>
                    </div>
                  </div>
                )}
                {(contact?.address || contact?.city) && (
                  <div className="contact-info-item">
                    <div className="contact-icon">📍</div>
                    <div>
                      <div className="contact-info-label">Address</div>
                      <div className="contact-info-value">
                        {contact.address && <div>{contact.address}</div>}
                        {contact.city && <div>{contact.city}, Ethiopia</div>}
                        {contact.maps_url && (
                          <a
                            href={contact.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "0.8rem",
                              marginTop: "0.3rem",
                              display: "inline-block",
                            }}
                          >
                            View on Map →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form
                className="contact-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(
                    "Message sent! (Connect a backend to handle submissions)",
                  );
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-input"
                      placeholder="Abebe Girma"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-input"
                      placeholder="+251 91..."
                      type="tel"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    placeholder="you@example.com"
                    type="email"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Type</label>
                  <select className="form-input">
                    <option value="">Select a service...</option>
                    {services.map((s) => (
                      <option key={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-input"
                    placeholder="Describe your project..."
                  />
                </div>
                <button type="submit" className="form-submit">
                  Send Message →
                </button>
              </form>
            </div>
          </div>
        </section>
      </FadeSection>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-logo">
          {tenant.name.split(" ")[0]}
          <span>.</span>
        </div>
        <div className="footer-copy">
          © {new Date().getFullYear()} {tenant.name}. All rights reserved.
        </div>
        <div className="footer-links">
          {navLinks.map((l) => (
            <a key={l} onClick={() => scrollTo(l)}>
              {l}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}

// ─── Fade-in wrapper component ────────────────────────────
function FadeSection({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className={`fade-up${inView ? " visible" : ""}`}>
      {children}
    </div>
  );
}
