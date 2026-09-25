import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Company = Database["public"]["Tables"]["companies"]["Row"];

/**
 * Resolve a empresa do DONO_DA_LOJA autenticado, a partir do usuário
 * da sessão (nunca de um company_id vindo do cliente). Usado em toda
 * página/Server Action do painel do dono — a RLS de qualquer forma
 * garante o isolamento, mas resolver a empresa aqui evita espalhar
 * essa lógica pelas páginas.
 */
export async function getCurrentCompany(): Promise<Company | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("company_users")
    .select("companies(*)")
    .eq("profile_id", user.id)
    .maybeSingle();

  const companies = data?.companies as unknown as Company | Company[] | null;
  if (!companies) return null;
  return Array.isArray(companies) ? companies[0] ?? null : companies;
}
