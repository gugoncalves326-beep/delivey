"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ImageUpload } from "@/components/shared/image-upload";
import { saveCompany } from "./actions";
import type { Database } from "@/types/database";

type Company = Database["public"]["Tables"]["companies"]["Row"];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CompanyDialog({ company }: { company?: Company }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(company?.name ?? "");
  const [slug, setSlug] = useState(company?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(company));
  const [logoUrl, setLogoUrl] = useState(company?.logo_url ?? "");
  const [bannerUrl, setBannerUrl] = useState(company?.banner_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isEdit = Boolean(company);
  // enquanto a empresa não existe (criação), usa um id temporário só para o caminho de upload
  const tempId = company?.id ?? "novo";

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await saveCompany(formData);
        setOpen(false);
        if (!isEdit) {
          setName("");
          setSlug("");
          setSlugTouched(false);
          setLogoUrl("");
          setBannerUrl("");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível salvar a empresa.");
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
          Gerenciar
        </button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova empresa
        </Button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={isEdit ? "Editar empresa" : "Nova empresa"}>
        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="id" defaultValue={company?.id ?? ""} />
          <input type="hidden" name="logo_url" value={logoUrl} readOnly />
          <input type="hidden" name="banner_url" value={bannerUrl} readOnly />

          {isEdit && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary">Logo</label>
                <ImageUpload
                  path={`${tempId}/logo`}
                  currentUrl={company?.logo_url}
                  onUploaded={setLogoUrl}
                  aspect="square"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary">Banner</label>
                <ImageUpload
                  path={`${tempId}/banner`}
                  currentUrl={company?.banner_url}
                  onUploaded={setBannerUrl}
                  aspect="banner"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Nome da empresa</label>
            <Input
              name="name"
              value={name}
              onChange={(e) => {
                const value = e.target.value;
                setName(value);
                if (!slugTouched) setSlug(slugify(value));
              }}
              placeholder="Ex: Hamburgueria do Zé"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">
              Identificador da loja (slug) — vira /loja/{slug || "..."}
            </label>
            <Input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="hamburgueria-do-ze"
              required
            />
          </div>

          {isEdit && (
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Status</label>
              <Select name="status" defaultValue={company?.status}>
                <option value="active">Ativa</option>
                <option value="suspended">Suspensa</option>
              </Select>
            </div>
          )}

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