import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Configurações globais da plataforma (platform_settings).
 * Valores exibidos são os padrões definidos no schema.sql
 * (comissão fixa de R$ 1,00). A leitura/gravação real via Supabase
 * e a troca de tipo de comissão (fixo/percentual) ficam para uma
 * etapa futura.
 */
export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Configurações globais da plataforma" />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Comissão da plataforma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="commission_value" className="text-xs text-text-secondary">
              Valor por pedido concluído (R$)
            </label>
            <Input id="commission_value" defaultValue="1,00" disabled />
          </div>
          <p className="text-xs text-text-secondary">
            Atualmente fixa, definida em <code className="text-text-primary">platform_settings</code>.
            A edição por aqui será conectada numa etapa futura.
          </p>
          <Button disabled className="w-full">
            Salvar alterações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
