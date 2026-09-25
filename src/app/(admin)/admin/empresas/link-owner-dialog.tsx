"use client";

import { useState, useTransition } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { linkOwnerToCompany } from "./actions";

export function LinkOwnerDialog({ companyId, companyName }: { companyId: string; companyName: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await linkOwnerToCompany(formData);
        setSuccess(true);
        setEmail("");
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
        }, 1200);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível vincular o usuário.");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-brand-purple-secondary hover:underline"
      >
        Vincular dono
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Vincular dono a "${companyName}"`}>
        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="companyId" defaultValue={companyId} />

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">E-mail do usuário</label>
            <Input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
            />
            <p className="text-xs text-text-secondary">
              A pessoa precisa já ter uma conta criada em /login.
            </p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">Vinculado com sucesso!</Alert>}

          <Button type="submit" className="w-full" disabled={pending || success}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Vincular
          </Button>
        </form>
      </Modal>
    </>
  );
}