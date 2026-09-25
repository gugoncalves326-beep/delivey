import { Package, ShoppingCart, Clock, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/dashboard/company";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Números reais, calculados a partir de `orders` da empresa do dono
 * logado (RLS garante que só vem pedido da própria empresa). Como o
 * fluxo de checkout ainda não existe, os totais tendem a ser zero —
 * é esperado, a query já está correta para quando pedidos passarem
 * a ser criados.
 */
export default async function DashboardPage() {
  const company = await getCurrentCompany();
  const supabase = createClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: pedidosHoje } = await supabase
    .from("orders")
    .select("total, status")
    .eq("company_id", company!.id)
    .gte("created_at", startOfDay.toISOString());

  const vendasHoje = (pedidosHoje ?? []).reduce((sum, o) => sum + Number(o.total), 0);
  const aguardando = (pedidosHoje ?? []).filter((o) =>
    ["pending", "confirmed", "preparing", "out_for_delivery"].includes(o.status)
  ).length;
  const concluidos = (pedidosHoje ?? []).filter((o) => o.status === "completed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Olá 👋</h1>
        <p className="text-sm text-text-secondary">Resumo da {company?.name ?? "sua loja"} hoje</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pedidos de hoje" value={String(pedidosHoje?.length ?? 0)} icon={Package} />
        <StatCard label="Vendas de hoje" value={formatBRL(vendasHoje)} icon={ShoppingCart} accent />
        <StatCard label="Aguardando atendimento" value={String(aguardando)} icon={Clock} />
        <StatCard label="Concluídos" value={String(concluidos)} icon={CheckCircle2} />
      </div>
    </div>
  );
}
