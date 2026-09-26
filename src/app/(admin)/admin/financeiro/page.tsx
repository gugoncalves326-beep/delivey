import { Wallet, Percent, TrendingUp, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/shared/revenue-chart";
import { createClient } from "@/lib/supabase/server";
import { buildMonthlyRevenue } from "@/lib/dashboard/revenue";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function FinanceiroPage() {
  const supabase = createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ data: orders }, { data: settings }] = await Promise.all([
    supabase.from("orders").select("total, status, created_at").eq("status", "completed"),
    supabase.from("platform_settings").select("commission_type, commission_value").limit(1).maybeSingle(),
  ]);

  const allOrders = orders ?? [];
  const faturamentoTotal = allOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pedidosDoMes = allOrders.filter((o) => new Date(o.created_at) >= startOfMonth);
  const faturamentoDoMes = pedidosDoMes.reduce((sum, o) => sum + Number(o.total), 0);
  const revenueData = buildMonthlyRevenue(allOrders, 6);

  const commissionType = settings?.commission_type ?? "fixed";
  const commissionValue = Number(settings?.commission_value ?? 0);

  // Comissão acumulada: percentual aplica sobre o total de cada pedido,
  // fixo aplica um valor único por pedido concluído.
  const comissaoAcumulada =
    commissionType === "percentage"
      ? allOrders.reduce((sum, o) => sum + (Number(o.total) * commissionValue) / 100, 0)
      : allOrders.length * commissionValue;

  return (
    <div className="space-y-6">
      <PageHeader title="Financeiro" description="Faturamento e comissão da plataforma" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Faturamento total" value={formatBRL(faturamentoTotal)} icon={Wallet} accent />
        <StatCard label="Comissão acumulada" value={formatBRL(comissaoAcumulada)} icon={Percent} accent />
        <StatCard label="Faturamento no mês" value={formatBRL(faturamentoDoMes)} icon={TrendingUp} />
        <StatCard label="Pedidos concluídos" value={String(allOrders.length)} icon={CalendarDays} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução do faturamento</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueData} />
        </CardContent>
      </Card>
    </div>
  );
}
