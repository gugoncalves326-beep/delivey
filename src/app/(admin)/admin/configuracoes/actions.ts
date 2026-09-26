"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updatePlatformSettings(formData: FormData) {
  const id = (formData.get("id") as string)?.trim();
  const commissionType = formData.get("commission_type") as string;
  const commissionValueRaw = (formData.get("commission_value") as string)?.trim();

  if (!id) {
    throw new Error("Configuração não encontrada.");
  }

  if (commissionType !== "fixed" && commissionType !== "percentage") {
    throw new Error("Selecione um tipo de comissão válido.");
  }

  if (!commissionValueRaw) {
    throw new Error("Informe o valor da comissão.");
  }

  const commissionValue = Number(commissionValueRaw.replace(",", "."));

  if (Number.isNaN(commissionValue) || commissionValue < 0) {
    throw new Error("Informe um valor de comissão válido.");
  }

  if (commissionType === "percentage" && commissionValue > 100) {
    throw new Error("A comissão percentual não pode ser maior que 100%.");
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("platform_settings")
    .update({
      commission_type: commissionType,
      commission_value: commissionValue,
    })
    .eq("id", id);

  if (error) {
    throw new Error("Erro ao salvar as configurações.");
  }

  revalidatePath("/admin/configuracoes");
}
