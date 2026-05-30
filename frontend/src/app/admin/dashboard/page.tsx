"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../../../components/Sidebar";
import { tenants as tenantsApi, auth, Tenant } from "../../../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const user = await auth.me();
        setUserEmail(user.email);
        const data = await tenantsApi.list();
        setTenants(data);
      } catch {
        router.push("/admin");
      } finally {
        setLoading(false);
      }
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
            <img
              src={tenant.logo_url}
              alt={tenant.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
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
        >
          👁️
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ color: "#555" }}>Loading...</p>
    </div>
  );
}
