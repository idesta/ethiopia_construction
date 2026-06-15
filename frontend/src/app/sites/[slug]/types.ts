export interface Contact {
  email: string;
  phone: string;
  address: string;
  city: string;
  maps_url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  status: string;
  completed_at: string;
  cover_url: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo_url: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface HeroScene {
  id: string;
  tenant_id: string;
  url: string;
  file_path: string;
  label: string | null;
  sort_order: number;
  created_at: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logo_url: string;
  primary_color: string;
  accent_color: string;
  founded_year: number;
  contacts: Contact[];
  projects: Project[];
  team: TeamMember[];
  services: Service[];
  hero_scenes: HeroScene[];
}
