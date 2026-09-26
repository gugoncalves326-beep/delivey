"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePlatformSettings } from "./actions";

type CommissionType = "fixed" | "percentage";

interface CommissionFormProps {
  id: string;
  commissionType: CommissionType;
  commissionValue: number;
}

export function CommissionForm({ id, commissionType, commissionValue }: CommissionFormProps) {
  const [type, setType] = useState<CommissionType>(commissionType);
  const [value, setValue] = useState(String(commissionValue).replace(".", ","));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await updatePlatformSettings(formData);
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar as configurações.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="commission_type" value={type} />

      <div className="space-y-1.5">
        <label className="text-xs text-text-secondary">Tipo de comissão</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("fixed")}
            className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
              type === "fixed"
                ? "border-store-accent bg-store-accent/5 font-medium"
                : "border-black/10 text-text-secondary"
            }`}
          >
            Valor fixo (R$)
          </button>
          <button
            type="button"
            onClick={() => setType("percentage")}
            className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
              type === "percentage"
                ? "border-store-accent bg-store-accent/5 font-medium"
                : "border-black/10 text-text-secondary"
            }`}
          >
            Percentual (%)
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="commission_value" className="text-xs text-text-secondary">
          {type === "fixed" ? "Valor por pedido concluído (R$)" : "Percentual sobre cada pedido (%)"}
        </label>
        <Input
          id="commission_value"
          name="commission_value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="decimal"
          placeholder={type === "fixed" ? "1,00" : "10"}
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-600">Configurações salvas com sucesso.</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
