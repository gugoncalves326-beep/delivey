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