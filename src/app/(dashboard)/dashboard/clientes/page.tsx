import { Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/dashboard/company";

export default async function ClientesPage() {
  const company = await getCurrentCompany();
  const supabase = createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("company_id", company!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" description="Clientes que já pediram na sua loja" />

      {!customers || customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente ainda"
          description="Clientes aparecem aqui automaticamente conforme fazem pedidos na sua loja pública."
        />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Nome</Th>
              <Th>Telefone</Th>
              <Th>Cliente desde</Th>
            </Tr>
          </Thead>
          <tbody>
            {customers.map((customer) => (
              <Tr key={customer.id}>
                <Td className="font-medium">{customer.full_name ?? "—"}</Td>
                <Td>{customer.phone ?? "—"}</Td>
                <Td>{new Date(customer.created_at).toLocaleDateString("pt-BR")}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
