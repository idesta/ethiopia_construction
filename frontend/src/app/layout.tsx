import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ethiopia Construction Platform",
  description: "Multi-tenant construction company platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
