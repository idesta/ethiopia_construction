"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "../../../../../components/Sidebar";
import { useToast } from "../../../../../components/ui/ToastProvider";
import {
  auth,
  tenants as tenantsApi,
  heroSlides as heroSlidesApi,
  uploadFile,
  Tenant,
  HeroSlide,
} from "../../../../../lib/api";

const EMPTY: Partial<HeroSlide> = {
  headline: "",
  tagline: "",
  cta_label: "View Our Work",
  cta_target: "projects",
  layout: "split",
  media_type: "builtin_scene",
  media_ref: "crane",
  accent_override: "",
};

const CTA_TARGETS = ["home", "services", "projects", "team", "contact"];

const LAYOUTS = [
  {
    value: "split",
    label: "Split — text left, scene right (matches main hero)",
  },
  {
    value: "full-bleed",
    label: "Full-bleed — scene fills the hero, text overlaid",
  },
];

// Keep in sync with BUILTIN_SCENES in
// sites/[slug]/components/sections/BuiltinScenes.tsx. These are just
// the picker's labels/icons — the actual animated SVGs render on the
// public site, not here.
const BUILTIN_SCENE_OPTIONS = [
  { key: "crane", label: "Tower Crane", icon: "🏗️" },
  { key: "villa", label: "Villa House", icon: "🏡" },
  { key: "apartment", label: "Apartment Block", icon: "🏢" },
  { key: "road", label: "Asphalt Road", icon: "🛣️" },
  { key: "tall-building", label: "Tall Buildings", icon: "🏙️" },
  { key: "safety-gear", label: "Safety Gear", icon: "⛑️" },
  { key: "bulldozer", label: "Bulldozer", icon: "🚜" },
  { key: "excavator", label: "Excavator", icon: "🚧" },
  { key: "truck", label: "Dump Truck", icon: "🚛" },
  { key: "engineer", label: "Civil Engineer", icon: "👷" },
];

function isVideoUrl(url: string | null | undefined) {
  return !!url && /\.(mp4|webm|mov)$/i.test(url);
}

export default function HeroSlidesPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const tenantId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userEmail, setUserEmail] = useState("");
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [list, setList] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState<Partial<HeroSlide>>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const user = await auth.me();
        setUserEmail(user.email);
        const t = await tenantsApi.get(tenantId);
        setTenant(t);
        setList(await heroSlidesApi.list(tenantId));
      } catch {
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tenantId, router]);

  // Inject company colors as CSS variables
  useEffect(() => {
    if (tenant) {
      document.documentElement.style.setProperty(
        "--admin-accent",
        tenant.accent_color || "#f4a61d",
      );
      document.documentElement.style.setProperty(
        "--admin-primary",
        tenant.primary_color || "#1a1a2e",
      );
    }
  }, [tenant?.accent_color, tenant?.primary_color]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setFile(null);
    setPreview(null);
    setModalOpen(true);
  }

  function openEdit(s: HeroSlide) {
    setEditing(s);
    setForm({
      headline: s.headline,
      tagline: s.tagline || "",
      cta_label: s.cta_label || "View Our Work",
      cta_target: s.cta_target || "projects",
      layout: s.layout || "split",
      media_type: s.media_type || "builtin_scene",
      media_ref: s.media_ref || "crane",
      accent_override: s.accent_override || "",
    });
    setFile(null);
    setPreview(s.media_type === "uploaded" ? s.media_ref : null);
    setModalOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 30 * 1024 * 1024) {
      showToast("File must be under 30MB", "error");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSave() {
    if (!form.headline) {
      showToast("Headline is required", "error");
      return;
    }
    if (form.media_type === "uploaded" && !file && !editing?.media_ref) {
      showToast("Upload an image or video for this slide", "error");
      return;
    }

    setSaving(true);
    try {
      // Upload first, same two-step flow as project covers and team
      // photos: get a URL back from the generic uploader, then send
      // that URL along with the rest of the slide's fields as plain
      // JSON. Only relevant when a *new* file was picked — if editing
      // and media_ref already points at an existing upload, leave it.
      let mediaRef = form.media_ref;
      if (form.media_type === "uploaded" && file) {
        const uploaded = await uploadFile(
          file,
          tenant?.slug || "",
          "hero-slides",
        );
        mediaRef = uploaded.url;
      }

      const payload = { ...form, media_ref: mediaRef };

      if (editing) {
        const updated = await heroSlidesApi.update(editing.id, payload);
        setList((prev) => prev.map((s) => (s.id === editing.id ? updated : s)));
        showToast("Slide updated!", "success");
      } else {
        const created = await heroSlidesApi.create(tenantId, payload);
        setList((prev) => [...prev, created]);
        showToast("Slide added!", "success");
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
      await heroSlidesApi.remove(id);
      setList((prev) => prev.filter((s) => s.id !== id));
      showToast("Slide deleted", "info");
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
            <div className="topbar-title">Hero Slides</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openNew}>
            + Add Slide
          </button>
        </div>

        <div className="admin-content">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Hero Slides ({list.length})</div>
              <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
                Each slide is a complete hero — its own headline, tagline, and
                visual. Leave this empty to keep the single static hero.
              </p>
            </div>

            {list.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎞️</div>
                <div className="empty-state-text">No hero slides yet</div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "0.5rem",
                  }}
                >
                  The site keeps using the single static hero until at least one
                  slide is added here.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                  onClick={openNew}
                >
                  Add First Slide
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: "1rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1rem",
                }}
              >
                {list.map((s) => {
                  const builtin = BUILTIN_SCENE_OPTIONS.find(
                    (b) => b.key === s.media_ref,
                  );
                  return (
                    <div
                      key={s.id}
                      style={{
                        background: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          aspectRatio: "16/9",
                          background: "#0d0d0d",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "2rem",
                          overflow: "hidden",
                        }}
                      >
                        {s.media_type === "builtin_scene" ? (
                          builtin?.icon || "🏗️"
                        ) : s.media_ref ? (
                          isVideoUrl(s.media_ref) ? (
                            <video
                              src={s.media_ref}
                              muted
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <img
                              src={s.media_ref}
                              alt={s.headline}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )
                        ) : (
                          "🖼️"
                        )}
                      </div>
                      <div style={{ padding: "1rem" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#e2e2e2",
                            marginBottom: "4px",
                          }}
                        >
                          {s.headline}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#666",
                            marginBottom: "0.75rem",
                          }}
                        >
                          {s.layout === "full-bleed" ? "Full-bleed" : "Split"} ·
                          Order {s.sort_order}
                        </div>
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
                    </div>
                  );
                })}
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
          <div className="modal" style={{ maxWidth: "640px" }}>
            <div className="modal-header">
              <div className="modal-title">
                {editing ? "Edit Slide" : "New Slide"}
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
                    Headline <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    placeholder="Building Ethiopia's Skyline"
                    value={form.headline || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, headline: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tagline</label>
                  <input
                    className="form-input"
                    placeholder="Twelve years of landmark towers across Addis Ababa"
                    value={form.tagline || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, tagline: e.target.value }))
                    }
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">CTA Button Text</label>
                    <input
                      className="form-input"
                      value={form.cta_label || ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, cta_label: e.target.value }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CTA Scrolls To</label>
                    <select
                      className="form-input"
                      value={form.cta_target || "projects"}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, cta_target: e.target.value }))
                      }
                    >
                      {CTA_TARGETS.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Layout</label>
                  <select
                    className="form-input"
                    value={form.layout || "split"}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, layout: e.target.value }))
                    }
                  >
                    {LAYOUTS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Visual</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <button
                      type="button"
                      className={
                        form.media_type === "builtin_scene"
                          ? "btn btn-primary btn-sm"
                          : "btn btn-secondary btn-sm"
                      }
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          media_type: "builtin_scene",
                          media_ref:
                            p.media_ref &&
                            BUILTIN_SCENE_OPTIONS.some(
                              (b) => b.key === p.media_ref,
                            )
                              ? p.media_ref
                              : "crane",
                        }))
                      }
                    >
                      Built-in 3D Scene
                    </button>
                    <button
                      type="button"
                      className={
                        form.media_type === "uploaded"
                          ? "btn btn-primary btn-sm"
                          : "btn btn-secondary btn-sm"
                      }
                      onClick={() =>
                        setForm((p) => ({ ...p, media_type: "uploaded" }))
                      }
                    >
                      Upload Image / Video
                    </button>
                  </div>

                  {form.media_type === "builtin_scene" ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: "0.5rem",
                      }}
                    >
                      {BUILTIN_SCENE_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() =>
                            setForm((p) => ({ ...p, media_ref: opt.key }))
                          }
                          title={opt.label}
                          style={{
                            padding: "0.75rem 0.5rem",
                            borderRadius: 6,
                            fontSize: "1.3rem",
                            border:
                              form.media_ref === opt.key
                                ? "2px solid #f4a61d"
                                : "1px solid #2a2a2a",
                            background:
                              form.media_ref === opt.key
                                ? "#1a1500"
                                : "#1a1a1a",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "0.35rem",
                            cursor: "pointer",
                          }}
                        >
                          <span>{opt.icon}</span>
                          <span
                            style={{
                              fontSize: "9px",
                              color: "#888",
                              textAlign: "center",
                              lineHeight: 1.2,
                            }}
                          >
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="uploader"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/mp4,video/webm,video/quicktime"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                      {preview ? (
                        isVideoUrl(preview) ||
                        file?.type.startsWith("video/") ? (
                          <video
                            src={preview}
                            muted
                            style={{
                              maxWidth: "100%",
                              maxHeight: 160,
                              margin: "0 auto",
                            }}
                          />
                        ) : (
                          <img
                            src={preview}
                            alt=""
                            style={{
                              maxWidth: "100%",
                              maxHeight: 160,
                              margin: "0 auto",
                              borderRadius: 6,
                            }}
                          />
                        )
                      ) : (
                        <>
                          <div className="uploader-icon">🎬</div>
                          <div className="uploader-text">
                            Click to choose an image or video
                          </div>
                          <div className="uploader-sub">
                            MP4/WebM or JPG/PNG, up to 30MB
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Accent Override (optional)
                  </label>
                  <div className="color-row">
                    <input
                      type="color"
                      className="color-swatch"
                      value={
                        form.accent_override ||
                        tenant?.accent_color ||
                        "#f4a61d"
                      }
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          accent_override: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="form-input color-input"
                      placeholder="Leave blank to use the company's default accent"
                      value={form.accent_override || ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          accent_override: e.target.value,
                        }))
                      }
                    />
                    {form.accent_override && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          setForm((p) => ({ ...p, accent_override: "" }))
                        }
                      >
                        Clear
                      </button>
                    )}
                  </div>
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
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Slide"}
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
              <div className="modal-title">Delete Slide?</div>
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
