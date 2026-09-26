"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/table";
import { updateOrderStatus, markPaymentPaid } from "./actions";
import type { Enums } from "@/types/database";

type OrderStatus = Enums<"order_status">;
type PaymentMethod = Enums<"payment_method">;
type PaymentStatus = Enums<"payment_status">;

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

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [pending, startTransition] = useTransition();

  function handleStatusChange(orderId: string, status: OrderStatus) {
    startTransition(async () => {
      await updateOrderStatus(orderId, status);
    });
  }

  function handleMarkPaid(orderId: string) {
    startTransition(async () => {
      await markPaymentPaid(orderId);
    });
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
        </Tr>
      </Thead>
      <tbody>
        {orders.map((order) => {
          const payment = order.payments?.[0] ?? null;

          return (
            <Tr key={order.id}>
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
            </Tr>
          );
        })}
      </tbody>
    </Table>
  );
}