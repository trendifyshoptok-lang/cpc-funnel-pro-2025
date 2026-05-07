import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Campaign } from "../../types";

interface TrendChartsProps {
  campaigns: Campaign[];
  days?: number;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const TrendCharts: React.FC<TrendChartsProps> = ({
  campaigns,
  days = 30,
}) => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = [...campaigns]
    .filter((c) => new Date(c.date).getTime() >= cutoff)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const data = filtered.map((c) => ({
    date: new Date(c.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    Lucro: parseFloat(c.profit.toFixed(2)),
    Receita: parseFloat(c.revenue.toFixed(2)),
    Gasto: parseFloat(c.spend.toFixed(2)),
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-400">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <YAxis tickFormatter={(v) => `R$${v}`} tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <Tooltip formatter={(v: number) => fmt(v)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="Receita" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Lucro"   stroke="#10b981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Gasto"   stroke="#ef4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
