"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/dashboard/company";
import { createAsaasSubaccount } from "@/lib/asaas/client";

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

export async function registerAsaasSeller(formData: FormData) {
  const company = await getCurrentCompany();
  if (!company) throw new Error("Empresa não encontrada para o usuário logado.");

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const cpfCnpj = ((formData.get("cpfCnpj") as string) ?? "").replace(/\D/g, "");
  const companyType = formData.get("companyType") as
    | "MEI"
    | "LIMITED"
    | "INDIVIDUAL"
    | "ASSOCIATION"
    | null;
  const birthDate = (formData.get("birthDate") as string)?.trim();
  const mobilePhone = ((formData.get("mobilePhone") as string) ?? "").replace(/\D/g, "");
  const phone = ((formData.get("phone") as string) ?? "").replace(/\D/g, "");
  const address = (formData.get("address") as string)?.trim();
  const addressNumber = (formData.get("addressNumber") as string)?.trim();
  const complement = (formData.get("complement") as string)?.trim();
  const province = (formData.get("province") as string)?.trim();
  const postalCode = ((formData.get("postalCode") as string) ?? "").replace(/\D/g, "");

  if (!name || !email || !cpfCnpj || !mobilePhone || !address || !addressNumber || !province || !postalCode) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  const isCnpj = cpfCnpj.length > 11;

  if (isCnpj && !companyType) {
    throw new Error("Selecione o tipo de empresa.");
  }
  if (!isCnpj && !birthDate) {
    throw new Error("Informe a data de nascimento.");
  }

  let account;
  try {
    account = await createAsaasSubaccount({
      name,
      email,
      cpfCnpj,
      companyType: isCnpj ? companyType! : undefined,
      birthDate: isCnpj ? undefined : birthDate,
      phone: phone || undefined,
      mobilePhone,
      address,
      addressNumber,
      complement: complement || undefined,
      province,
      postalCode,
    });
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Erro ao criar a conta no Asaas.");
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("companies")
    .update({
      asaas_account_id: account.id,
      asaas_wallet_id: account.walletId,
      asaas_onboarding_status: "active",
    })
    .eq("id", company.id);

  if (error) {
    throw new Error(
      "A conta foi criada no Asaas, mas houve um erro ao salvar no banco. Contate o suporte antes de tentar de novo."
    );
  }

  revalidatePath("/dashboard/configuracoes");
}
