import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/dashboard/company";
import { SettingsForm } from "./settings-form";

export default async function ConfiguracoesPage() {
  const company = await getCurrentCompany();
  const supabase = createClient();

  const { data: settings } = await supabase
    .from("store_settings")
    .select("*")
    .eq("company_id", company!.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Configurações da sua loja" />
      <SettingsForm settings={settings} />
    </div>
  );
}
