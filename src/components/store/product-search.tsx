"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";

interface Produto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
}

export function ProductSearch({ products }: { products: Produto[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const termo = query.trim().toLowerCase();
    if (!termo) return products;

    return products.filter((produto) => {
      const nome = produto.name?.toLowerCase() ?? "";
      const descricao = produto.description?.toLowerCase() ?? "";
      return nome.includes(termo) || descricao.includes(termo);
    });
  }, [products, query]);

  return (
    <>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-store-card px-4 py-2.5">
          <Search className="h-4 w-4 text-store-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-store-text-secondary"
            placeholder="Buscar produtos..."
          />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="px-4 pb-8 pt-2 text-center text-sm text-store-text-secondary">
          Nenhum produto disponível no momento.
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-4 pb-8 pt-2 text-center text-sm text-store-text-secondary">
          Nenhum produto encontrado para &quot;{query}&quot;.
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-3 px-4 pb-8 sm:grid-cols-3">
          {filtered.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </section>
      )}
    </>
  );
}