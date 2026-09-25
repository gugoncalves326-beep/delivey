"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type Mode = "entrar" | "cadastrar";

/**
 * Tela de login única para ADM_SUPREMO e DONO_DA_LOJA (o CLIENTE final
 * fará login/checkout na loja pública numa etapa futura). Depois de
 * autenticar, redireciona para "/", que decide entre /admin e
 * /dashboard a partir do papel (profiles.role) lido no servidor.
 *
 * Toda autorização real continua nas políticas RLS — este formulário
 * só cria a sessão.
 */
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("entrar");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    if (mode === "entrar") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(traduzErro(signInError.message));
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
      return;
    }

    // Cadastro — cria o usuário em auth.users; o trigger handle_new_user()
    // já cria o profile correspondente com role "cliente" por padrão.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpError) {
      setError(traduzErro(signUpError.message));
      setLoading(false);
      return;
    }

    if (!data.session) {
      // Confirmação de e-mail habilitada no projeto Supabase.
      setNotice("Conta criada! Verifique seu e-mail para confirmar o acesso antes de entrar.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-panel-bg px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 pb-4">
          <div className="mb-2 h-9 w-9 rounded-md bg-gradient-to-br from-brand-purple to-brand-purple-secondary" />
          <CardTitle className="text-base text-text-primary">
            {mode === "entrar" ? "Entrar na plataforma" : "Criar conta"}
          </CardTitle>
          <p className="text-sm text-text-secondary">
            {mode === "entrar"
              ? "Acesse com seu e-mail e senha."
              : "Cadastre-se para acessar sua loja."}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex rounded-md border border-panel-border p-1">
            {(["entrar", "cadastrar"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setNotice(null);
                }}
                className={cn(
                  "flex-1 rounded-sm py-1.5 text-sm font-medium capitalize transition-colors",
                  mode === m
                    ? "bg-brand-purple text-white"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "cadastrar" && (
              <div className="space-y-1.5">
                <label htmlFor="full_name" className="text-xs text-text-secondary">
                  Nome completo
                </label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs text-text-secondary">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs text-text-secondary">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "entrar" ? "current-password" : "new-password"}
                minLength={6}
                required
              />
            </div>

            {error && <Alert variant="error">{error}</Alert>}
            {notice && <Alert variant="success">{notice}</Alert>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "entrar" ? "Entrar" : "Criar conta"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function traduzErro(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (message.includes("User already registered")) {
    return "Já existe uma conta com esse e-mail.";
  }
  if (message.includes("Password should be at least")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  return message;
}
