"use client";

import { Contact, Service } from "../../types";
import { FadeSection } from "../ui/FadeSection";
import { SectionHeader } from "../ui/SectionHeader";

interface ContactSectionProps {
  contact: Contact | undefined;
  services: Service[];
  accent: string;
}

function ContactInfoItem({
  icon,
  label,
  children,
  accent,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="contact-info-item">
      <div className="contact-icon" style={{ color: accent }}>
        {icon}
      </div>
      <div>
        <div className="contact-info-label" style={{ color: accent }}>
          {label}
        </div>
        <div className="contact-info-value">{children}</div>
      </div>
    </div>
  );
}

export function ContactSection({
  contact,
  services,
  accent,
}: ContactSectionProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      "Message sent! (Connect a backend to handle submissions in a future step.)",
    );
  };

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
            <div className="contact-info">
              {contact?.phone && (
                <ContactInfoItem icon="📞" label="Phone" accent={accent}>
                  <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                </ContactInfoItem>
              )}

              {contact?.email && (
                <ContactInfoItem icon="✉️" label="Email" accent={accent}>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </ContactInfoItem>
              )}

              {(contact?.address || contact?.city) && (
                <ContactInfoItem icon="📍" label="Address" accent={accent}>
                  {contact.address && <div>{contact.address}</div>}
                  {contact.city && <div>{contact.city}, Ethiopia</div>}
                  {contact.maps_url && (
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
                </ContactInfoItem>
              )}
            </div>

            {/* ── Right: enquiry form ── */}
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    placeholder="Abebe Girma"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    placeholder="+251 91..."
                    type="tel"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  placeholder="you@example.com"
                  type="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Type</label>
                <select className="form-input">
                  <option value="">Select a service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-input"
                  placeholder="Describe your project..."
                />
              </div>

              <button
                type="submit"
                className="form-submit"
                style={{ background: accent }}
              >
                Send Message →
              </button>
            </form>
          </div>
        </div>
      </section>
    </FadeSection>
  );
}
