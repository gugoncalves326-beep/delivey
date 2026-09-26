import { PackageSearch } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/dashboard/company";
import { ProductDialog } from "./product-dialog";
import { DeleteProductButton } from "./delete-button";
import { AvailabilityToggle } from "./availability-toggle";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProdutosPage() {
  const company = await getCurrentCompany();
  const supabase = createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(name)")
      .eq("company_id", company!.id)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").eq("company_id", company!.id).order("position"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Gerencie os produtos da sua loja"
        action={<ProductDialog companyId={company!.id} categories={categories ?? []} />}
      />

      {!products || products.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Nenhum produto cadastrado"
          description="Clique em “Novo produto” para adicionar o primeiro item da sua loja."
        />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Produto</Th>
              <Th>Categoria</Th>
              <Th>Preço</Th>
              <Th>Disponível</Th>
              <Th />
            </Tr>
          </Thead>
          <tbody>
            {products.map((product) => (
              <Tr key={product.id}>
                <Td>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    {product.description && (
                      <p className="max-w-xs truncate text-xs text-text-secondary">
                        {product.description}
                      </p>
                    )}
                  </div>
                </Td>
                <Td>
                  {(product as unknown as { categories: { name: string } | null }).categories
                    ?.name ?? (
                    <Badge variant="neutral">Sem categoria</Badge>
                  )}
                </Td>
                <Td>{formatBRL(Number(product.price))}</Td>
                <Td>
                  <AvailabilityToggle id={product.id} isAvailable={product.is_available} />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <ProductDialog companyId={company!.id} categories={categories ?? []} product={product} />
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}