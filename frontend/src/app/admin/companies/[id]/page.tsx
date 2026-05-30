"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "../../../../components/Sidebar";
import { ImageUploader } from "../../../../components/ui/ImageUploader";
import { useToast } from "../../../../components/ui/ToastProvider";
import {
  auth,
  tenants as tenantsApi,
  contacts as contactsApi,
  Tenant,
  Contact,
} from "../../../../lib/api";

const EMPTY_CONTACT = {
  email: "",
  phone: "",
  address: "",
  city: "",
  maps_url: "",
};

export default function CompanyEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const isNew = params.id === "new";

  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState<Partial<Tenant>>({
    name: "",
    slug: "",
    tagline: "",
    logo_url: "",
    primary_color: "#1a1a2e",
    accent_color: "#f4a61d",
    founded_year: new Date().getFullYear(),
    is_active: true,
  });
  const [contact, setContact] = useState(EMPTY_CONTACT);

  useEffect(() => {
    async function load() {
      try {
        const user = await auth.me();
        setUserEmail(user.email);

        if (!isNew) {
          const t = await tenantsApi.get(params.id as string);
          setTenant(t);
          if (t.contacts?.[0]) {
            const c = t.contacts[0];
            setContact({
              email: c.email || "",
              phone: c.phone || "",
              address: c.address || "",
              city: c.city || "",
              maps_url: c.maps_url || "",
            });
          }
        }
      } catch {
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isNew, params.id, router]);

  function handleNameChange(name: string) {
    setTenant((prev) => ({
      ...prev,
      name,
      ...(isNew && {
        slug: name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim(),
      }),
    }));
  }

  async function handleSave() {
    if (!tenant.name || !tenant.slug) {
      showToast("Name and slug are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const created = await tenantsApi.create(tenant);
        await contactsApi.upsert(created.id, contact);
        showToast("Company created!", "success");
        router.push(`/admin/companies/${created.id}`);
      } else {
        await tenantsApi.update(params.id as string, tenant);
        await contactsApi.upsert(params.id as string, contact);
        showToast("Changes saved!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen />;

  const accent = tenant.accent_color || "#f4a61d";

  return (
    <div className="admin-layout">
      <Sidebar userEmail={userEmail} />
      <div className="admin-main">
        <div className="admin-topbar">
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push("/admin/dashboard")}
            >
              ← Back
            </button>
            <div className="topbar-title">
              {isNew ? "New Company" : `Edit — ${tenant.name}`}
            </div>
          </div>
          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
          >
            {!isNew && (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    router.push(`/admin/companies/${params.id}/projects`)
                  }
                >
                  Projects
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    router.push(`/admin/companies/${params.id}/team`)
                  }
                >
                  Team
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    router.push(`/admin/companies/${params.id}/services`)
                  }
                >
                  Services
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => window.open(`/sites/${tenant.slug}`, "_blank")}
                >
                  👁️ Preview
                </button>
              </>
            )}
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : isNew ? "Create Company" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="admin-content">
          {/* Basic Info */}
          <div className="card mb-6">
            <div className="card-header">
              <div className="card-title">🏢 Basic Information</div>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Company Name <span>*</span>
                  </label>
                  <input
                    className="form-input"
                    placeholder="Abu Builders PLC"
                    value={tenant.name || ""}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Slug (subdomain) <span>*</span>
                    <span
                      style={{
                        color: "#555",
                        fontWeight: 400,
                        marginLeft: "6px",
                      }}
                    >
                      → {tenant.slug}.yourdomain.com
                    </span>
                  </label>
                  <input
                    className="form-input"
                    placeholder="abu-builders"
                    value={tenant.slug || ""}
                    onChange={(e) =>
                      setTenant((p) => ({
                        ...p,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-"),
                      }))
                    }
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">Tagline</label>
                  <input
                    className="form-input"
                    placeholder="Building Ethiopia's Future"
                    value={tenant.tagline || ""}
                    onChange={(e) =>
                      setTenant((p) => ({ ...p, tagline: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Founded Year</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="2010"
                    value={tenant.founded_year || ""}
                    onChange={(e) =>
                      setTenant((p) => ({
                        ...p,
                        founded_year: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={tenant.is_active ? "true" : "false"}
                    onChange={(e) =>
                      setTenant((p) => ({
                        ...p,
                        is_active: e.target.value === "true",
                      }))
                    }
                  >
                    <option value="true">Active — visible to public</option>
                    <option value="false">Inactive — hidden from public</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="card mb-6">
            <div className="card-header">
              <div className="card-title">🖼️ Logo</div>
            </div>
            <div className="card-body">
              <ImageUploader
                label="Company Logo"
                currentUrl={tenant.logo_url}
                tenantSlug={tenant.slug || "new"}
                folder="logo"
                aspectRatio="1/1"
                hint="Square logo recommended. PNG with transparent background works best."
                onUploaded={(url) =>
                  setTenant((p) => ({ ...p, logo_url: url }))
                }
              />
            </div>
          </div>

          {/* Brand Colors */}
          <div className="card mb-6">
            <div className="card-header">
              <div className="card-title">🎨 Brand Colors</div>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Primary Color (hero background)
                  </label>
                  <div className="color-row">
                    <input
                      type="color"
                      className="color-swatch"
                      value={tenant.primary_color || "#1a1a2e"}
                      onChange={(e) =>
                        setTenant((p) => ({
                          ...p,
                          primary_color: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="form-input color-input"
                      value={tenant.primary_color || "#1a1a2e"}
                      onChange={(e) =>
                        setTenant((p) => ({
                          ...p,
                          primary_color: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Accent Color (gold/highlight)
                  </label>
                  <div className="color-row">
                    <input
                      type="color"
                      className="color-swatch"
                      value={tenant.accent_color || "#f4a61d"}
                      onChange={(e) =>
                        setTenant((p) => ({
                          ...p,
                          accent_color: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="form-input color-input"
                      value={tenant.accent_color || "#f4a61d"}
                      onChange={(e) =>
                        setTenant((p) => ({
                          ...p,
                          accent_color: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              {/* Live preview */}
              <div
                style={{
                  marginTop: "1.5rem",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #2a2a2a",
                }}
              >
                <div
                  style={{
                    background: tenant.primary_color,
                    padding: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      background: accent,
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "15px",
                      }}
                    >
                      {tenant.name || "Company Name"}
                    </div>
                    <div
                      style={{
                        color: accent,
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      {tenant.tagline || "Your tagline"}
                    </div>
                  </div>
                  <div
                    style={{
                      marginLeft: "auto",
                      background: accent,
                      color: "#000",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "6px 14px",
                      borderRadius: "4px",
                    }}
                  >
                    Preview
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card mb-6">
            <div className="card-header">
              <div className="card-title">📍 Contact Information</div>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="info@company.com"
                    value={contact.email}
                    onChange={(e) =>
                      setContact((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    placeholder="+251 91 123 4567"
                    value={contact.phone}
                    onChange={(e) =>
                      setContact((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    className="form-input"
                    placeholder="Addis Ababa"
                    value={contact.city}
                    onChange={(e) =>
                      setContact((p) => ({ ...p, city: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    className="form-input"
                    placeholder="Bole Sub-city, Woreda 03"
                    value={contact.address}
                    onChange={(e) =>
                      setContact((p) => ({ ...p, address: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">Google Maps URL</label>
                  <input
                    className="form-input"
                    placeholder="https://maps.google.com/?q=..."
                    value={contact.maps_url}
                    onChange={(e) =>
                      setContact((p) => ({ ...p, maps_url: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => router.push("/admin/dashboard")}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : isNew ? "Create Company" : "Save Changes"}
            </button>
          </div>
        </div>
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
