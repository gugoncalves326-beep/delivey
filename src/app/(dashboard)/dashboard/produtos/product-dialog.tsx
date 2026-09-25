"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { saveProduct } from "./actions";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export function ProductDialog({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(product?.is_available ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isEdit = Boolean(product);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await saveProduct(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível salvar o produto.");
      }
    });
  }

  return (
    <>
      {isEdit ? (
        <button
          onClick={() => setOpen(true)}
          className="text-sm font-medium text-brand-purple-secondary hover:underline"
        >
          Editar
        </button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo produto
        </Button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={isEdit ? "Editar produto" : "Novo produto"}>
        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="id" defaultValue={product?.id ?? ""} />

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Nome</label>
            <Input name="name" defaultValue={product?.name} placeholder="Ex: X-Burger" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Descrição</label>
            <Textarea
              name="description"
              defaultValue={product?.description ?? ""}
              placeholder="Ingredientes, tamanho, etc."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Preço (R$)</label>
              <Input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.price ?? ""}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Categoria</label>
              <Select name="category_id" defaultValue={product?.category_id ?? ""}>
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-panel-border px-3 py-2">
            <span className="text-sm text-text-primary">Disponível para venda</span>
            <Switch checked={available} onChange={setAvailable} name="is_available" />
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </form>
      </Modal>
    </>
  );
}
