import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CartButton } from "@/components/store/cart-button";
import { OrderStatusBanner } from "@/components/store/order-status-banner";
import { ProductSearch } from "@/components/store/product-search";
import type { Enums } from "@/types/database";

type OrderStatus = Enums<"order_status">;

const activeOrderStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
];

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let customerId: string | null = null;
  let activeOrder: { id: string; status: OrderStatus; created_at: string } | null = null;

  if (user) {
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("company_id", company.id)
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (customer) {
      customerId = customer.id;

      const { data: recentOrders } = await supabase
        .from("orders")
        .select("id, status, created_at")
        .eq("company_id", company.id)
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
        .limit(5);

      activeOrder =
        (recentOrders as { id: string; status: OrderStatus; created_at: string }[] | null)?.find(
          (order) => activeOrderStatuses.includes(order.status)
        ) ?? null;
    }
  }

  const [{ data: storeSettings }, { data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("store_settings")
      .select("is_open, min_order_value, delivery_fee")
      .eq("company_id", company.id)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("id, name, position, image_url")
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

      <OrderStatusBanner
        initialOrder={activeOrder}
        customerId={customerId}
        slug={company.slug}
      />

      {company.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={company.banner_url}
          alt=""
          className="mx-4 mt-3 h-32 w-[calc(100%-2rem)] rounded-xl object-cover"
        />
      ) : (
        <div className="mx-4 mt-3 h-32 rounded-xl bg-gradient-to-r from-store-accent/20 to-store-accent/5" />
      )}

      {categories && categories.length > 0 && (
        <section className="px-4 py-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categories.map((categoria) => (
              <Link
                key={categoria.id}
                href={`/loja/${company.slug}/categoria/${categoria.id}`}
                className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl bg-store-card px-4 py-3"
              >
                {categoria.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={categoria.image_url}
                    alt={categoria.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-store-accent/10" />
                )}
                <span className="text-xs font-medium">{categoria.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductSearch products={products ?? []} />
    </div>
  );
}