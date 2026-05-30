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
  created_at: string;
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

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
