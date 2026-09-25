import { Package } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Listagem de pedidos de todas as empresas (visão ADM_SUPREMO).
 * A query real (orders + join em companies/customers, respeitando
 * RLS) e os filtros por empresa/status ficam para uma etapa futura,
 * junto com checkout/pagamento.
 */
export default function AdminPedidosPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Pedidos" description="Pedidos de todas as empresas da plataforma" />

      <Card>
        <CardContent className="pt-5">
          <EmptyState
            icon={Package}
            title="Nenhum pedido ainda"
            description="Quando o fluxo de pedidos for implementado, eles vão aparecer aqui, de todas as empresas."
          />
        </CardContent>
      </Card>
    </div>
  );
}
