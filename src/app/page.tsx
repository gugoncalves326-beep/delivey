import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleHomePath } from "@/lib/auth/roles";

/**
 * Ponto de entrada: redireciona conforme o papel do usuário
 * autenticado. Sem sessão, manda para /login (a implementar numa
 * próxima etapa).
 */
export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  redirect(roleHomePath(profile?.role));
}
