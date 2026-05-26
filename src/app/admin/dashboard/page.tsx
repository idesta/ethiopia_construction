"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "@/components/Sidebar";
import { Tenant } from "../types";

export default function DashboardPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      // Auth guard
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin");
        return;
      }
      setUserEmail(user.email || "");

      // Load all tenants
      const { data } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      setTenants(data || []);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return <LoadingScreen />;

  const active = tenants.filter((t) => t.is_active).length;
  const inactive = tenants.filter((t) => !t.is_active).length;

  return (
    <div className="admin-layout">
      <Sidebar userEmail={userEmail} />

      <div className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-right">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => router.push("/admin/companies/new")}
            >
              + Add Company
            </button>
          </div>
        </div>

        <div className="admin-content">
          {/* Stat cards */}
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-card-label">Total Companies</div>
              <div className="stat-card-value">{tenants.length}</div>
              <div className="stat-card-sub">on this platform</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Active Sites</div>
              <div className="stat-card-value" style={{ color: "#4ade80" }}>
                {active}
              </div>
              <div className="stat-card-sub">live right now</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Inactive</div>
              <div className="stat-card-value" style={{ color: "#888" }}>
                {inactive}
              </div>
              <div className="stat-card-sub">hidden from public</div>
            </div>
          </div>

          {/* Company grid */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">All Companies</div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => router.push("/admin/companies/new")}
              >
                + New Company
              </button>
            </div>

            {tenants.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏢</div>
                <div className="empty-state-text">No companies yet</div>
                <div className="empty-state-sub">
                  Add your first company to get started
                </div>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                  onClick={() => router.push("/admin/companies/new")}
                >
                  Add Company
                </button>
              </div>
            ) : (
              <div style={{ padding: "1rem" }}>
                <div className="company-grid">
                  {tenants.map((tenant) => (
                    <CompanyCard
                      key={tenant.id}
                      tenant={tenant}
                      onEdit={() =>
                        router.push(`/admin/companies/${tenant.id}`)
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Company card ──────────────────────────────────────────
function CompanyCard({
  tenant,
  onEdit,
}: {
  tenant: Tenant;
  onEdit: () => void;
}) {
  const router = useRouter();
  const accent = tenant.accent_color || "#f4a61d";

  return (
    <div className="company-card">
      <div className="company-card-top">
        <div className="company-logo-box" style={{ background: accent }}>
          {tenant.logo_url ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <Image
                src={tenant.logo_url}
                alt={tenant.name}
                fill
                style={{ objectFit: "cover" }}
                unoptimized
              />
            </div>
          ) : (
            tenant.name.charAt(0)
          )}
        </div>
        <div>
          <div className="company-card-name">{tenant.name}</div>
          <div className="company-card-slug">/{tenant.slug}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span
            className={`badge ${tenant.is_active ? "badge-green" : "badge-red"}`}
          >
            {tenant.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {tenant.tagline && (
        <p style={{ fontSize: "12px", color: "#666", lineHeight: 1.5 }}>
          {tenant.tagline}
        </p>
      )}

      <div className="company-card-meta">
        {tenant.founded_year && (
          <span className="badge">Est. {tenant.founded_year}</span>
        )}
      </div>

      <div className="company-card-actions">
        <button className="btn btn-primary btn-sm" onClick={onEdit}>
          Edit
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => router.push(`/admin/companies/${tenant.id}/projects`)}
        >
          Projects
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => router.push(`/admin/companies/${tenant.id}/team`)}
        >
          Team
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => window.open(`/sites/${tenant.slug}`, "_blank")}
          title="Preview site"
        >
          👁️
        </button>
      </div>
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "2px solid #1f1f1f",
          borderTopColor: "#f4a61d",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ color: "#555", fontSize: "13px" }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
