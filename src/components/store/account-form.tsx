"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "entrar" | "cadastrar";

function translateAuthError(message: string) {
  if (message.includes("Invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (message.includes("User already registered")) {
    return "Já existe uma conta com esse e-mail. Tente entrar.";
  }
  if (message.includes("Password should be at least")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  return message;
}

export function AccountForm({
  companyId,
  slug,
  redirectTo,
}: {
  companyId: string;
  slug: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("entrar");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const destino = redirectTo || `/loja/${slug}`;

  async function linkCustomerAndRedirect() {
    // Recupera nome/telefone dos metadados do usuário (preenchidos no
    // cadastro) para o caso de esta chamada vir da aba "Entrar", que
    // não coleta esses campos novamente.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const metaFullName = (user?.user_metadata?.full_name as string) || null;
    const metaPhone = (user?.user_metadata?.phone as string) || null;

    // Vincula (ou atualiza) o registro de customers desta empresa ao
    // usuário autenticado. Nunca confia em company_id vindo pronto —
    // a função no banco usa auth.uid() internamente.
    const { error: rpcError } = await supabase.rpc("get_or_create_customer", {
      p_company_id: companyId,
      p_full_name: fullName || metaFullName,
      p_phone: phone || metaPhone,
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    router.push(destino);
    router.refresh();
  }

  async function handleEntrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(translateAuthError(signInError.message));
      setLoading(false);
      return;
    }

    await linkCustomerAndRedirect();
  }

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });

    if (signUpError) {
      setError(translateAuthError(signUpError.message));
      setLoading(false);
      return;
    }

    if (!data.session) {
      // Confirmação de e-mail está ativa no projeto: ainda não há
      // sessão, então não dá pra chamar a RPC agora.
      setAwaitingConfirmation(true);
      setLoading(false);
      return;
    }

    await linkCustomerAndRedirect();
  }

  if (awaitingConfirmation) {
    return (
      <div className="mx-auto max-w-sm px-4 text-center">
        <div className="rounded-xl border border-black/5 bg-store-card p-6">
          <p className="text-sm font-medium">Confirme seu e-mail</p>
          <p className="mt-2 text-sm text-store-text-secondary">
            Enviamos um link de confirmação para <strong>{email}</strong>.
            Depois de confirmar, volte aqui e entre normalmente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4">
      <div className="mb-4 flex rounded-full bg-store-card p-1">
        <button
          type="button"
          onClick={() => setMode("entrar")}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
            mode === "entrar" ? "bg-store-accent text-white" : "text-store-text-secondary"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("cadastrar")}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
            mode === "cadastrar" ? "bg-store-accent text-white" : "text-store-text-secondary"
          }`}
        >
          Cadastrar
        </button>
      </div>

      <form
        onSubmit={mode === "entrar" ? handleEntrar : handleCadastrar}
        className="space-y-3 rounded-xl border border-black/5 bg-store-card p-4"
      >
        {mode === "cadastrar" && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-store-text-secondary">
                Nome completo
              </label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-store-bg px-3 py-2 text-sm outline-none focus:border-store-accent"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-store-text-secondary">
                Telefone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-store-bg px-3 py-2 text-sm outline-none focus:border-store-accent"
                placeholder="(00) 00000-0000"
              />
            </div>
          </>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-store-text-secondary">
            E-mail
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-store-bg px-3 py-2 text-sm outline-none focus:border-store-accent"
            placeholder="voce@email.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-store-text-secondary">
            Senha
          </label>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-store-bg px-3 py-2 text-sm outline-none focus:border-store-accent"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-store-accent py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading
            ? "Aguarde..."
            : mode === "entrar"
              ? "Entrar"
              : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
