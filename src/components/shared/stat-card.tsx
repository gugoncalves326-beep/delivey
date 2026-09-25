import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Destaque em dourado — usar com moderação (ex.: faturamento/comissão) */
  accent?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{label}</CardTitle>
        <Icon
          className={accent ? "h-4 w-4 text-brand-gold" : "h-4 w-4 text-text-secondary"}
          strokeWidth={1.75}
        />
      </CardHeader>
      <CardContent>
        <p
          className={
            accent
              ? "text-2xl font-semibold text-brand-gold"
              : "text-2xl font-semibold text-text-primary"
          }
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
