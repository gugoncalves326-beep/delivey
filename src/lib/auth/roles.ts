/**
 * Papéis de usuário da plataforma. Este é o único lugar onde os
 * papéis são definidos — usado tanto no frontend (para decidir o que
 * renderizar) quanto como referência do enum usado no banco.
 *
 * IMPORTANTE: isto é só para UX. A autorização de verdade está nas
 * políticas RLS do Supabase (ver supabase/schema.sql) e deve ser
 * revalidada no servidor em toda Server Action / Route Handler.
 */
export type UserRole = "adm_supremo" | "dono_da_loja" | "cliente";

export function roleHomePath(role: UserRole | null | undefined): string {
  switch (role) {
    case "adm_supremo":
      return "/admin";
    case "dono_da_loja":
      return "/dashboard";
    default:
      return "/login";
  }
}
