"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RevenuePoint } from "@/lib/dashboard/revenue";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatBRLShort(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={formatBRLShort} width={44} />
          <Tooltip
            formatter={(value: number) => formatBRL(value)}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
