import "./admin.css";
import { ToastProvider } from "../../components/ui/ToastProvider";

export const metadata = {
  title: "Admin — Construction Platform",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
