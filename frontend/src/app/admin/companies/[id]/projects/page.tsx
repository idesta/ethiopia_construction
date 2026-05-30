"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "../../../../../components/Sidebar";
import { ImageUploader } from "../../../../../components/ui/ImageUploader";
import { useToast } from "../../../../../components/ui/ToastProvider";
import {
  auth,
  tenants as tenantsApi,
  projects as projectsApi,
  Tenant,
  Project,
} from "../../../../../lib/api";

const EMPTY: Omit<Project, "id" | "tenant_id"> = {
  title: "",
  description: "",
  location: "",
  category: "",
  status: "completed",
  completed_at: "",
  cover_url: "",
  sort_order: 0,
};

const CATEGORIES = [
  "Residential",
  "Commercial",
  "Road & Infrastructure",
  "Industrial",
  "Interior Design",
  "Mixed Use",
  "Other",
];

export default function ProjectsPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const tenantId = params.id as string;

  const [userEmail, setUserEmail] = useState("");
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [list, setList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
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
        setList(await projectsApi.list(tenantId));
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
  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description || "",
      location: p.location || "",
      category: p.category || "",
      status: p.status || "completed",
      completed_at: p.completed_at || "",
      cover_url: p.cover_url || "",
      sort_order: p.sort_order || 0,
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
        await projectsApi.update(editing.id, form);
        setList((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...form } : p)),
        );
        showToast("Project updated!", "success");
      } else {
        const created = await projectsApi.create(tenantId, form);
        setList((prev) => [...prev, created]);
        showToast("Project added!", "success");
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
      await projectsApi.remove(id);
      setList((prev) => prev.filter((p) => p.id !== id));
      showToast("Project deleted", "info");
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
            <div className="topbar-title">Projects</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openNew}>
            + Add Project
          </button>
        </div>

        <div className="admin-content">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                Portfolio Projects ({list.length})
              </div>
              <button className="btn btn-secondary btn-sm" onClick={openNew}>
                + New
              </button>
            </div>

            {list.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏗️</div>
                <div className="empty-state-text">No projects yet</div>
                <div className="empty-state-sub">
                  Add portfolio projects to showcase on the website
                </div>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                  onClick={openNew}
                >
                  Add First Project
                </button>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Completed</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            {p.cover_url ? (
                              <img
                                src={p.cover_url}
                                alt={p.title}
                                style={{
                                  width: 40,
                                  height: 30,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                  border: "1px solid #2a2a2a",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 40,
                                  height: 30,
                                  background: "#1f1f1f",
                                  borderRadius: 4,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                🏗️
                              </div>
                            )}
                            <span style={{ fontWeight: 500, color: "#e2e2e2" }}>
                              {p.title}
                            </span>
                          </div>
                        </td>
                        <td>{p.category || "—"}</td>
                        <td>{p.location || "—"}</td>
                        <td>
                          <span
                            className={`badge ${p.status === "completed" ? "badge-green" : p.status === "ongoing" ? "badge-yellow" : ""}`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td>
                          {p.completed_at
                            ? new Date(p.completed_at).getFullYear()
                            : "—"}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              className="btn btn-ghost btn-sm btn-icon"
                              onClick={() => openEdit(p)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-danger btn-sm btn-icon"
                              onClick={() => setDeleteId(p.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                {editing ? "Edit Project" : "New Project"}
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
                  <label className="form-label">
                    Title <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    placeholder="Bole Apartments Phase 2"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input"
                      value={form.category}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, category: e.target.value }))
                      }
                    >
                      <option value="">Select...</option>
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-input"
                      value={form.status}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, status: e.target.value }))
                      }
                    >
                      <option value="completed">Completed</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      className="form-input"
                      placeholder="Bole, Addis Ababa"
                      value={form.location}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, location: e.target.value }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Completed Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.completed_at}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, completed_at: e.target.value }))
                      }
                    />
                  </div>
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
                <ImageUploader
                  label="Cover Photo"
                  currentUrl={form.cover_url}
                  tenantSlug={tenant?.slug || ""}
                  folder="projects"
                  aspectRatio="16/9"
                  hint="Main photo displayed on the portfolio card"
                  onUploaded={(url) =>
                    setForm((p) => ({ ...p, cover_url: url }))
                  }
                />
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
                    : "Add Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "380px" }}>
            <div className="modal-header">
              <div className="modal-title">Delete Project?</div>
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
