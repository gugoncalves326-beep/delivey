import { FolderTree } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/dashboard/company";
import { CategoryDialog } from "./category-dialog";
import { DeleteCategoryButton } from "./delete-button";

export default async function CategoriasPage() {
  const company = await getCurrentCompany();
  const supabase = createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(count)")
    .eq("company_id", company!.id)
    .order("position");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Organize os produtos da sua loja em categorias"
        action={<CategoryDialog companyId={company!.id} />}
      />

      {!categories || categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="Nenhuma categoria cadastrada"
          description="Categorias ajudam os clientes a encontrar produtos mais rápido na loja."
        />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Categoria</Th>
              <Th>Produtos</Th>
              <Th />
            </Tr>
          </Thead>
          <tbody>
            {categories.map((category) => (
              <Tr key={category.id}>
                <Td className="font-medium">{category.name}</Td>
                <Td>
                  {(category as unknown as { products: { count: number }[] }).products?.[0]
                    ?.count ?? 0}
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <CategoryDialog companyId={company!.id} category={category} />
                    <DeleteCategoryButton id={category.id} name={category.name} />
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