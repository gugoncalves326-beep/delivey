import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Protege /admin e /dashboard no nível de UX/roteamento.
 * IMPORTANTE: isto NÃO é a camada de segurança real — a separação
 * de dados entre empresas é garantida pelas políticas RLS no
 * Supabase (supabase/schema.sql). Este middleware só evita que um
 * usuário sem sessão, ou com o papel errado, veja a tela — nunca
 * confie nele sozinho para proteger dados.
 */
export async function middleware(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  const isDashboardRoute = path.startsWith("/dashboard");

  if (!isAdminRoute && !isDashboardRoute) {
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  if (isAdminRoute && role !== "adm_supremo") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isDashboardRoute && role !== "dono_da_loja") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
