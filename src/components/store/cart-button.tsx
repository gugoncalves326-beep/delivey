"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store/cart-context";

export function CartButton({ slug }: { slug: string }) {
  const { totalItems } = useCart();

  return (
    <Link
      href={`/loja/${slug}/carrinho`}
      aria-label="Carrinho"
      className="relative rounded-full p-2 hover:bg-store-card"
    >
      <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
      {totalItems > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-store-accent px-1 text-[10px] font-semibold text-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
