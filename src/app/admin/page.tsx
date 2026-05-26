"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showToast(error.message, "error");
      setLoading(false);
      return;
    }

    showToast("Welcome back!", "success");
    router.push("/admin/dashboard");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "380px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              background: "#f4a61d",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              margin: "0 auto 1rem",
            }}
          >
            🏗️
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#e2e2e2" }}>
            Admin Login
          </h1>
          <p style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>
            Ethiopia Construction Platform
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <div className="card-body">
            <form
              onSubmit={handleLogin}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: "0.5rem",
                }}
              >
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#444",
            marginTop: "1.5rem",
          }}
        >
          This panel is restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
}
