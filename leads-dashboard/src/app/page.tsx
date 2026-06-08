"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

interface Run {
  name: string;
  count: number;
  sizeKB: number;
  hasData: boolean;
}

interface Lead {
  company_name: string;
  business_category: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  street_address: string | null;
  city: string;
  region: string | null;
  country: string;
  google_maps_url: string | null;
  rating: number | null;
  review_count: number;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  telegram_url: string | null;
  website_status: string;
  brand_primary_color: string | null;
  brand_accent_color: string | null;
  brand_colors_found: string[];
  lead_score: number | null;
  lead_priority: string | null;
  recommended_service: string | null;
  data_source: string;
  collection_date: string;
}

const PAGE_SIZE = 25;

function priorityClass(p: string | null) {
  if (p === "High") return "badge badge-high";
  if (p === "Medium") return "badge badge-medium";
  return "badge badge-low";
}

function statusClass(s: string) {
  if (s === "Active") return "badge badge-active";
  if (s === "Broken") return "badge badge-broken";
  return "badge badge-none";
}

function ScoreBar({ score }: { score: number | null }) {
  const s = score ?? 0;
  const color = s >= 70 ? "#f87171" : s >= 45 ? "#f4a61d" : "#888";
  return (
    <div className="score-wrap">
      <div className="score-bar">
        <div className="score-fill" style={{ width: `${s}%`, background: color }} />
      </div>
      <span className="score-num">{s}</span>
    </div>
  );
}

function Swatches({ primary, accent }: { primary: string | null; accent: string | null }) {
  if (!primary && !accent) return <span style={{ color: "#555" }}>-</span>;
  return (
    <div className="swatches">
      {primary && <div className="swatch" style={{ background: primary }} title={primary} />}
      {accent && <div className="swatch" style={{ background: accent }} title={accent} />}
    </div>
  );
}

function SocialLinks({ lead }: { lead: Lead }) {
  const links = [
    { label: "Website", url: lead.website },
    { label: "Facebook", url: lead.facebook_url },
    { label: "Instagram", url: lead.instagram_url },
    { label: "LinkedIn", url: lead.linkedin_url },
    { label: "YouTube", url: lead.youtube_url },
    { label: "TikTok", url: lead.tiktok_url },
    { label: "Telegram", url: lead.telegram_url },
    { label: "Maps", url: lead.google_maps_url },
  ].filter((l) => l.url);

  if (!links.length) return <span style={{ color: "#555", fontSize: 12 }}>None found</span>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {links.map((l) => (
        <a key={l.label} href={l.url!} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#f4a61d" }}>
          {l.label}
        </a>
      ))}
    </div>
  );
}

function LeadDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
      <div className="drawer-row">
        <span className="drawer-row-label">{label}</span>
        <span className="drawer-row-value">{value || "-"}</span>
      </div>
    );
  }

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer">
        <div className="drawer-header">
          <div>
            <div className="drawer-title">{lead.company_name}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              {lead.business_category} · {lead.city}
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>x</button>
        </div>

        <div className="drawer-body">
          <div>
            <div className="drawer-section-title">Lead Intelligence</div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <div className="card" style={{ flex: 1, minWidth: 100 }}>
                <div className="card-label">Score</div>
                <div className="card-value" style={{ fontSize: "1.5rem" }}>{lead.lead_score ?? "-"}</div>
              </div>
              <div className="card" style={{ flex: 1, minWidth: 100 }}>
                <div className="card-label">Priority</div>
                <div style={{ marginTop: 8 }}>
                  <span className={priorityClass(lead.lead_priority)}>{lead.lead_priority ?? "-"}</span>
                </div>
              </div>
              <div className="card" style={{ flex: 2, minWidth: 160 }}>
                <div className="card-label">Recommended Service</div>
                <div style={{ marginTop: 8, fontSize: 13, color: "#f4a61d", fontWeight: 600 }}>
                  {lead.recommended_service ?? "-"}
                </div>
              </div>
            </div>
          </div>

          {(lead.brand_primary_color || lead.brand_accent_color) && (
            <div>
              <div className="drawer-section-title">Brand Colors</div>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {lead.brand_primary_color && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: lead.brand_primary_color, border: "1px solid #2a2a2a" }} />
                    <div>
                      <div style={{ fontSize: 11, color: "#555" }}>Primary</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{lead.brand_primary_color}</div>
                    </div>
                  </div>
                )}
                {lead.brand_accent_color && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: lead.brand_accent_color, border: "1px solid #2a2a2a" }} />
                    <div>
                      <div style={{ fontSize: 11, color: "#555" }}>Accent</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{lead.brand_accent_color}</div>
                    </div>
                  </div>
                )}
              </div>
              {lead.brand_colors_found?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>All colors found</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {lead.brand_colors_found.map((c) => (
                      <div key={c} title={c} style={{ width: 24, height: 24, borderRadius: 4, background: c, border: "1px solid #2a2a2a" }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="drawer-section-title">Contact</div>
            <Row label="Phone" value={lead.phone} />
            <Row label="Email" value={lead.email ? <a href={"mailto:" + lead.email}>{lead.email}</a> : null} />
            <Row label="Address" value={lead.street_address} />
            <Row label="City" value={lead.city} />
            <Row label="Rating" value={lead.rating ? ("Star " + lead.rating + " (" + lead.review_count + " reviews)") : null} />
          </div>

          <div>
            <div className="drawer-section-title">Digital Presence</div>
            <Row label="Website" value={<span className={statusClass(lead.website_status)}>{lead.website_status}</span>} />
            <Row label="Links" value={<SocialLinks lead={lead} />} />
          </div>

          <div>
            <div className="drawer-section-title">Data Info</div>
            <Row label="Source" value={lead.data_source} />
            <Row label="Collected" value={lead.collection_date} />
            <Row label="Category" value={lead.business_category} />
          </div>
        </div>
      </div>
    </div>
  );
}

function exportCSV(leads: Lead[], filename: string) {
  const cols = [
    "company_name", "business_category", "city", "phone",
    "email", "website", "website_status",
    "lead_score", "lead_priority", "recommended_service",
    "brand_primary_color", "brand_accent_color",
    "rating", "review_count",
    "facebook_url", "telegram_url", "google_maps_url",
    "collection_date",
  ] as const;

  const header = cols.join(",");
  const rows = leads.map((l) =>
    cols.map((c) => {
      const v = (l as any)[c] ?? "";
      const s = String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? '"' + s.replace(/"/g, '""') + '"'
        : s;
    }).join(",")
  );

  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<string>("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [runsLoading, setRunsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [fCity, setFCity] = useState("");
  const [fPriority, setFPriority] = useState("");
  const [fService, setFService] = useState("");
  const [fStatus, setFStatus] = useState("");

  useEffect(() => {
    fetch("/api/runs")
      .then((r) => r.json())
      .then((d) => {
        setRuns(d.runs || []);
        if (d.runs?.length > 0) setSelectedRun(d.runs[0].name);
        setRunsLoading(false);
      })
      .catch(() => setRunsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRun) return;
    setLoading(true);
    setPage(1);
    fetch("/api/leads?run=" + selectedRun)
      .then((r) => r.json())
      .then((d) => { setLeads(d.leads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedRun]);

  useEffect(() => { setPage(1); }, [search, fCity, fPriority, fService, fStatus]);

  const cities = useMemo(() =>
    [...new Set(leads.map((l) => l.city).filter(Boolean))].sort(), [leads]);

  const services = useMemo(() =>
    [...new Set(leads.map((l) => l.recommended_service).filter(Boolean))].sort(), [leads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (search && !l.company_name?.toLowerCase().includes(search.toLowerCase()) &&
          !l.business_category?.toLowerCase().includes(search.toLowerCase())) return false;
      if (fCity && l.city !== fCity) return false;
      if (fPriority && l.lead_priority !== fPriority) return false;
      if (fService && l.recommended_service !== fService) return false;
      if (fStatus && l.website_status !== fStatus) return false;
      return true;
    });
  }, [leads, search, fCity, fPriority, fService, fStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const high = leads.filter((l) => l.lead_priority === "High").length;
  const medium = leads.filter((l) => l.lead_priority === "Medium").length;
  const low = leads.filter((l) => l.lead_priority === "Low").length;
  const active = leads.filter((l) => l.website_status === "Active").length;

  const clearFilters = useCallback(() => {
    setSearch(""); setFCity(""); setFPriority(""); setFService(""); setFStatus("");
  }, []);

  const currentRun = runs.find((r) => r.name === selectedRun);

  return (
    <div className="layout">
      <div className="topbar">
        <div className="topbar-logo">
          <div className="topbar-logo-icon">T</div>
          Leads Intelligence
        </div>
        <div className="topbar-meta">Ethiopia Construction · Pipeline v1.0</div>
      </div>

      <div className="content">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: "#888" }}>Run:</div>
          {runsLoading ? (
            <span style={{ color: "#555", fontSize: 13 }}>Loading runs...</span>
          ) : runs.length === 0 ? (
            <span style={{ color: "#555", fontSize: 13 }}>No runs found - start the pipeline first</span>
          ) : (
            <select className="ctrl-select" value={selectedRun} onChange={(e) => setSelectedRun(e.target.value)} style={{ minWidth: 280 }}>
              {runs.map((r) => (
                <option key={r.name} value={r.name}>{r.name} ({r.count} leads, {r.sizeKB}KB)</option>
              ))}
            </select>
          )}
          {currentRun && <span style={{ fontSize: 12, color: "#555" }}>{currentRun.count} total leads</span>}
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-label">Total Leads</div>
            <div className="card-value">{leads.length}</div>
            <div className="card-sub">in this run</div>
          </div>
          <div className="card">
            <div className="card-label">High Priority</div>
            <div className="card-value" style={{ color: "#f87171" }}>{high}</div>
            <div className="card-sub">need outreach now</div>
          </div>
          <div className="card">
            <div className="card-label">Medium Priority</div>
            <div className="card-value" style={{ color: "#f4a61d" }}>{medium}</div>
            <div className="card-sub">follow up</div>
          </div>
          <div className="card">
            <div className="card-label">Low Priority</div>
            <div className="card-value" style={{ color: "#888" }}>{low}</div>
            <div className="card-sub">already digital</div>
          </div>
          <div className="card">
            <div className="card-label">Has Website</div>
            <div className="card-value" style={{ color: "#4ade80" }}>{active}</div>
            <div className="card-sub">upgrade targets</div>
          </div>
          <div className="card">
            <div className="card-label">Total Runs</div>
            <div className="card-value">{runs.length}</div>
            <div className="card-sub">pipeline executions</div>
          </div>
        </div>

        <div className="controls">
          <span className="ctrl-label">Filter:</span>
          <input className="ctrl-input" placeholder="Search company or category..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="ctrl-select" value={fCity} onChange={(e) => setFCity(e.target.value)}>
            <option value="">All Cities</option>
            {cities.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="ctrl-select" value={fPriority} onChange={(e) => setFPriority(e.target.value)}>
            <option value="">All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select className="ctrl-select" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option>Active</option>
            <option>Broken</option>
            <option>None</option>
          </select>
          <select className="ctrl-select" value={fService} onChange={(e) => setFService(e.target.value)} style={{ minWidth: 180 }}>
            <option value="">All Services</option>
            {services.map((s) => <option key={String(s)}>{s}</option>)}
          </select>
          {(search || fCity || fPriority || fService || fStatus) && (
            <button className="ctrl-btn-ghost" onClick={clearFilters}>Clear</button>
          )}
          <div style={{ marginLeft: "auto" }}>
            <button className="ctrl-btn" onClick={() => exportCSV(filtered, "leads_" + selectedRun + "_filtered.csv")} disabled={filtered.length === 0}>
              Download CSV ({filtered.length})
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <div className="table-header-row">
            <div className="table-title">Leads</div>
            <div className="table-count">
              {filtered.length === leads.length ? leads.length + " total" : filtered.length + " of " + leads.length + " shown"}
            </div>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" /> Loading leads...</div>
          ) : paginated.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">search</div>
              <div className="empty-text">{leads.length === 0 ? "No leads in this run" : "No leads match your filters"}</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Company</th>
                  <th>Category</th>
                  <th>City</th>
                  <th>Score</th>
                  <th>Priority</th>
                  <th>Recommended Service</th>
                  <th>Website</th>
                  <th>Colors</th>
                  <th>Email</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((lead, i) => (
                  <tr key={i} onClick={() => setSelectedLead(lead)}>
                    <td style={{ color: "#555", fontSize: 12 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                        {lead.company_name}
                      </div>
                    </td>
                    <td style={{ color: "#888", fontSize: 12 }}>{lead.business_category || "-"}</td>
                    <td>{lead.city}</td>
                    <td><ScoreBar score={lead.lead_score} /></td>
                    <td><span className={priorityClass(lead.lead_priority)}>{lead.lead_priority ?? "-"}</span></td>
                    <td style={{ fontSize: 12, color: "#aaa" }}>{lead.recommended_service || "-"}</td>
                    <td><span className={statusClass(lead.website_status)}>{lead.website_status}</span></td>
                    <td><Swatches primary={lead.brand_primary_color} accent={lead.brand_accent_color} /></td>
                    <td style={{ fontSize: 12 }}>
                      {lead.email ? <span style={{ color: "#4ade80" }}>Yes</span> : <span style={{ color: "#555" }}>-</span>}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {lead.rating ? ("" + lead.rating) : <span style={{ color: "#555" }}>-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>prev</button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) pageNum = i + 1;
                else if (page <= 4) pageNum = i + 1;
                else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
                else pageNum = page - 3 + i;
                return (
                  <button key={pageNum} className={"page-btn" + (page === pageNum ? " active" : "")} onClick={() => setPage(pageNum)}>
                    {pageNum}
                  </button>
                );
              })}
              <button className="page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>next</button>
              <span className="page-info">Page {page} of {totalPages} · {filtered.length} leads</span>
            </div>
          )}
        </div>
      </div>

      {selectedLead && <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}
