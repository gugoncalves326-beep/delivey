"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/dashboard/company";

export async function saveStoreSettings(formData: FormData) {
  const company = await getCurrentCompany();
  if (!company) throw new Error("Empresa não encontrada para o usuário logado.");

  const supabase = createClient();

  const is_open = formData.get("is_open") === "on";
  const min_order_value = Number(String(formData.get("min_order_value") ?? "0").replace(",", "."));
  const delivery_fee = Number(String(formData.get("delivery_fee") ?? "0").replace(",", "."));

  const { error } = await supabase
    .from("store_settings")
    .upsert(
      { company_id: company.id, is_open, min_order_value, delivery_fee },
      { onConflict: "company_id" }
    );

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard");
}
