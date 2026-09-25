"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteProduct } from "./actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      title="Excluir"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Excluir "${name}"? Essa ação não pode ser desfeita.`)) return;
        const formData = new FormData();
        formData.set("id", id);
        startTransition(() => deleteProduct(formData));
      }}
      className="rounded-md p-1.5 text-text-secondary hover:bg-status-error/10 hover:text-status-error disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
