"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

interface OrderInfo {
  id: string;
  status: OrderStatus;
  created_at: string;
}

const statusLabels: Record<OrderStatus, string> = {
  pending: "Aguardando confirmação da loja",
  confirmed: "Pedido confirmado",
  preparing: "Em preparo",
  out_for_delivery: "Saiu para entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-700",
  confirmed: "bg-blue-500/10 text-blue-700",
  preparing: "bg-blue-500/10 text-blue-700",
  out_for_delivery: "bg-purple-500/10 text-purple-700",
  completed: "bg-green-500/10 text-green-700",
  cancelled: "bg-red-500/10 text-red-700",
};

const activeStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
];

export function OrderStatusBanner({
  initialOrder,
  customerId,
  slug,
}: {
  initialOrder: OrderInfo | null;
  customerId: string | null;
  slug: string;
}) {
  const [order, setOrder] = useState<OrderInfo | null>(initialOrder);

  useEffect(() => {
    if (!customerId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`customer-orders-${customerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          const updated = payload.new as OrderInfo;

          setOrder((current) => {
            const isSameOrder = current && updated.id === current.id;
            const isNewer =
              !current || new Date(updated.created_at) > new Date(current.created_at);

            if (isSameOrder) {
              return updated;
            }
            if (isNewer && activeStatuses.includes(updated.status)) {
              return updated;
            }
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId]);

  if (!order || !activeStatuses.includes(order.status)) {
    return null;
  }

  return (
    <Link
      href={`/loja/${slug}/pedido/${order.id}`}
      className="mx-4 mt-3 flex items-center justify-between rounded-xl border border-black/5 bg-store-card px-4 py-3"
    >
      <div>
        <p className="text-xs text-store-text-secondary">Seu pedido</p>
        <span
          className={`mt-0.5 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[order.status]}`}
        >
          {statusLabels[order.status]}
        </span>
      </div>
      <span className="text-xs font-medium text-store-accent">Ver pedido →</span>
    </Link>
  );
}