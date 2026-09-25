import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/dashboard/company";
import { DashboardShell } from "@/components/dashboard/shell";

/**
 * A checagem de papel já acontece no middleware. Aqui buscamos a
 * empresa vinculada ao dono logado (via RLS/company_users) para
 * exibir nome e status reais na sidebar. Se por algum motivo o
 * usuário não tiver empresa vinculada, manda de volta pro login em
 * vez de deixar o painel num estado inconsistente.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const company = await getCurrentCompany();

  if (!company) {
    redirect("/login");
  }

  const supabase = createClient();
  const { data: settings } = await supabase
    .from("store_settings")
    .select("is_open")
    .eq("company_id", company.id)
    .maybeSingle();

  return (
    <DashboardShell storeName={company.name} isOpen={settings?.is_open ?? true}>
      {children}
    </DashboardShell>
  );
}
