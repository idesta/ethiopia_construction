import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
