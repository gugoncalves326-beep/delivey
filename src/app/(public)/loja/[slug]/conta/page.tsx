import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountForm } from "@/components/store/account-form";

export default async function ContaPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { redirect?: string };
}) {
  const supabase = createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug, logo_url")
    .eq("slug", params.slug)
    .eq("status", "active")
    .maybeSingle();

  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-store-bg text-store-text">
      <header className="flex flex-col items-center gap-2 px-4 pb-6 pt-10">
        {company.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={company.logo_url}
            alt={company.name}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-store-accent/10" />
        )}
        <p className="text-base font-semibold">{company.name}</p>
      </header>

      <AccountForm
        companyId={company.id}
        slug={company.slug}
        redirectTo={searchParams.redirect}
      />
    </div>
  );
}
