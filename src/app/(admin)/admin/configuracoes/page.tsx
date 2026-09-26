import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { CommissionForm } from "./commission-form";

/**
 * Configurações globais da plataforma (platform_settings).
 * Agora conectado ao Supabase: lê a linha atual e permite editar
 * o tipo (fixo/percentual) e o valor da comissão via Server Action.
 */
export default async function ConfiguracoesPage() {
  const supabase = createClient();

  const { data: settings } = await supabase
    .from("platform_settings")
    .select("id, commission_type, commission_value")
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Configurações globais da plataforma" />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Comissão da plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          {settings ? (
            <CommissionForm
              id={settings.id}
              commissionType={settings.commission_type as "fixed" | "percentage"}
              commissionValue={Number(settings.commission_value)}
            />
          ) : (
            <p className="text-sm text-text-secondary">
              Nenhuma configuração encontrada em{" "}
              <code className="text-text-primary">platform_settings</code>.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
