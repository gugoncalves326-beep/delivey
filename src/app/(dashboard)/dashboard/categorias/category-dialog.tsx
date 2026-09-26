"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ImageUpload } from "@/components/shared/image-upload";
import { saveCategory } from "./actions";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export function CategoryDialog({
  companyId,
  category,
}: {
  companyId: string;
  category?: Category;
}) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(category?.image_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(category);

  const uploadPath = `${companyId}/categories/${category?.id ?? crypto.randomUUID()}`;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await saveCategory(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível salvar a categoria.");
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
          Nova categoria
        </Button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={isEdit ? "Editar categoria" : "Nova categoria"}>
        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="id" defaultValue={category?.id ?? ""} />
          <input type="hidden" name="image_url" value={imageUrl} readOnly />

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Foto da categoria</label>
            <ImageUpload
              path={uploadPath}
              currentUrl={category?.image_url ?? undefined}
              onUploaded={setImageUrl}
              aspect="square"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Nome</label>
            <Input name="name" defaultValue={category?.name} placeholder="Ex: Lanches" required />
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