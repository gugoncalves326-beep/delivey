"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ImageUpload({
  path,
  currentUrl,
  onUploaded,
  aspect = "square",
}: {
  /** Caminho dentro do bucket, ex: `${companyId}/logo` (sem extensão) */
  path: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  aspect?: "square" | "banner";
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB.");
      return;
    }

    setUploading(true);
    const supabase = createClient();

    const ext = file.name.split(".").pop();
    const fullPath = `${path}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fullPath, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      setError("Erro ao enviar imagem: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(fullPath);
    // cache-bust pra imagem atualizar na hora, já que o nome do arquivo é fixo
    const bustedUrl = `${data.publicUrl}?t=${Date.now()}`;

    setPreview(bustedUrl);
    onUploaded(bustedUrl);
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-panel-border bg-panel-bg-secondary hover:border-brand-purple-secondary ${
          aspect === "square" ? "h-24 w-24" : "h-24 w-full"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-text-secondary">
            <Upload className="h-5 w-5" />
            <span className="text-xs">Enviar</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}

        {preview && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
              onUploaded("");
            }}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            aria-label="Remover"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
