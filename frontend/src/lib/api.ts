// ─────────────────────────────────────────
// API CLIENT
// All frontend → backend communication goes through here.
// Uses relative URLs so nginx routing handles domain/subdomain logic.
// ─────────────────────────────────────────

const BASE = "";

// ── Helpers ──────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include", // send httpOnly JWT cookie
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "API error");
  }

  return res.json();
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });
const put = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "PUT", body: JSON.stringify(body) });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

// ── Auth ─────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    post<{ user: { email: string } }>("/api/auth/login", { email, password }),

  logout: () => post("/api/auth/logout", {}),

  me: () => get<{ email: string }>("/api/auth/me"),
};

// ── Tenants ──────────────────────────────

export const tenants = {
  list: () => get<Tenant[]>("/api/tenants"),

  get: (id: string) => get<TenantFull>(`/api/tenants/${id}`),

  getBySlug: (slug: string) => get<TenantFull>(`/api/tenants/slug/${slug}`),

  create: (data: Partial<Tenant>) => post<Tenant>("/api/tenants", data),

  update: (id: string, data: Partial<Tenant>) =>
    put<Tenant>(`/api/tenants/${id}`, data),

  remove: (id: string) => del(`/api/tenants/${id}`),
};

// ── Contacts ─────────────────────────────

export const contacts = {
  get: (tenantId: string) => get<Contact>(`/api/contacts/${tenantId}`),

  upsert: (tenantId: string, data: Partial<Contact>) =>
    post<Contact>(`/api/contacts/${tenantId}`, data),
};

// ── Projects ─────────────────────────────

export const projects = {
  list: (tenantId: string) => get<Project[]>(`/api/projects/${tenantId}`),

  create: (tenantId: string, data: Partial<Project>) =>
    post<Project>(`/api/projects/${tenantId}`, data),

  update: (id: string, data: Partial<Project>) =>
    put<Project>(`/api/projects/${id}`, data),

  remove: (id: string) => del(`/api/projects/${id}`),
};

// ── Team ─────────────────────────────────

export const team = {
  list: (tenantId: string) => get<TeamMember[]>(`/api/team/${tenantId}`),

  create: (tenantId: string, data: Partial<TeamMember>) =>
    post<TeamMember>(`/api/team/${tenantId}`, data),

  update: (id: string, data: Partial<TeamMember>) =>
    put<TeamMember>(`/api/team/${id}`, data),

  remove: (id: string) => del(`/api/team/${id}`),
};

// ── Services ─────────────────────────────

export const services = {
  list: (tenantId: string) => get<Service[]>(`/api/services/${tenantId}`),

  create: (tenantId: string, data: Partial<Service>) =>
    post<Service>(`/api/services/${tenantId}`, data),

  update: (id: string, data: Partial<Service>) =>
    put<Service>(`/api/services/${id}`, data),

  remove: (id: string) => del(`/api/services/${id}`),
};

// ── File upload ───────────────────────────

export async function uploadFile(
  file: File,
  tenantSlug: string,
  folder: string, // 'logo' | 'projects' | 'team'
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("tenant", tenantSlug);
  formData.append("folder", folder);
  formData.append("file", file);

  const res = await fetch(`${BASE}/api/upload`, {
    method: "POST",
    credentials: "include",
    body: formData, // no Content-Type header — browser sets multipart boundary
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

// ── Hero Scenes ───────────────────────────

export const heroScenes = {
  list: (tenantId: string) => get<HeroScene[]>(`/api/hero-scenes/${tenantId}`),

  create: (tenantId: string, data: Partial<HeroScene>) =>
    post<HeroScene>(`/api/tenants/${tenantId}/hero-scenes`, data),

  remove: (id: string) => del(`/api/hero-scenes/${id}`),
};

// ── Types ─────────────────────────────────

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logo_url: string;
  primary_color: string;
  accent_color: string;
  founded_year: number;
  is_active: boolean;
  created_at: string;
}

export interface HeroScene {
  id: string;
  tenant_id: string;
  url: string;
  sort_order: number;
}

export interface TenantFull extends Tenant {
  contacts: Contact[];
  projects: Project[];
  team: TeamMember[];
  services: Service[];
  hero_scenes: HeroScene[];
}

export interface Contact {
  id: string;
  tenant_id: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  maps_url: string;
}

export interface Project {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  status: string;
  completed_at: string;
  cover_url: string;
  sort_order: number;
}

export interface TeamMember {
  id: string;
  tenant_id: string;
  name: string;
  role: string;
  photo_url: string;
  sort_order: number;
}

export interface Service {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
}
