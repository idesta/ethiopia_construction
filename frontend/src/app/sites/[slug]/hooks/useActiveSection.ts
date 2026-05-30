import { useState, useEffect } from "react";

const SECTIONS = ["home", "services", "projects", "team", "contact"];

export function useActiveSection() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      for (const id of [...SECTIONS].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActive(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return active;
}
