"use client";

import { Contact, Service } from "../../types";
import { FadeSection } from "../../components/ui/FadeSection";
import { SectionHeader } from "../../components/ui/SectionHeader";

interface ContactSectionProps {
  contact: Contact | undefined;
  services: Service[];
  accent: string;
}

export function ContactSection({
  contact,
  services,
  accent,
}: ContactSectionProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent! (Connect email backend in a future step.)");
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
                    </div>
                  </div>
                </div>
              )}
            </div>

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
