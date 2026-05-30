"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "../../../../../components/Sidebar";
import { ImageUploader } from "../../../../../components/ui/ImageUploader";
import { useToast } from "../../../../../components/ui/ToastProvider";
import {
  auth,
  tenants as tenantsApi,
  team as teamApi,
  Tenant,
  TeamMember,
} from "../../../../../lib/api";

const EMPTY: Omit<TeamMember, "id" | "tenant_id"> = {
  name: "",
  role: "",
  photo_url: "",
  sort_order: 0,
};

export default function TeamPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const tenantId = params.id as string;

  const [userEmail, setUserEmail] = useState("");
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [list, setList] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
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
        setList(await teamApi.list(tenantId));
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
  function openEdit(m: TeamMember) {
    setEditing(m);
    setForm({
      name: m.name,
      role: m.role || "",
      photo_url: m.photo_url || "",
      sort_order: m.sort_order || 0,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name) {
      showToast("Name is required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await teamApi.update(editing.id, form);
        setList((prev) =>
          prev.map((m) => (m.id === editing.id ? { ...m, ...form } : m)),
        );
        showToast("Member updated!", "success");
      } else {
        const created = await teamApi.create(tenantId, form);
        setList((prev) => [...prev, created]);
        showToast("Member added!", "success");
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
      await teamApi.remove(id);
      setList((prev) => prev.filter((m) => m.id !== id));
      showToast("Member removed", "info");
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
            <div className="topbar-title">Team Members</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openNew}>
            + Add Member
          </button>
        </div>

        <div className="admin-content">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Team ({list.length})</div>
              <button className="btn btn-secondary btn-sm" onClick={openNew}>
                + New
              </button>
            </div>

            {list.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-text">No team members yet</div>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                  onClick={openNew}
                >
                  Add First Member
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: "1rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                {list.map((member) => (
                  <div
                    key={member.id}
                    className="card"
                    style={{ padding: "1.25rem", textAlign: "center" }}
                  >
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          objectFit: "cover",
                          margin: "0 auto 0.75rem",
                          border: "2px solid #2a2a2a",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          background: "#1f1f1f",
                          margin: "0 auto 0.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                          color: "#f4a61d",
                          border: "2px solid #2a2a2a",
                        }}
                      >
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#e2e2e2",
                        marginBottom: "2px",
                      }}
                    >
                      {member.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#555",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {member.role || "No role set"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEdit(member)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteId(member.id)}
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
                {editing ? "Edit Member" : "Add Member"}
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
                    Full Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    placeholder="Abebe Girma"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role / Title</label>
                  <input
                    className="form-input"
                    placeholder="Senior Civil Engineer"
                    value={form.role}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, role: e.target.value }))
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
                <ImageUploader
                  label="Profile Photo"
                  currentUrl={form.photo_url}
                  tenantSlug={tenant?.slug || ""}
                  folder="team"
                  aspectRatio="1/1"
                  hint="Square photo works best"
                  onUploaded={(url) =>
                    setForm((p) => ({ ...p, photo_url: url }))
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
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "380px" }}>
            <div className="modal-header">
              <div className="modal-title">Remove Member?</div>
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
                Remove
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
