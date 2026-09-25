import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/store/checkout-form";

export default async function CheckoutPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .eq("status", "active")
    .maybeSingle();

  if (!company) {
    redirect(`/loja/${params.slug}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/loja/${params.slug}/conta?redirect=/loja/${params.slug}/checkout`);
  }

  const { data: storeSettings } = await supabase
    .from("store_settings")
    .select("is_open, min_order_value, delivery_fee")
    .eq("company_id", company.id)
    .maybeSingle();

  const { data: customer } = await supabase
    .from("customers")
    .select("id, full_name, phone")
    .eq("company_id", company.id)
    .eq("auth_user_id", user.id)
    .maybeSingle();

  let addresses: Array<{
    id: string;
    street: string;
    number: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    complement: string | null;
  }> = [];

  if (customer) {
    const { data } = await supabase
      .from("addresses")
      .select("id, street, number, neighborhood, city, state, zip_code, complement")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });
    addresses = data ?? [];
  }

  return (
    <CheckoutForm
      companyId={company.id}
      slug={company.slug}
      customerId={customer?.id ?? null}
      storeSettings={
        storeSettings ?? { is_open: true, min_order_value: 0, delivery_fee: 0 }
      }
      initialAddresses={addresses}
    />
  );
}
