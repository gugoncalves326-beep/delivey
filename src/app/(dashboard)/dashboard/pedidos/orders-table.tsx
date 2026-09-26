"use client";

import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/table";
import { updateOrderStatus, markPaymentPaid } from "./actions";
import { createClient } from "@/lib/supabase/client";
import type { Enums } from "@/types/database";

type OrderStatus = Enums<"order_status">;
type PaymentMethod = Enums<"payment_method">;
type PaymentStatus = Enums<"payment_status">;

interface OrderItemRow {
  id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
}

interface OrderRow {
  id: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  customers: { full_name: string | null } | null;
  payments: Array<{
    status: PaymentStatus;
    payment_method: PaymentMethod | null;
    change_for: number | null;
  }> | null;
  order_items: OrderItemRow[] | null;
  addresses: Record<string, any> | null;
}

const statusLabel: Record<OrderStatus, string> = {
  pending: "Aguardando confirmação",
  confirmed: "Confirmado",
  preparing: "Preparando",
  out_for_delivery: "Saiu para entrega",
  completed: "Concluído",
  cancelled: "Recusado / Cancelado",
};

const statusVariant: Record<OrderStatus, "success" | "error" | "warning" | "neutral"> = {
  pending: "warning",
  confirmed: "neutral",
  preparing: "neutral",
  out_for_delivery: "neutral",
  completed: "success",
  cancelled: "error",
};

const paymentMethodLabel: Record<PaymentMethod, string> = {
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  pix: "Pix",
};

const nextStatusOptions: OrderStatus[] = [
  "confirmed",
  "preparing",
  "out_for_delivery",
  "completed",
  "cancelled",
];

const orderSelectQuery = `id, status, total, created_at,
  customers(full_name),
  payments(status, payment_method, change_for),
  order_items(id, product_name, unit_price, quantity),
  addresses(*)`;

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pick(address: Record<string, any> | null, keys: string[]): string {
  if (!address) return "";
  for (const key of keys) {
    if (address[key]) return String(address[key]);
  }
  return "";
}

function formatAddress(address: Record<string, any> | null): string {
  if (!address) return "Endereço não informado";

  const street = pick(address, ["street", "logradouro", "rua"]);
  const number = pick(address, ["number", "numero"]);
  const complement = pick(address, ["complement", "complemento"]);
  const neighborhood = pick(address, ["neighborhood", "bairro"]);
  const city = pick(address, ["city", "cidade"]);
  const state = pick(address, ["state", "estado", "uf"]);
  const zip = pick(address, ["zip_code", "cep", "postal_code"]);
  const reference = pick(address, ["reference", "referencia", "reference_point", "ponto_de_referencia"]);

  const line1 = [street, number].filter(Boolean).join(", ");
  const line2 = [complement, neighborhood].filter(Boolean).join(" - ");
  const line3 = [city, state].filter(Boolean).join(" - ");

  const parts = [line1, line2, line3, zip].filter(Boolean);
  const base = parts.length > 0 ? parts.join(" | ") : "Endereço não informado";

  return reference ? `${base} (Ref: ${reference})` : base;
}

export function OrdersTable({
  orders: initialOrders,
  companyId,
}: {
  orders: OrderRow[];
  companyId: string;
}) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`store-orders-${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `company_id=eq.${companyId}`,
        },
        async (payload) => {
          const newId = (payload.new as { id: string }).id;

          const { data: fullOrder } = await supabase
            .from("orders")
            .select(orderSelectQuery)
            .eq("id", newId)
            .maybeSingle();

          if (fullOrder) {
            setOrders((current) => [fullOrder as unknown as OrderRow, ...current]);
            setNewOrderIds((current) => new Set(current).add(newId));
            setTimeout(() => {
              setNewOrderIds((current) => {
                const next = new Set(current);
                next.delete(newId);
                return next;
              });
            }, 5000);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          const updated = payload.new as { id: string; status: OrderStatus; total: number };

          setOrders((current) =>
            current.map((order) =>
              order.id === updated.id
                ? { ...order, status: updated.status, total: updated.total }
                : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId]);

  function handleStatusChange(orderId: string, status: OrderStatus) {
    startTransition(async () => {
      await updateOrderStatus(orderId, status);
    });
  }

  function handleMarkPaid(orderId: string) {
    startTransition(async () => {
      await markPaymentPaid(orderId);
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId && order.payments?.[0]
            ? {
                ...order,
                payments: [{ ...order.payments[0], status: "paid" as PaymentStatus }],
              }
            : order
        )
      );
    });
  }

  function toggleExpanded(orderId: string) {
    setExpandedId((current) => (current === orderId ? null : orderId));
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Cliente</Th>
          <Th>Status</Th>
          <Th>Pagamento</Th>
          <Th>Total</Th>
          <Th>Data</Th>
          <Th></Th>
        </Tr>
      </Thead>
      <tbody>
        {orders.map((order) => {
          const payment = order.payments?.[0] ?? null;
          const isExpanded = expandedId === order.id;
          const isNew = newOrderIds.has(order.id);

          return (
            <>
              <Tr
                key={order.id}
                className={isNew ? "animate-pulse bg-brand-purple-secondary/10" : undefined}
              >
                <Td>{order.customers?.full_name ?? "Cliente"}</Td>
                <Td>
                  {order.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusChange(order.id, "confirmed")}
                        disabled={pending}
                        className="rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, "cancelled")}
                        disabled={pending}
                        className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                      >
                        Recusar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant[order.status]}>
                        {statusLabel[order.status]}
                      </Badge>
                      <Select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        disabled={pending}
                        className="w-auto text-xs"
                      >
                        {nextStatusOptions.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel[s]}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}
                </Td>
                <Td>
                  {payment ? (
                    <div className="space-y-1">
                      <span className="text-sm">
                        {payment.payment_method
                          ? paymentMethodLabel[payment.payment_method]
                          : "—"}
                      </span>
                      {payment.payment_method === "dinheiro" && payment.change_for && (
                        <p className="text-xs text-text-secondary">
                          Troco para {formatBRL(Number(payment.change_for))}
                        </p>
                      )}
                      <div>
                        {payment.status === "paid" ? (
                          <Badge variant="success">Pago</Badge>
                        ) : (
                          <button
                            onClick={() => handleMarkPaid(order.id)}
                            disabled={pending}
                            className="text-xs font-medium text-brand-purple-secondary hover:underline disabled:opacity-60"
                          >
                            Marcar como pago
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-text-secondary">—</span>
                  )}
                </Td>
                <Td>{formatBRL(Number(order.total))}</Td>
                <Td>{new Date(order.created_at).toLocaleDateString("pt-BR")}</Td>
                <Td>
                  <button
                    onClick={() => toggleExpanded(order.id)}
                    className="text-xs font-medium text-brand-purple-secondary hover:underline"
                  >
                    {isExpanded ? "Ocultar" : "Ver detalhes"}
                  </button>
                </Td>
              </Tr>
              {isExpanded && (
                <Tr key={`${order.id}-details`}>
                  <Td colSpan={6}>
                    <div className="space-y-3 rounded-lg bg-black/20 p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-secondary">
                          Endereço de entrega
                        </p>
                        <p className="text-sm">{formatAddress(order.addresses)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-secondary">
                          Itens do pedido
                        </p>
                        {order.order_items && order.order_items.length > 0 ? (
                          <ul className="mt-1 space-y-1 text-sm">
                            {order.order_items.map((item) => (
                              <li key={item.id} className="flex justify-between">
                                <span>
                                  {item.quantity}x {item.product_name}
                                </span>
                                <span>
                                  {formatBRL(Number(item.unit_price) * item.quantity)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-text-secondary">
                            Nenhum item encontrado.
                          </p>
                        )}
                      </div>
                    </div>
                  </Td>
                </Tr>
              )}
            </>
          );
        })}
      </tbody>
    </Table>
  );
}