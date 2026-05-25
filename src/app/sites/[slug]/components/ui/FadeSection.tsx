"use client";

import { useInView } from "../../hooks/useInView";

interface FadeSectionProps {
  children: React.ReactNode;
  delay?: number; // stagger delay in ms, e.g. 100, 200
}

export function FadeSection({ children, delay = 0 }: FadeSectionProps) {
  const { ref, inView } = useInView(0.1);

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
