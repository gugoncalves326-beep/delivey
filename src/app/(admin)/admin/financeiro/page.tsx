import { Wallet, Percent, TrendingUp, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Financeiro" description="Faturamento e comissão da plataforma" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Faturamento total" value="—" icon={Wallet} accent />
        <StatCard label="Comissão acumulada" value="—" icon={Percent} accent />
        <StatCard label="Faturamento no mês" value="—" icon={TrendingUp} />
        <StatCard label="Pedidos concluídos" value="—" icon={CalendarDays} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução do faturamento</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={TrendingUp}
            title="Sem dados ainda"
            description="O gráfico de faturamento por período será implementado em uma etapa futura, junto com relatórios."
          />
        </CardContent>
      </Card>
    </div>
  );
}
