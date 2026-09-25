import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { CompanyDialog } from "./company-dialog";
import { LinkOwnerDialog } from "./link-owner-dialog";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function EmpresasPage() {
  const supabase = createClient();

  const [{ data: companies }, { data: orders }] = await Promise.all([
    supabase.from("companies").select("*").order("created_at", { ascending: false }),
    // ADM_SUPREMO vê todos os pedidos (RLS libera acesso total) — agregado
    // em memória por enquanto; se o volume crescer, vira uma view/RPC.
    supabase.from("orders").select("company_id, total, status").eq("status", "completed"),
  ]);

  const statsByCompany = new Map<string, { pedidos: number; faturamento: number }>();
  for (const order of orders ?? []) {
    const current = statsByCompany.get(order.company_id) ?? { pedidos: 0, faturamento: 0 };
    current.pedidos += 1;
    current.faturamento += Number(order.total);
    statsByCompany.set(order.company_id, current);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Empresas"
        description="Gerencie as empresas cadastradas na plataforma"
        action={<CompanyDialog />}
      />

      {!companies || companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhuma empresa cadastrada"
          description="Clique em “Nova empresa” para cadastrar a primeira loja da plataforma."
        />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Empresa</Th>
              <Th>Status</Th>
              <Th>Pedidos</Th>
              <Th>Faturamento</Th>
              <Th />
            </Tr>
          </Thead>
          <tbody>
            {companies.map((company) => {
              const stats = statsByCompany.get(company.id) ?? { pedidos: 0, faturamento: 0 };
              return (
                <Tr key={company.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-panel-bg-secondary" />
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-xs text-text-secondary">/loja/{company.slug}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge variant={company.status === "active" ? "success" : "error"}>
                      {company.status === "active" ? "Ativa" : "Suspensa"}
                    </Badge>
                  </Td>
                  <Td>{stats.pedidos}</Td>
                  <Td>{formatBRL(stats.faturamento)}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <LinkOwnerDialog companyId={company.id} companyName={company.name} />
                      <CompanyDialog company={company} />
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}