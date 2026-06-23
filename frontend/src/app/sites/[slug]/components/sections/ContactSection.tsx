"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Contact, Service } from "../../types";
import { FadeSection } from "../ui/FadeSection";
import { SectionHeader } from "../ui/SectionHeader";
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ArrowRightIcon,
  CheckIcon,
  ExternalLinkIcon,
} from "../ui/Icons";
import { GeoRule } from "../ui/EthiopianGeometric";
import { fadeLeft, fadeRight, scaleIn } from "../ui/Motion";

interface ContactSectionProps {
  contact: Contact | undefined;
  services: Service[];
  accent: string;
  slug: string;
}

type FormState = "idle" | "sending" | "success" | "error";

const fieldIds = {
  name: "contact-name",
  phone: "contact-phone",
  email: "contact-email",
  service: "contact-service",
  message: "contact-message",
};

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
    } catch (err: unknown) {
      setFormState("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <FadeSection variant="scrub-tilt">
      <section id="contact" className="contact-section">
        <div className="section-inner">
          <SectionHeader
            eyebrow="Get In Touch"
            title="Start Your"
            highlight="Project"
            accent={accent}
          />

          <GeoRule accent={accent} className="section-rule" />

          <motion.div className="contact-grid">
            {/* ── Left: contact info ── */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {contact?.phone && (
                <motion.div className="contact-info-item" variants={scaleIn}>
                  <div className="contact-icon">
                    <PhoneIcon />
                  </div>
                  <div>
                    <div className="contact-info-label">Phone</div>
                    <div className="contact-info-value">
                      <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                    </div>
                  </div>
                </motion.div>
              )}
              {contact?.email && (
                <motion.div className="contact-info-item" variants={scaleIn}>
                  <div className="contact-icon">
                    <MailIcon />
                  </div>
                  <div>
                    <div className="contact-info-label">Email</div>
                    <div className="contact-info-value">
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </div>
                  </div>
                </motion.div>
              )}
              {(contact?.address || contact?.city) && (
                <motion.div className="contact-info-item" variants={scaleIn}>
                  <div className="contact-icon">
                    <MapPinIcon />
                  </div>
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
                          className="contact-map-link"
                          style={{ color: accent }}
                        >
                          View on Map <ExternalLinkIcon />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* ── Right: form ── */}
            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {formState === "success" ? (
                <motion.div
                  className="form-state form-state-success"
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="form-state-icon">
                    <CheckIcon size={34} />
                  </div>
                  <h3 className="form-state-title">Message Sent!</h3>
                  <p>
                    {successMsg ||
                      "Your enquiry has been delivered. The team will get back to you shortly."}
                  </p>
                  {successMsg.includes("not configured") && (
                    <p className="form-state-note">
                      Note: email delivery is currently disabled for this site.
                    </p>
                  )}
                  <button
                    type="button"
                    className="form-state-action"
                    onClick={() => setFormState("idle")}
                    style={{ background: accent }}
                  >
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor={fieldIds.name}>
                        Full Name *
                      </label>
                      <input
                        id={fieldIds.name}
                        className="form-input"
                        placeholder="Abebe Girma"
                        value={form.name}
                        onChange={set("name")}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor={fieldIds.phone}>
                        Phone
                      </label>
                      <input
                        id={fieldIds.phone}
                        className="form-input"
                        placeholder="+251 91..."
                        type="tel"
                        value={form.phone}
                        onChange={set("phone")}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor={fieldIds.email}>
                      Email
                    </label>
                    <input
                      id={fieldIds.email}
                      className="form-input"
                      placeholder="you@example.com"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor={fieldIds.service}>
                      Project Type
                    </label>
                    <select
                      id={fieldIds.service}
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
                    <label className="form-label" htmlFor={fieldIds.message}>
                      Message *
                    </label>
                    <textarea
                      id={fieldIds.message}
                      className="form-input"
                      placeholder="Describe your project..."
                      value={form.message}
                      onChange={set("message")}
                      required
                    />
                  </div>

                  {formState === "error" && (
                    <div
                      className="form-state-error"
                      role="alert"
                      aria-live="assertive"
                    >
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="form-submit"
                    style={{ background: accent }}
                    disabled={formState === "sending"}
                  >
                    {formState === "sending" ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message <ArrowRightIcon />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </FadeSection>
  );
}
