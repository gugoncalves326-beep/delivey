"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/dashboard/company";

export async function saveCategory(formData: FormData) {
  const company = await getCurrentCompany();
  if (!company) throw new Error("Empresa não encontrada para o usuário logado.");

  const supabase = createClient();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) throw new Error("O nome da categoria é obrigatório.");

  if (id) {
    const { error } = await supabase.from("categories").update({ name }).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("categories").insert({ company_id: company.id, name });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/dashboard/categorias");
  revalidatePath("/dashboard/produtos");
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createClient();
  // products.category_id tem "on delete set null", então excluir uma
  // categoria não apaga produtos — só desvincula.
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/categorias");
  revalidatePath("/dashboard/produtos");
}
