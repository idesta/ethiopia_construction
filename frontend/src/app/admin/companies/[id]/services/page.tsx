"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "../../../../../components/Sidebar";
import { useToast } from "../../../../../components/ui/ToastProvider";
import {
  auth,
  tenants as tenantsApi,
  services as servicesApi,
  Tenant,
  Service,
} from "../../../../../lib/api";

const EMPTY: Omit<Service, "id" | "tenant_id"> = {
  title: "",
  description: "",
  icon: "🏗️",
  sort_order: 0,
};

const ICONS = [
  "🏗️",
  "🏛️",
  "🛣️",
  "📐",
  "🏠",
  "🏢",
  "🔧",
  "⚙️",
  "🏭",
  "🌉",
  "🛠️",
  "📏",
  "🧱",
];

export default function ServicesPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const tenantId = params.id as string;

  const [userEmail, setUserEmail] = useState("");
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [list, setList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const user = await auth.me();
        setUserEmail(user.email);
        const t = await tenantsApi.get(tenantId);
        setTenant(t);
        setList(await servicesApi.list(tenantId));
      } catch {
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tenantId, router]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }
  function openEdit(s: Service) {
    setEditing(s);
    setForm({
      title: s.title,
      description: s.description || "",
      icon: s.icon || "🏗️",
      sort_order: s.sort_order || 0,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title) {
      showToast("Title is required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await servicesApi.update(editing.id, form);
        setList((prev) =>
          prev.map((s) => (s.id === editing.id ? { ...s, ...form } : s)),
        );
        showToast("Service updated!", "success");
      } else {
        const created = await servicesApi.create(tenantId, form);
        setList((prev) => [...prev, created]);
        showToast("Service added!", "success");
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await servicesApi.remove(id);
      setList((prev) => prev.filter((s) => s.id !== id));
      showToast("Service deleted", "info");
    } catch (err: any) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setDeleteId(null);
    }
  }

  if (loading) return <LoadingScreen />;

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
              onClick={() => router.push(`/admin/companies/${tenantId}`)}
            >
              ← {tenant?.name}
            </button>
            <div className="topbar-title">Services</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openNew}>
            + Add Service
          </button>
        </div>

        <div className="admin-content">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Services Offered ({list.length})</div>
              <button className="btn btn-secondary btn-sm" onClick={openNew}>
                + New
              </button>
            </div>

            {list.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⚙️</div>
                <div className="empty-state-text">No services defined yet</div>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                  onClick={openNew}
                >
                  Add First Service
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: "1rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "1rem",
                }}
              >
                {list.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      borderRadius: "10px",
                      padding: "1.25rem",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
                      {s.icon}
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#e2e2e2",
                        marginBottom: "0.4rem",
                      }}
                    >
                      {s.title}
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        lineHeight: 1.6,
                        marginBottom: "1rem",
                      }}
                    >
                      {s.description || "No description"}
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEdit(s)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteId(s.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                {editing ? "Edit Service" : "New Service"}
              </div>
              <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, icon }))}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 6,
                          fontSize: "1.3rem",
                          border:
                            form.icon === icon
                              ? "2px solid #f4a61d"
                              : "1px solid #2a2a2a",
                          background:
                            form.icon === icon ? "#1a1500" : "#1a1a1a",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input
                    className="form-input"
                    placeholder="Or type any emoji"
                    value={form.icon}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, icon: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Title <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    placeholder="Building Construction"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    placeholder="Brief description..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        sort_order: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Add Service"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "380px" }}>
            <div className="modal-header">
              <div className="modal-title">Delete Service?</div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "13px", color: "#888" }}>
                This cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
