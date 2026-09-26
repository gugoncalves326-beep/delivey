"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { registerAsaasSeller } from "./actions";

interface AsaasSellerFormProps {
  status: string | null;
  walletId: string | null;
}

export function AsaasSellerForm({ status, walletId }: AsaasSellerFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [document, setDocument] = useState("");
  const [pending, startTransition] = useTransition();

  const isCnpj = useMemo(() => document.replace(/\D/g, "").length > 11, [document]);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await registerAsaasSeller(formData);
        setSuccess(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível criar a conta no Asaas.");
      }
    });
  }

  // Já tem subconta criada: mostra status em vez do formulário.
  if (walletId) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Recebimento de pagamentos (Asaas)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Alert variant="success">Sua conta de recebimento já está conectada.</Alert>
          <p className="text-xs text-text-secondary">
            Status: <span className="text-text-primary">{status ?? "active"}</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Recebimento de pagamentos (Asaas)</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <p className="text-xs text-text-secondary">
            Preencha seus dados para receber automaticamente sua parte de cada pedido, com a
            comissão da plataforma já descontada.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Nome completo / Razão social</label>
            <Input name="name" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">E-mail</label>
            <Input name="email" type="email" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">CPF ou CNPJ</label>
            <Input
              name="cpfCnpj"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              placeholder="Somente números"
              required
            />
          </div>

          {isCnpj ? (
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Tipo de empresa</label>
              <select
                name="companyType"
                required
                className="w-full rounded-md border border-panel-border bg-transparent px-3 py-2 text-sm"
                defaultValue="MEI"
              >
                <option value="MEI">MEI</option>
                <option value="LIMITED">Limitada</option>
                <option value="INDIVIDUAL">Empresário Individual</option>
                <option value="ASSOCIATION">Associação</option>
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Data de nascimento</label>
              <Input name="birthDate" type="date" required />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Celular (com DDD)</label>
            <Input name="mobilePhone" placeholder="Somente números" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Telefone fixo (opcional)</label>
            <Input name="phone" placeholder="Somente números" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs text-text-secondary">Endereço</label>
              <Input name="address" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Número</label>
              <Input name="addressNumber" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Complemento (opcional)</label>
            <Input name="complement" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Bairro</label>
              <Input name="province" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">CEP</label>
              <Input name="postalCode" placeholder="Somente números" required />
            </div>
          </div>

          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">Conta criada com sucesso no Asaas!</Alert>}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar conta de recebimento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
