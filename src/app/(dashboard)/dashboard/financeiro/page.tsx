import { Wallet, TrendingUp, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/dashboard/company";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function FinanceiroPage() {
  const company = await getCurrentCompany();
  const supabase = createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: orders } = await supabase
    .from("orders")
    .select("total, status, created_at")
    .eq("company_id", company!.id)
    .eq("status", "completed");

  const faturamentoTotal = (orders ?? []).reduce((sum, o) => sum + Number(o.total), 0);
  const pedidosDoMes = (orders ?? []).filter((o) => new Date(o.created_at) >= startOfMonth);
  const faturamentoDoMes = pedidosDoMes.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Financeiro" description="Faturamento da sua loja" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Faturamento total" value={formatBRL(faturamentoTotal)} icon={Wallet} accent />
        <StatCard label="Faturamento no mês" value={formatBRL(faturamentoDoMes)} icon={TrendingUp} />
        <StatCard label="Pedidos concluídos" value={String((orders ?? []).length)} icon={CalendarDays} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução do faturamento</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={TrendingUp}
            title="Sem dados suficientes ainda"
            description="O gráfico por período aparece aqui assim que houver pedidos concluídos — uma etapa futura."
          />
        </CardContent>
      </Card>
    </div>
  );
}