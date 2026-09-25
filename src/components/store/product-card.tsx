"use client";

import { useCart } from "@/lib/store/cart-context";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export interface ProductCardData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

export function ProductCard({ produto }: { produto: ProductCardData }) {
  const { addItem, items, updateQuantity } = useCart();
  const inCart = items.find((i) => i.productId === produto.id);

  return (
    <div className="overflow-hidden rounded-xl border border-black/5 bg-store-card">
      {produto.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={produto.image_url}
          alt={produto.name}
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="aspect-square bg-black/5" />
      )}
      <div className="space-y-1 p-3">
        <p className="text-sm font-medium">{produto.name}</p>
        <p className="text-xs text-store-text-secondary line-clamp-2">
          {produto.description || ""}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold">
            {formatBRL(Number(produto.price))}
          </span>

          {!inCart ? (
            <button
              onClick={() =>
                addItem({
                  productId: produto.id,
                  name: produto.name,
                  price: Number(produto.price),
                  imageUrl: produto.image_url,
                })
              }
              className="rounded-full bg-store-accent px-3 py-1 text-xs font-medium text-white transition hover:opacity-90"
            >
              Adicionar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                aria-label="Diminuir quantidade"
                onClick={() => updateQuantity(produto.id, inCart.quantity - 1)}
                className="h-6 w-6 rounded-full border border-store-accent/40 text-store-accent"
              >
                −
              </button>
              <span className="min-w-[1ch] text-center text-xs font-medium">
                {inCart.quantity}
              </span>
              <button
                aria-label="Aumentar quantidade"
                onClick={() => updateQuantity(produto.id, inCart.quantity + 1)}
                className="h-6 w-6 rounded-full border border-store-accent/40 text-store-accent"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
