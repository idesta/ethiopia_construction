"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./ui/ToastProvider";

interface SidebarProps {
  userEmail?: string;
}

const NAV = [
  {
    label: "Main",
    items: [{ href: "/admin/dashboard", icon: "🏠", text: "Dashboard" }],
  },
  {
    label: "Companies",
    items: [{ href: "/admin/companies", icon: "🏢", text: "All Companies" }],
  },
];

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    showToast("Signed out", "info");
    router.push("/admin");
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏗️</div>
        <div>
          <div className="sidebar-logo-text">Construction</div>
          <div className="sidebar-logo-sub">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      {NAV.map((section) => (
        <div className="sidebar-section" key={section.label}>
          <div className="sidebar-section-label">{section.label}</div>
          {section.items.map((item) => (
            <button
              key={item.href}
              className={`sidebar-link${isActive(item.href) ? " active" : ""}`}
              onClick={() => router.push(item.href)}
            >
              <span>{item.icon}</span>
              {item.text}
            </button>
          ))}
        </div>
      ))}

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {userEmail?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userEmail || "Admin"}</div>
            <div className="sidebar-user-role">Super Admin</div>
          </div>
        </div>
        <button className="signout-btn" onClick={handleSignOut}>
          Sign out →
        </button>
      </div>
    </aside>
  );
}
