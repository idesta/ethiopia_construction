"use client";

import { useState } from "react";
import { Contact, Service } from "../../types";
import { FadeSection } from "../ui/FadeSection";
import { SectionHeader } from "../ui/SectionHeader";

interface ContactSectionProps {
  contact: Contact | undefined;
  services: Service[];
  accent: string;
  slug: string; // ← add slug prop so we know which company
}

type FormState = "idle" | "sending" | "success" | "error";

export function ContactSection({
  contact,
  services,
  accent,
  slug,
}: ContactSectionProps) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });

  const set =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.message) return;

    setFormState("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send");
      }

      setSuccessMsg(data.message || "Your enquiry has been delivered.");
      setFormState("success");
      setForm({ name: "", phone: "", email: "", service: "", message: "" });
    } catch (err: any) {
      setFormState("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <FadeSection>
      <section id="contact" className="contact-section">
        <div className="section-inner">
          <SectionHeader
            eyebrow="Get In Touch"
            title="Start Your"
            highlight="Project"
            accent={accent}
          />

          <div className="contact-grid">
            {/* ── Left: contact info ── */}
            <div>
              {contact?.phone && (
                <div className="contact-info-item">
                  <div className="contact-icon">📞</div>
                  <div>
                    <div className="contact-info-label">Phone</div>
                    <div className="contact-info-value">
                      <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                    </div>
                  </div>
                </div>
              )}
              {contact?.email && (
                <div className="contact-info-item">
                  <div className="contact-icon">✉️</div>
                  <div>
                    <div className="contact-info-label">Email</div>
                    <div className="contact-info-value">
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </div>
                  </div>
                </div>
              )}
              {(contact?.address || contact?.city) && (
                <div className="contact-info-item">
                  <div className="contact-icon">📍</div>
                  <div>
                    <div className="contact-info-label">Address</div>
                    <div className="contact-info-value">
                      {contact?.address && <div>{contact.address}</div>}
                      {contact?.city && <div>{contact.city}, Ethiopia</div>}
                      {contact?.maps_url && (
                        <a
                          href={contact.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: accent,
                            fontSize: "0.8rem",
                            marginTop: "0.3rem",
                            display: "inline-block",
                          }}
                        >
                          View on Map →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: form ── */}
            <div>
              {/* Success state */}
              {formState === "success" ? (
                <div
                  style={{
                    background: "#0d2818",
                    border: "1px solid #4ade80",
                    borderRadius: "10px",
                    padding: "3rem 2rem",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    ✅
                  </div>
                  <h3
                    style={{
                      color: "#4ade80",
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "1.8rem",
                      fontWeight: 300,
                      marginBottom: "0.75rem",
                    }}
                  >
                    Message Sent!
                  </h3>
                  <p
                    style={{
                      color: "#888",
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {successMsg ||
                      "Your enquiry has been delivered. The team will get back to you shortly."}
                  </p>
                  {successMsg.includes("not configured") && (
                    <div
                      style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        background: "#fff7d6",
                        border: "1px solid #f5c94c",
                        borderRadius: "8px",
                        color: "#92400e",
                        fontSize: "0.95rem",
                      }}
                    >
                      ⚠️ Email service is not configured. Your message was
                      received, but no notification email was sent.
                    </div>
                  )}
                  <button
                    onClick={() => setFormState("idle")}
                    style={{
                      marginTop: "1.5rem",
                      background: accent,
                      color: "#000",
                      border: "none",
                      padding: "0.75rem 2rem",
                      cursor: "pointer",
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontSize: "0.8rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        className="form-input"
                        placeholder="Abebe Girma"
                        value={form.name}
                        onChange={set("name")}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-input"
                        placeholder="+251 91..."
                        type="tel"
                        value={form.phone}
                        onChange={set("phone")}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className="form-input"
                      placeholder="you@example.com"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Project Type</label>
                    <select
                      className="form-input"
                      value={form.service}
                      onChange={set("service")}
                      disabled={services.length === 0}
                    >
                      <option value="">
                        {services.length
                          ? "Select a service..."
                          : "No services available yet"}
                      </option>
                      {services.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea
                      className="form-input"
                      placeholder="Describe your project..."
                      value={form.message}
                      onChange={set("message")}
                      required
                    />
                  </div>

                  {/* Error message */}
                  {formState === "error" && (
                    <div
                      style={{
                        background: "#2a0d0d",
                        border: "1px solid #f87171",
                        borderRadius: "6px",
                        padding: "0.75rem 1rem",
                        color: "#f87171",
                        fontSize: "13px",
                      }}
                    >
                      ❌ {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="form-submit"
                    style={{ background: accent }}
                    disabled={formState === "sending"}
                  >
                    {formState === "sending" ? "Sending..." : "Send Message →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </FadeSection>
  );
}
