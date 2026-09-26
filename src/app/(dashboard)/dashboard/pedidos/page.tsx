import { Package } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/dashboard/company";
import { OrdersTable } from "./orders-table";

export default async function PedidosPage() {
  const company = await getCurrentCompany();
  const supabase = createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `id, status, total, created_at,
       customers(full_name),
       payments(status, payment_method, change_for),
       order_items(id, product_name, unit_price, quantity),
       addresses(*)`
    )
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
          description="Pedidos feitos pelos clientes na sua loja pública vão aparecer aqui."
        />
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}