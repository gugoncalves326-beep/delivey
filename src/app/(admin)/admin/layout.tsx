import { AdminShell } from "@/components/admin/shell";

/**
 * A checagem de papel acontece no middleware (src/middleware.ts).
 * Este layout só monta o shell visual — sidebar fixa no desktop,
 * drawer no mobile (ver AdminShell).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
