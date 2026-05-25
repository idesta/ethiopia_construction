"use client";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  accent?: string;
}

export function PrimaryButton({
  onClick,
  children,
  accent = "#f4a61d",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="btn-primary"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  onClick,
  children,
  accent = "#f4a61d",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="btn-outline"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {children}
    </button>
  );
}
