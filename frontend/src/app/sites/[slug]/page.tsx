"use client";

import { useEffect, useState } from "react";
import { Tenant } from "./types";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/sections/HeroSection";
import { StatsSection } from "./components/sections/StatsSection";
import { ServicesSection } from "./components/sections/ServicesSection";
import { ProjectsSection } from "./components/sections/ProjectsSection";
import { TeamSection } from "./components/sections/TeamSection";
import { ContactSection } from "./components/sections/ContactSection";

// Empty string = same host = nginx routes /api/* to backend
// This is correct — no change needed here
const API = "";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function validColor(value: string | undefined, fallback: string) {
  return value && HEX_COLOR.test(value) ? value : fallback;
}

function normalizeMediaUrl(value: string | undefined) {
  if (!value) return value;
  try {
    const url = new URL(
      value,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost",
    );
    return url.pathname + url.search + url.hash;
  } catch {
    return value;
  }
}

function normalizeTenantMediaUrls(tenant: Tenant) {
  return {
    ...tenant,
    logo_url: normalizeMediaUrl(tenant.logo_url) || "",
    projects: (tenant.projects || []).map((project) => ({
      ...project,
      cover_url: normalizeMediaUrl(project.cover_url) || "",
    })),
    team: (tenant.team || []).map((member) => ({
      ...member,
      photo_url: normalizeMediaUrl(member.photo_url) || "",
    })),
  } as Tenant;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function TenantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");

  useEffect(() => {
    Promise.resolve(params).then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/api/tenants/slug/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setTenant(normalizeTenantMediaUrls(data));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // ── Loading state ──────────────────────────────────────
  if (loading)
    return (
      <div className="site-state">
        <div className="loader" />
        <p className="site-state-kicker">Loading</p>
      </div>
    );

  // ── Not found state ────────────────────────────────────
  if (!tenant)
    return (
      <div className="site-state">
        <div className="site-state-panel">
          <p className="site-state-title">404</p>
          <p className="site-state-copy">Company not found</p>
        </div>
      </div>
    );

  // ── Derived values ─────────────────────────────────────
  const accent = validColor(tenant.accent_color, "#d4af37");
  const primary = validColor(tenant.primary_color, "#0d0e11");
  const contact = tenant.contacts?.[0];
  const services = tenant.services || [];
  const projects = tenant.projects || [];
  const team = tenant.team || [];

  return (
    <>
      {/*
        ── THE KEY FIX ──────────────────────────────────────
        This <style> tag injects the tenant's brand colors as
        CSS custom properties (variables) on the :root element.

        Every component uses var(--accent) and var(--primary)
        in the globals.css. Without this, they fall back to
        the hardcoded default #f4a61d for ALL companies.

        With this, each company gets its own colors dynamically
        loaded from the database at runtime.
        ────────────────────────────────────────────────────── */}
      <style>{`
        :root {
          --accent:  ${accent};
          --primary: ${primary};
        }
      `}</style>

      <Navbar
        companyName={tenant.name}
        logoUrl={tenant.logo_url}
        accent={accent}
        onScrollTo={scrollTo}
      />

      <main>
        <HeroSection tenant={tenant} accent={accent} onScrollTo={scrollTo} />
        <StatsSection tenant={tenant} accent={accent} />
        <ServicesSection
          services={services}
          accent={accent}
          onScrollTo={scrollTo}
        />
        <ProjectsSection projects={projects} accent={accent} />
        <TeamSection team={team} accent={accent} />
        <ContactSection
          contact={contact}
          services={services}
          accent={accent}
          slug={slug}
        />
      </main>

      <Footer companyName={tenant.name} accent={accent} onScrollTo={scrollTo} />
    </>
  );
}
