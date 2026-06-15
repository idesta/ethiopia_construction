"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "../../../../../components/Sidebar";
import { useToast } from "../../../../../components/ui/ToastProvider";
import {
  auth,
  tenants as tenantsApi,
  heroScenes as heroScenesApi,
  Tenant,
  HeroScene,
} from "../../../../../lib/api";

export default function HeroScenesPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const tenantId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userEmail, setUserEmail] = useState("");
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [scenes, setScenes] = useState<HeroScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const user = await auth.me();
        setUserEmail(user.email);
        const t = await tenantsApi.get(tenantId);
        setTenant(t);
        setScenes(await heroScenesApi.list(tenantId));
      } catch {
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tenantId, router]);

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

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const created = await heroScenesApi.upload(tenantId, file, tenant?.slug || "");
      setScenes((prev) => [...prev, created]);
      showToast("Scene uploaded!", "success");
    } catch (err: any) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      await heroScenesApi.remove(id);
      setScenes((prev) => prev.filter((s) => s.id !== id));
      showToast("Scene deleted", "info");
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
            <div className="topbar-title">Hero Scenes</div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "+ Upload Scene"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.svg"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
        </div>

        <div className="admin-content">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                🎬 Hero Scenes ({scenes.length}/10)
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  margin: 0,
                }}
              >
                Upload images or SVGs that appear in the hero section's
                scatter/assemble animation
              </p>
            </div>

            {scenes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎬</div>
                <div className="empty-state-text">
                  No hero scenes uploaded yet
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "0.5rem",
                  }}
                >
                  If no scenes are uploaded, the built-in animated SVG scenes
                  will be used instead.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload First Scene
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: "1rem",
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "1rem",
                }}
              >
                {scenes.map((scene, i) => (
                  <div
                    key={scene.id}
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: "16/10",
                        background: "#0d0d0d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={scene.url}
                        alt={scene.label || `Scene ${i + 1}`}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#ccc",
                            fontWeight: 500,
                          }}
                        >
                          {scene.label || `Scene ${i + 1}`}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#555",
                          }}
                        >
                          Order: {scene.sort_order}
                        </div>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteId(scene.id)}
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

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "380px" }}>
            <div className="modal-header">
              <div className="modal-title">Delete Scene?</div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "13px", color: "#888" }}>
                This will permanently delete the file and cannot be undone.
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