import { Package } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/dashboard/company";
import type { Enums } from "@/types/database";

type OrderStatus = Enums<"order_status">;

const statusLabel: Record<OrderStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  out_for_delivery: "Saiu para entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusVariant: Record<OrderStatus, "success" | "error" | "warning" | "neutral"> = {
  pending: "warning",
  confirmed: "neutral",
  preparing: "neutral",
  out_for_delivery: "neutral",
  completed: "success",
  cancelled: "error",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PedidosPage() {
  const company = await getCurrentCompany();
  const supabase = createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, customers(full_name)")
    .eq("company_id", company!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <PageHeader title="Pedidos" description="Pedidos recebidos pela sua loja" />

      {!orders || orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum pedido ainda"
          description="Pedidos feitos pelos clientes na sua loja pública vão aparecer aqui — o checkout é uma etapa futura."
        />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Cliente</Th>
              <Th>Status</Th>
              <Th>Total</Th>
              <Th>Data</Th>
            </Tr>
          </Thead>
          <tbody>
            {orders.map((order) => (
              <Tr key={order.id}>
                <Td>
                  {(order as unknown as { customers: { full_name: string | null } | null })
                    .customers?.full_name ?? "Cliente"}
                </Td>
                <Td>
                  <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
                </Td>
                <Td>{formatBRL(Number(order.total))}</Td>
                <Td>{new Date(order.created_at).toLocaleDateString("pt-BR")}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
