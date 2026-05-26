"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Sidebar } from "@/components/Sidebar";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { useToast } from "@/components/ui/ToastProvider";
import { TeamMember, Tenant } from "@/app/admin/types";

const EMPTY_MEMBER: Omit<TeamMember, "id" | "tenant_id"> = {
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
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState(EMPTY_MEMBER);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin");
        return;
      }
      setUserEmail(user.email || "");

      const { data: t } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();
      if (!t) {
        router.push("/admin/dashboard");
        return;
      }
      setTenant(t);

      const { data: m } = await supabase
        .from("team")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("sort_order", { ascending: true });
      setTeam(m || []);
      setLoading(false);
    }
    load();
  }, [tenantId, router]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY_MEMBER);
    setModalOpen(true);
  }

  function openEdit(member: TeamMember) {
    setEditing(member);
    setForm({
      name: member.name,
      role: member.role || "",
      photo_url: member.photo_url || "",
      sort_order: member.sort_order || 0,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name) {
      showToast("Name is required", "error");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    try {
      if (editing) {
        await supabase
          .from("team")
          .update({ ...form })
          .eq("id", editing.id);
        setTeam((prev) =>
          prev.map((m) => (m.id === editing.id ? { ...m, ...form } : m)),
        );
        showToast("Team member updated!", "success");
      } else {
        const { data } = await supabase
          .from("team")
          .insert({ ...form, tenant_id: tenantId })
          .select()
          .single();
        if (data) setTeam((prev) => [...prev, data]);
        showToast("Team member added!", "success");
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(msg || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("team").delete().eq("id", id);
    setTeam((prev) => prev.filter((m) => m.id !== id));
    setDeleteId(null);
    showToast("Member removed", "info");
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
              <div className="card-title">Team ({team.length})</div>
              <button className="btn btn-secondary btn-sm" onClick={openNew}>
                + New
              </button>
            </div>

            {team.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-text">No team members yet</div>
                <div className="empty-state-sub">
                  Add your engineers and staff to display on the website
                </div>
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
                {team.map((member) => (
                  <div
                    key={member.id}
                    className="card"
                    style={{ padding: "1.25rem", textAlign: "center" }}
                  >
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        width={72}
                        height={72}
                        unoptimized
                        style={{
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

      {/* ── Modal ── */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                {editing ? "Edit Member" : "Add Team Member"}
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
                    placeholder="0"
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
                  folder={`team/${tenantId}`}
                  aspectRatio="1/1"
                  hint="Square photo works best for the circular display"
                  onUploaded={(url: string) =>
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
                This will permanently remove this team member.
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
