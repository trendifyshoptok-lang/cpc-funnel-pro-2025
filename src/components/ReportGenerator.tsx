import React, { useState } from "react";
import { FileText, Download, TrendingUp, DollarSign, BarChart2 } from "lucide-react";
import type { Product, Campaign } from "../types";

interface ReportGeneratorProps {
  products: Product[];
  campaigns: Campaign[];
  monthlyGoal: number;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  products,
  campaigns,
  monthlyGoal,
}) => {
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");

  const days = parseInt(period);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = campaigns.filter((c) => new Date(c.date).getTime() >= cutoff);

  const totalSpend    = filtered.reduce((s, c) => s + c.spend, 0);
  const totalRevenue  = filtered.reduce((s, c) => s + c.revenue, 0);
  const totalProfit   = filtered.reduce((s, c) => s + c.profit, 0);
  const avgROAS       = filtered.length ? filtered.reduce((s, c) => s + c.roas, 0) / filtered.length : 0;
  const goalProgress  = monthlyGoal > 0 ? Math.min(100, (totalRevenue / monthlyGoal) * 100) : 0;

  const handleExport = () => {
    const lines = [
      `Relatorio CPC Funnel Pro`,
      `Periodo: ultimos ${period} dias`,
      ``,
      `Gasto total: ${fmt(totalSpend)}`,
      `Receita total: ${fmt(totalRevenue)}`,
      `Lucro total: ${fmt(totalProfit)}`,
      `ROAS medio: ${avgROAS.toFixed(2)}x`,
      ``,
      `Campanhas: ${filtered.length}`,
      `Produtos: ${products.length}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${period}dias.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gerador de Relatorios</h2>
          <p className="text-sm text-slate-500 mt-1">Resumo consolidado do desempenho das campanhas.</p>
        </div>
        <button onClick={handleExport} className="btn-md btn-primary">
          <Download size={14} />
          Exportar
        </button>
      </div>

      {/* Period filter */}
      <div className="flex gap-2">
        {(["7", "30", "90"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
              period === p
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            {p} dias
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Gasto",    value: fmt(totalSpend),   icon: DollarSign, color: "text-red-500" },
          { label: "Receita",  value: fmt(totalRevenue), icon: TrendingUp, color: "text-blue-600" },
          { label: "Lucro",    value: fmt(totalProfit),  icon: TrendingUp, color: totalProfit >= 0 ? "text-emerald-600" : "text-red-500" },
          { label: "ROAS med", value: `${avgROAS.toFixed(2)}x`, icon: BarChart2, color: "text-violet-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} className={color} />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
            </div>
            <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Goal progress */}
      {monthlyGoal > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">Meta Mensal</p>
            <span className="text-sm font-bold text-slate-800 tabular-nums">
              {fmt(totalRevenue)} / {fmt(monthlyGoal)}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">{goalProgress.toFixed(1)}% da meta atingida</p>
        </div>
      )}

      {/* Campaign list */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">Campanhas do Periodo ({filtered.length})</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Gasto</th>
                  <th>Receita</th>
                  <th>Lucro</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 20).map((c) => (
                  <tr key={c.id}>
                    <td>{new Date(c.date).toLocaleDateString("pt-BR")}</td>
                    <td className="font-medium">{c.productName}</td>
                    <td className="tabular-nums">{fmt(c.spend)}</td>
                    <td className="tabular-nums text-blue-600">{fmt(c.revenue)}</td>
                    <td className={`tabular-nums font-semibold ${c.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>{fmt(c.profit)}</td>
                    <td className="tabular-nums">{c.roas.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
