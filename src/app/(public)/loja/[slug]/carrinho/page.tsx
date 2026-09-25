"use client";

import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useCart } from "@/lib/store/cart-context";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CarrinhoPage({
  params,
}: {
  params: { slug: string };
}) {
  const { items, updateQuantity, removeItem, totalValue, totalItems } = useCart();

  return (
    <div className="min-h-screen bg-store-bg text-store-text">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-black/5 bg-store-bg/95 px-4 py-3 backdrop-blur">
        <Link
          href={`/loja/${params.slug}`}
          aria-label="Voltar para a loja"
          className="rounded-full p-2 hover:bg-store-card"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </Link>
        <p className="text-sm font-semibold">Seu carrinho</p>
      </header>

      {items.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-sm text-store-text-secondary">
            Seu carrinho está vazio.
          </p>
          <Link
            href={`/loja/${params.slug}`}
            className="mt-4 inline-block rounded-full bg-store-accent px-4 py-2 text-sm font-medium text-white"
          >
            Ver produtos
          </Link>
        </div>
      ) : (
        <>
          <section className="space-y-3 px-4 py-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 rounded-xl border border-black/5 bg-store-card p-3"
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-black/5" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-store-text-secondary">
                    {formatBRL(item.price)} un.
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      aria-label="Diminuir quantidade"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-6 w-6 rounded-full border border-store-accent/40 text-store-accent"
                    >
                      −
                    </button>
                    <span className="min-w-[1ch] text-center text-xs font-medium">
                      {item.quantity}
                    </span>
                    <button
                      aria-label="Aumentar quantidade"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-6 w-6 rounded-full border border-store-accent/40 text-store-accent"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-semibold">
                    {formatBRL(item.price * item.quantity)}
                  </span>
                  <button
                    aria-label="Remover item"
                    onClick={() => removeItem(item.productId)}
                    className="text-store-text-secondary hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className="sticky bottom-0 border-t border-black/5 bg-store-bg px-4 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-store-text-secondary">
                {totalItems} {totalItems === 1 ? "item" : "itens"}
              </span>
              <span className="text-base font-semibold">{formatBRL(totalValue)}</span>
            </div>
            <Link
              href={`/loja/${params.slug}/checkout`}
              className="block rounded-full bg-store-accent py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
            >
              Ir para o checkout
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
