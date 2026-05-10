import { AdminShell } from "@/components/admin/AdminShell";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata = createNoIndexMetadata("Z.M.G Education Admin | Private Dashboard");

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
