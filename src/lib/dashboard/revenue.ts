export interface RevenuePoint {
  label: string;
  total: number;
}

interface OrderForRevenue {
  total: number | string;
  created_at: string;
}

/**
 * Agrupa pedidos por mês (últimos `monthsBack` meses, incluindo o atual) e
 * soma o valor de cada mês. Meses sem pedidos aparecem com total 0, para o
 * gráfico não "pular" períodos vazios.
 */
export function buildMonthlyRevenue(orders: OrderForRevenue[], monthsBack = 6): RevenuePoint[] {
  const now = new Date();
  const months: { key: string; label: string }[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    months.push({ key, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }

  const totalsByMonth = new Map<string, number>();
  for (const order of orders) {
    const d = new Date(order.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    totalsByMonth.set(key, (totalsByMonth.get(key) ?? 0) + Number(order.total));
  }

  return months.map(({ key, label }) => ({
    label,
    total: totalsByMonth.get(key) ?? 0,
  }));
}
