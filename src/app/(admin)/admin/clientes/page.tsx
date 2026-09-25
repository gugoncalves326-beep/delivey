import { Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdminClientesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" description="Clientes de todas as empresas da plataforma" />

      <Card>
        <CardContent className="pt-5">
          <EmptyState
            icon={Users}
            title="Nenhum cliente ainda"
            description="Clientes aparecem aqui conforme fazem pedidos nas lojas — funcionalidade de uma etapa futura."
          />
        </CardContent>
      </Card>
    </div>
  );
}
