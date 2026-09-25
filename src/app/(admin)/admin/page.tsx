import { Building2, PauseCircle, Package, CalendarDays, Wallet, Percent } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { CompanyDialog } from "./empresas/company-dialog";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ data: companies }, { data: orders }] = await Promise.all([
    supabase.from("companies").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("company_id, total, commission_amount, status, created_at"),
  ]);

  const { count: empresasAtivas } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");
  const { count: empresasSuspensas } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true })
    .eq("status", "suspended");

  const completedOrders = (orders ?? []).filter((o) => o.status === "completed");
  const pedidosHoje = completedOrders.filter((o) => new Date(o.created_at) >= startOfDay);
  const pedidosNoMes = completedOrders.filter((o) => new Date(o.created_at) >= startOfMonth);
  const faturamentoTotal = completedOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const comissaoTotal = completedOrders.reduce((sum, o) => sum + Number(o.commission_amount), 0);

  const statsByCompany = new Map<string, { pedidos: number; faturamento: number }>();
  for (const order of completedOrders) {
    const current = statsByCompany.get(order.company_id) ?? { pedidos: 0, faturamento: 0 };
    current.pedidos += 1;
    current.faturamento += Number(order.total);
    statsByCompany.set(order.company_id, current);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Olá, ADM SUPREMO</h1>
        <p className="text-sm text-text-secondary">Visão geral da plataforma</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Empresas ativas" value={String(empresasAtivas ?? 0)} icon={Building2} />
        <StatCard label="Empresas suspensas" value={String(empresasSuspensas ?? 0)} icon={PauseCircle} />
        <StatCard label="Pedidos hoje" value={String(pedidosHoje.length)} icon={Package} />
        <StatCard label="Pedidos no mês" value={String(pedidosNoMes.length)} icon={CalendarDays} />
        <StatCard label="Faturamento" value={formatBRL(faturamentoTotal)} icon={Wallet} accent />
        <StatCard
          label="Comissão da plataforma"
          value={formatBRL(comissaoTotal)}
          icon={Percent}
          accent
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empresas recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!companies || companies.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Nenhuma empresa cadastrada"
              description="Cadastre a primeira empresa na página Empresas."
            />
          ) : (
            companies.map((company) => {
              const stats = statsByCompany.get(company.id) ?? { pedidos: 0, faturamento: 0 };
              return (
                <div
                  key={company.id}
                  className="flex flex-col gap-3 rounded-md border border-panel-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-panel-bg-secondary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{company.name}</p>
                      <p className="text-xs text-text-secondary">
                        {stats.pedidos} pedidos · {formatBRL(stats.faturamento)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={company.status === "active" ? "success" : "error"}>
                      {company.status === "active" ? "Ativa" : "Suspensa"}
                    </Badge>
                    <CompanyDialog company={company} />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gráficos</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CalendarDays}
            title="Sem dados ainda"
            description="Os gráficos de faturamento e pedidos serão implementados em uma etapa futura."
          />
        </CardContent>
      </Card>
    </div>
  );
}
