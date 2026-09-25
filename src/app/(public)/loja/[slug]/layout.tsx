import type { ReactNode } from "react";
import { CartProvider } from "@/lib/store/cart-context";

export default function LojaLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  return <CartProvider slug={params.slug}>{children}</CartProvider>;
}
