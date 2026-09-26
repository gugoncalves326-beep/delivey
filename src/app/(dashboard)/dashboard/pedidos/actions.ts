"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

type OrderStatus = Enums<"order_status">;

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = createClient();

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

  if (error) {
    throw new Error("Erro ao atualizar o status do pedido.");
  }

  revalidatePath("/dashboard/pedidos");
}

export async function markPaymentPaid(orderId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("payments")
    .update({ status: "paid" })
    .eq("order_id", orderId);

  if (error) {
    throw new Error("Erro ao marcar o pagamento como pago.");
  }

  revalidatePath("/dashboard/pedidos");
}