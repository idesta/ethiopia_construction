"use client";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  accent?: string;
}

export function PrimaryButton({
  onClick,
  children,
  accent = "#d4af37",
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-primary"
      style={{ background: accent }}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  onClick,
  children,
  accent = "#d4af37",
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-outline"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {children}
    </button>
  );
}
