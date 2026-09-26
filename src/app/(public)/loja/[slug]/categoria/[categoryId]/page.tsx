import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/product-card";
import { CartButton } from "@/components/store/cart-button";

export default async function CategoriaPage({
  params,
}: {
  params: { slug: string; categoryId: string };
}) {
  const supabase = createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug, status, logo_url")
    .eq("slug", params.slug)
    .eq("status", "active")
    .maybeSingle();

  if (!company) {
    notFound();
  }

  const { data: category } = await supabase
    .from("categories")
    .select("id, name")
    .eq("id", params.categoryId)
    .eq("company_id", company.id)
    .maybeSingle();

  if (!category) {
    notFound();
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price, image_url, category_id")
    .eq("company_id", company.id)
    .eq("category_id", category.id)
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-store-bg text-store-text">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-store-bg/95 px-4 py-3 backdrop-blur">
        <Link
          href={`/loja/${company.slug}`}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          {company.name}
        </Link>
        <CartButton slug={company.slug} />
      </header>

      <div className="px-4 py-4">
        <h1 className="text-lg font-semibold">{category.name}</h1>
      </div>

      {!products || products.length === 0 ? (
        <div className="px-4 pb-8 pt-2 text-center text-sm text-store-text-secondary">
          Nenhum produto disponível nesta categoria no momento.
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