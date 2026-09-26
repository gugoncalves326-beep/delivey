"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function linkOwnerToCompany(formData: FormData) {
  const companyId = formData.get("companyId") as string;
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!companyId || !email) {
    throw new Error("Preencha o e-mail do usuário.");
  }

  const supabase = createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    throw new Error("Erro ao buscar usuário.");
  }
  if (!profile) {
    throw new Error(
      "Nenhum usuário encontrado com esse e-mail. A pessoa precisa se cadastrar em /login primeiro."
    );
  }

  const { error: linkError } = await supabase
    .from("company_users")
    .insert({ company_id: companyId, profile_id: profile.id });

  if (linkError) {
    if (linkError.code === "23505") {
      throw new Error("Esse usuário já está vinculado a essa empresa.");
    }
    throw new Error("Erro ao vincular usuário à empresa.");
  }

  if (profile.role !== "dono_da_loja") {
    const { error: roleError } = await supabase
      .from("profiles")
      .update({ role: "dono_da_loja" })
      .eq("id", profile.id);

    if (roleError) {
      throw new Error("Vínculo criado, mas houve erro ao atualizar o papel do usuário.");
    }
  }

  revalidatePath("/admin/empresas");
}
export async function saveCompany(formData: FormData) {
  const id = (formData.get("id") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const status = formData.get("status") as "active" | "suspended" | null;

  if (!name || !slug) {
    throw new Error("Preencha o nome e o identificador (slug) da empresa.");
  }

  const supabase = createClient();

  if (id) {
    // Edição de empresa existente
    const { error } = await supabase
      .from("companies")
      .update({
        name,
        slug,
        ...(status ? { status } : {}),
      })
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        throw new Error("Já existe uma empresa com esse identificador (slug).");
      }
      throw new Error("Erro ao atualizar a empresa.");
    }
  } else {
    // Criação de empresa nova
    const { error } = await supabase.from("companies").insert({ name, slug });

    if (error) {
      if (error.code === "23505") {
        throw new Error("Já existe uma empresa com esse identificador (slug).");
      }
      throw new Error("Erro ao criar a empresa.");
    }
  }

  revalidatePath("/admin/empresas");
}