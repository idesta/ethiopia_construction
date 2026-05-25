"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tenant } from "./types";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/sections/HeroSection";
import { StatsSection } from "./components/sections/StatsSection";
import { ServicesSection } from "./components/sections/ServicesSection";
import { ProjectsSection } from "./components/sections/ProjectsSection";
import { TeamSection } from "./components/sections/TeamSection";
import { ContactSection } from "./components/sections/ContactSection";

// ─── Default services when DB has none ──────────────────
const DEFAULT_SERVICES = [
  {
    id: "1",
    title: "Building Construction",
    icon: "🏗️",
    description:
      "Residential and commercial buildings built to the highest structural standards.",
  },
  {
    id: "2",
    title: "Road & Infrastructure",
    icon: "🛣️",
    description:
      "Highway, road, and civil infrastructure projects across Ethiopia.",
  },
  {
    id: "3",
    title: "Interior & Design",
    icon: "🏛️",
    description:
      "Architectural interior finishes combining function with elegance.",
  },
  {
    id: "4",
    title: "Project Management",
    icon: "📐",
    description:
      "End-to-end supervision, planning, and delivery of complex projects.",
  },
];

// ─── Scroll helper ───────────────────────────────────────
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════
export default function TenantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");

  // Resolve params (Next.js 15+ async params)
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Fetch all tenant data in one query
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

  // ── Loading state ──
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div className="loader" />
        <p
          style={{
            color: "#555",
            fontFamily: "Barlow Condensed, sans-serif",
            letterSpacing: "0.3em",
            fontSize: "11px",
            textTransform: "uppercase",
          }}
        >
          Loading
        </p>
      </div>
    );
  }

  // ── Not found state ──
  if (!tenant) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "5rem",
              fontWeight: 300,
            }}
          >
            404
          </p>
          <p
            style={{
              color: "#555",
              fontSize: "0.9rem",
              marginTop: "1rem",
              letterSpacing: "0.1em",
            }}
          >
            Company not found
          </p>
        </div>
      </div>
    );
  }

  // ── Derived values ──
  const accent = tenant.accent_color || "#f4a61d";
  const contact = tenant.contacts?.[0];
  const services = tenant.services?.length ? tenant.services : DEFAULT_SERVICES;
  const projects = tenant.projects || [];
  const team = tenant.team || [];

  return (
    <>
      {/* Navigation */}
      <Navbar companyName={tenant.name} accent={accent} onScrollTo={scrollTo} />

      {/* Page sections */}
      <main>
        <HeroSection tenant={tenant} accent={accent} onScrollTo={scrollTo} />
        <StatsSection tenant={tenant} accent={accent} />
        <ServicesSection services={services} accent={accent} />
        <ProjectsSection projects={projects} accent={accent} />
        <TeamSection team={team} accent={accent} />
        <ContactSection contact={contact} services={services} accent={accent} />
      </main>

      {/* Footer */}
      <Footer companyName={tenant.name} accent={accent} onScrollTo={scrollTo} />
    </>
  );
}
