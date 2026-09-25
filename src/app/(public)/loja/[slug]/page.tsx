import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/product-card";
import { CartButton } from "@/components/store/cart-button";

export default async function StorePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug, status, logo_url, banner_url")
    .eq("slug", params.slug)
    .eq("status", "active")
    .maybeSingle();

  if (!company) {
    notFound();
  }

  const [{ data: storeSettings }, { data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("store_settings")
      .select("is_open, min_order_value, delivery_fee")
      .eq("company_id", company.id)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("id, name, position")
      .eq("company_id", company.id)
      .order("position", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, description, price, image_url, category_id")
      .eq("company_id", company.id)
      .eq("is_available", true)
      .order("created_at", { ascending: false }),
  ]);

  const isOpen = storeSettings?.is_open ?? true;

  return (
    <div className="min-h-screen bg-store-bg text-store-text">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-store-bg/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo_url} alt={company.name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-store-accent/10" />
          )}
          <div>
            <p className="text-sm font-semibold">{company.name}</p>
            <p className="text-xs text-store-text-secondary">
              {isOpen ? "Aberto agora" : "Fechado no momento"}
            </p>
          </div>
        </div>
        <CartButton slug={company.slug} />
      </header>

      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-store-card px-4 py-2.5">
          <Search className="h-4 w-4 text-store-text-secondary" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-store-text-secondary"
            placeholder="Buscar produtos..."
            disabled
          />
        </div>
      </div>

      {company.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={company.banner_url}
          alt=""
          className="mx-4 h-32 w-[calc(100%-2rem)] rounded-xl object-cover"
        />
      ) : (
        <div className="mx-4 h-32 rounded-xl bg-gradient-to-r from-store-accent/20 to-store-accent/5" />
      )}

      {categories && categories.length > 0 && (
        <section className="px-4 py-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categories.map((categoria) => (
              <div
                key={categoria.id}
                className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl bg-store-card px-4 py-3"
              >
                <div className="h-8 w-8 rounded-full bg-store-accent/10" />
                <span className="text-xs font-medium">{categoria.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!products || products.length === 0 ? (
        <div className="px-4 pb-8 pt-6 text-center text-sm text-store-text-secondary">
          Nenhum produto disponível no momento.
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-3 px-4 pb-8 sm:grid-cols-3">
          {products.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </section>
      )}
    </div>
  );
}
