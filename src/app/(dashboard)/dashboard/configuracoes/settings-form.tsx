"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { saveStoreSettings } from "./actions";
import type { Database } from "@/types/database";

type StoreSettings = Database["public"]["Tables"]["store_settings"]["Row"];

export function SettingsForm({ settings }: { settings: StoreSettings | null }) {
  const [isOpen, setIsOpen] = useState(settings?.is_open ?? true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await saveStoreSettings(formData);
        setSuccess(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível salvar.");
      }
    });
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Configurações da loja</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-panel-border px-3 py-2">
            <div>
              <p className="text-sm text-text-primary">Loja aberta</p>
              <p className="text-xs text-text-secondary">Clientes só conseguem pedir com a loja aberta</p>
            </div>
            <Switch checked={isOpen} onChange={setIsOpen} name="is_open" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Pedido mínimo (R$)</label>
            <Input
              name="min_order_value"
              type="number"
              step="0.01"
              min="0"
              defaultValue={settings?.min_order_value ?? 0}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Taxa de entrega (R$)</label>
            <Input
              name="delivery_fee"
              type="number"
              step="0.01"
              min="0"
              defaultValue={settings?.delivery_fee ?? 0}
            />
          </div>

          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">Configurações salvas.</Alert>}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
