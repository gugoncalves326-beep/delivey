"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/dashboard/company";

/**
 * Cria ou atualiza um produto (id vazio = criar). company_id nunca
 * vem do formulário — é sempre resolvido no servidor a partir da
 * sessão, e a RLS de products garante que o dono só mexe na própria
 * empresa mesmo que tente forçar outro company_id.
 */
export async function saveProduct(formData: FormData) {
  const company = await getCurrentCompany();
  if (!company) throw new Error("Empresa não encontrada para o usuário logado.");

  const supabase = createClient();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const priceRaw = String(formData.get("price") ?? "0").replace(",", ".");
  const price = Number(priceRaw) || 0;
  const category_id = String(formData.get("category_id") ?? "").trim() || null;
  const is_available = formData.get("is_available") === "on";
  const image_url = String(formData.get("image_url") ?? "").trim() || null;

  if (!name) throw new Error("O nome do produto é obrigatório.");

  if (id) {
    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price,
        category_id,
        is_available,
        ...(image_url ? { image_url } : {}),
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("products").insert({
      company_id: company.id,
      name,
      description,
      price,
      category_id,
      is_available,
      image_url,
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/dashboard/produtos");
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/produtos");
}

export async function toggleProductAvailability(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";
  if (!id) return;
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_available: next })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/produtos");
}