import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const statusLabels: Record<string, string> = {
  pending: "Aguardando confirmação da loja",
  confirmed: "Confirmado",
  preparing: "Em preparo",
  out_for_delivery: "Saiu para entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export default async function PedidoPage({
  params,
}: {
  params: { slug: string; orderId: string };
}) {
  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, status, total, created_at, order_items(product_name, unit_price, quantity)"
    )
    .eq("id", params.orderId)
    .maybeSingle();

  // Se o pedido não existir OU não pertencer a este usuário, a RLS já
  // faz a query acima retornar null — não é preciso checagem extra.
  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-store-bg px-4 py-8 text-store-text">
      <div className="mx-auto max-w-sm">
        <p className="text-sm text-store-text-secondary">Pedido</p>
        <h1 className="text-lg font-semibold">#{order.id.slice(0, 8)}</h1>
        <span className="mt-1 inline-block rounded-full bg-store-accent/10 px-3 py-1 text-xs font-medium text-store-accent">
          {statusLabels[order.status] ?? order.status}
        </span>

        <div className="mt-4 space-y-2 rounded-xl border border-black/5 bg-store-card p-4">
          {order.order_items?.map(
            (
              item: { product_name: string; unit_price: number; quantity: number },
              idx: number
            ) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.product_name}
                </span>
                <span>{formatBRL(item.unit_price * item.quantity)}</span>
              </div>
            )
          )}
          <div className="mt-2 flex justify-between border-t border-black/10 pt-2 text-sm font-semibold">
            <span>Total</span>
            <span>{formatBRL(Number(order.total))}</span>
          </div>
        </div>

        <Link
          href={`/loja/${params.slug}`}
          className="mt-6 block text-center text-sm font-medium text-store-accent"
        >
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}