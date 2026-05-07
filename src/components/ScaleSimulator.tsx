import React, { useState, useMemo } from "react";
import {
  TrendingUp, DollarSign, Target, BarChart2, Zap,
  BadgePercent, CheckCircle, AlertTriangle, XCircle,
  RotateCcw, Sparkles, MousePointer2, ArrowRight,
  TrendingDown, Star,
} from "lucide-react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartTooltip, ReferenceLine, ReferenceDot,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import type { Product } from "../types";
import { Button } from "./ui/Button";

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt  = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtK = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000)     return `R$${(v / 1_000).toFixed(0)}k`;
  return `R$${v.toFixed(0)}`;
};

// ─── Types ────────────────────────────────────────────────────────────────────
type CpcZone   = "good" | "medium" | "tight" | "critical";
type CrStatus  = "above" | "near"  | "below";
type Viability = "viable" | "marginal" | "unviable";

// ─── CPC auction-pressure model ───────────────────────────────────────────────
// As budget grows above the base, CPC increases (more competition in auctions).
// Using a power law: adjustedCpc = baseCpc × (budgetRatio)^0.28
// At 2× budget → +21% CPC | 3× → +37% | 5× → +56%
// Below base budget, CPC stays at base (bids don't go DOWN).
const CPC_GROWTH_EXP = 0.28;

function calcWithScale(
  budget: number,
  baseCpc: number,
  baseBudget: number,
  cr: number,
  commissionLiquid: number,
  fixedCostsTotal: number,
) {
  const ratio       = budget / (baseBudget || 1);
  const adjCpc      = ratio > 1 ? baseCpc * Math.pow(ratio, CPC_GROWTH_EXP) : baseCpc;
  const clicks      = budget / (adjCpc || 1);
  const conversions = clicks * (cr / 100);
  const revenue     = conversions * commissionLiquid;
  const dailyFixed  = fixedCostsTotal / 30;
  const profit      = revenue - budget - dailyFixed;
  const roi         = budget > 0 ? (profit / budget) * 100 : 0;
  return {
    adjCpc, clicks, conversions, revenue,
    profit, roi,
    monthlyProfit:  profit * 30,
    monthlyRevenue: revenue * 30,
  };
}

// ─── Simple linear scenario (for hero card / scenarios panel) ─────────────────
function calcScenario(
  budget: number, cpc: number, cr: number,
  commissionLiquid: number, fixedCostsTotal: number,
) {
  const clicks      = budget / (cpc || 1);
  const conversions = clicks * (cr / 100);
  const revenue     = conversions * commissionLiquid;
  const dailyFixed  = fixedCostsTotal / 30;
  const profit      = revenue - budget - dailyFixed;
  const roi         = budget > 0 ? (profit / budget) * 100 : 0;
  return { clicks, conversions, revenue, profit, roi,
           monthlyProfit: profit * 30, monthlyRevenue: revenue * 30 };
}

function calcBreakevenBudget(cpc: number, cr: number, commissionLiquid: number, fixedCostsTotal: number) {
  const rr = commissionLiquid * (cr / 100) / (cpc || 1);
  if (rr <= 1) return Infinity;
  if (fixedCostsTotal <= 0) return 0;
  return fixedCostsTotal / (30 * (rr - 1));
}

// ─── Zone helpers ─────────────────────────────────────────────────────────────
function getCpcZone(cpc: number, p: Product): CpcZone {
  const [b, m, a] = [p.cpcBom, p.cpcInter, p.cpcApert].filter(v => v > 0).sort((a, b) => a - b);
  if (cpc <= b) return "good";
  if (cpc <= m) return "medium";
  if (cpc <= a) return "tight";
  return "critical";
}
function getCrStatus(cr: number, req: number): CrStatus {
  if (cr >= req)       return "above";
  if (cr >= req * 0.6) return "near";
  return "below";
}
function getViability(roi: number, profit: number): Viability {
  if (profit > 0 && roi >= 50) return "viable";
  if (profit > 0)              return "marginal";
  return "unviable";
}

// ─── Config ───────────────────────────────────────────────────────────────────
const CPC_ZONE_CFG: Record<CpcZone, { label: string; color: string; bg: string; border: string; dot: string }> = {
  good:     { label: "Zona Boa",      color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200", dot: "bg-emerald-500" },
  medium:   { label: "Zona Media",    color: "text-blue-700",    bg: "bg-blue-50",     border: "border-blue-200",    dot: "bg-blue-500"    },
  tight:    { label: "Zona Apertada", color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200",   dot: "bg-amber-500"   },
  critical: { label: "Zona Critica",  color: "text-red-700",     bg: "bg-red-50",      border: "border-red-200",     dot: "bg-red-500"     },
};
const CR_STATUS_CFG: Record<CrStatus, { label: string; color: string; bg: string; border: string }> = {
  above: { label: "Acima da meta",   color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  near:  { label: "Proximo da meta", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200"   },
  below: { label: "Abaixo da meta",  color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200"     },
};
const VIAB_CFG: Record<Viability, { label: string; detail: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  viable:   { label: "VIAVEL",   detail: "Pronto para escalar",               color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: <CheckCircle   size={13} className="text-emerald-600" /> },
  marginal: { label: "MARGINAL", detail: "Monitore antes de aumentar budget",  color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   icon: <AlertTriangle size={13} className="text-amber-600"  /> },
  unviable: { label: "INVIAVEL", detail: "Ajuste parametros antes de investir",color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",     icon: <XCircle       size={13} className="text-red-500"    /> },
};

const BUDGET_CHIPS = [50, 100, 200, 500, 1000];

// ─── Chart levels ─────────────────────────────────────────────────────────────
// Show full curve: below current (fixed-cost drag zone) + above current (CPC growth zone)
const CHART_LEVELS = [
  { mult: 0.25, label: "-75%" },
  { mult: 0.5,  label: "-50%" },
  { mult: 0.75, label: "-25%" },
  { mult: 1.0,  label: "Atual" },
  { mult: 1.5,  label: "+50%" },
  { mult: 2.0,  label: "+100%" },
  { mult: 3.0,  label: "+200%" },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const ChartTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const lucro  = payload.find(p => p.dataKey === "lucroMensal")?.value ?? 0;
  const roi    = payload.find(p => p.dataKey === "roi")?.value ?? 0;
  const adjCpc = payload[0]?.payload?.adjCpc ?? 0;
  const budget = payload[0]?.payload?.budget ?? 0;
  return (
    <div className="bg-slate-900 text-white rounded-xl px-3 py-2.5 shadow-xl text-[11px] min-w-[175px]">
      <div className="font-bold text-slate-300 mb-2 flex items-center justify-between gap-3">
        <span>Cenario: {label}</span>
        <span className="text-slate-400 font-normal tabular-nums">{fmt(budget)}/dia</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Lucro/mes</span>
          <span className={`font-black tabular-nums ${lucro >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(lucro)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">ROI</span>
          <span className={`font-black tabular-nums ${roi >= 0 ? "text-cyan-400" : "text-red-400"}`}>{roi.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">CPC estimado</span>
          <span className="font-semibold tabular-nums text-slate-300">{fmt(adjCpc)}</span>
        </div>
      </div>
    </div>
  );
};

// ─── ROI label on line dots ───────────────────────────────────────────────────
const RoiDotLabel: React.FC<any> = (props) => {
  const { cx, cy, value, payload } = props;
  if (value === undefined || !payload?.isOptimal) return null;
  return (
    <g>
      <Star
        x={(cx ?? 0) - 8} y={(cy ?? 0) - 22}
        size={16}
        fill="#f59e0b" stroke="#fff" strokeWidth={1}
      />
      <text x={cx} y={(cy ?? 0) - 26} textAnchor="middle" fontSize={9} fontWeight={800} fill="#d97706">
        OTIMO
      </text>
    </g>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const ScaleSimulator: React.FC<{
  products: Product[];
  fixedCostsTotal: number;
  activeProductsCount: number;
}> = ({ products, fixedCostsTotal }) => {

  const [selectedId,  setSelectedId]  = useState<string>(products[0]?.id ?? "");
  const [dailyBudget, setDailyBudget] = useState(100);
  const [cpc,  setCpc]  = useState(2.0);
  const [cr,   setCr]   = useState(2.0);

  const product = products.find(p => p.id === selectedId) ?? null;

  const handleUseProductMetas = () => {
    if (!product) return;
    const [sortedBom] = [product.cpcBom, product.cpcInter, product.cpcApert]
      .filter(v => v > 0).sort((a, b) => a - b);
    if (sortedBom)          setCpc(+sortedBom.toFixed(2));
    if (product.requiredCR) setCr(+product.requiredCR.toFixed(2));
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const comm            = product?.commissionLiquid ?? 0;
  const main            = useMemo(() => calcScenario(dailyBudget, cpc, cr, comm, fixedCostsTotal), [dailyBudget, cpc, cr, comm, fixedCostsTotal]);
  const cpcZone         = product ? getCpcZone(cpc, product) : "good" as CpcZone;
  const crStatus        = product ? getCrStatus(cr, product.requiredCR) : "above" as CrStatus;
  const viability       = getViability(main.roi, main.profit);
  const breakevenBudget = calcBreakevenBudget(cpc, cr, comm, fixedCostsTotal);

  // ── Chart data: 7 scenarios with CPC pressure model ─────────────────────────
  const chartData = useMemo(() => {
    return CHART_LEVELS.map(({ mult, label }) => {
      const b = (dailyBudget || 1) * mult;
      const s = calcWithScale(b, cpc, dailyBudget || 1, cr, comm, fixedCostsTotal);
      return {
        label,
        mult,
        budget:      +b.toFixed(2),
        lucroMensal: +s.monthlyProfit.toFixed(0),
        roi:         +s.roi.toFixed(1),
        adjCpc:      +s.adjCpc.toFixed(2),
        isCurrent:   mult === 1.0,
        isOptimal:   false, // filled below
      };
    });
  }, [dailyBudget, cpc, cr, comm, fixedCostsTotal]);

  // Find optimal bar (highest ROI)
  const optimalIdx = useMemo(() => {
    let best = 0;
    chartData.forEach((d, i) => { if (d.roi > chartData[best].roi) best = i; });
    return best;
  }, [chartData]);

  const chartDataFinal = useMemo(() =>
    chartData.map((d, i) => ({ ...d, isOptimal: i === optimalIdx })),
  [chartData, optimalIdx]);

  const optimalBar = chartDataFinal[optimalIdx];

  // Y domains
  const profits   = chartDataFinal.map(d => d.lucroMensal);
  const rois      = chartDataFinal.map(d => d.roi);
  const minP      = Math.min(...profits);
  const maxP      = Math.max(...profits);
  const padP      = Math.max(Math.abs(maxP) * 0.25, 300);
  const minR      = Math.min(...rois, -5);
  const maxR      = Math.max(...rois, 5);
  const padR      = Math.abs(maxR) * 0.2;

  // Bar color per entry
  const barColor = (d: typeof chartDataFinal[0]) => {
    if (d.isOptimal) return "#f59e0b";   // gold = optimal
    if (d.isCurrent) return "#6366f1";   // indigo = atual
    return d.lucroMensal >= 0 ? "#34d399" : "#f87171"; // emerald / red
  };

  // ── Comparison scenarios ─────────────────────────────────────────────────────
  const scenarios = useMemo(() => [
    { id: "conservador", label: "Conservador", badge: "-30% budget", active: false,
      data: calcScenario(dailyBudget * 0.7, cpc, cr * 0.9, comm, fixedCostsTotal) },
    { id: "atual",       label: "Atual",       badge: "cenario ativo", active: true,
      data: main },
    { id: "agressivo",   label: "Agressivo",   badge: "+50% budget", active: false,
      data: calcScenario(dailyBudget * 1.5, cpc, cr, comm, fixedCostsTotal) },
  ], [dailyBudget, cpc, cr, comm, fixedCostsTotal, main]);

  const cpcZoneCfg  = CPC_ZONE_CFG[cpcZone];
  const crStatusCfg = CR_STATUS_CFG[crStatus];
  const vCfg        = VIAB_CFG[viability];

  const kpis = [
    { label: "Cliques/dia",    value: main.clicks.toFixed(0),           icon: MousePointer2, color: "text-blue-600",    bg: "bg-blue-50",    help: "Budget / CPC" },
    { label: "Conversoes/dia", value: main.conversions.toFixed(1),      icon: Target,        color: "text-violet-600",  bg: "bg-violet-50",  help: "Cliques x CR"  },
    { label: "Receita/dia",    value: fmt(main.revenue),                icon: DollarSign,    color: "text-emerald-600", bg: "bg-emerald-50", help: "Conv. x Comissao" },
    { label: "Lucro/dia",      value: fmt(main.profit),                 icon: TrendingUp,    color: main.profit  >= 0 ? "text-emerald-600" : "text-red-500", bg: main.profit  >= 0 ? "bg-emerald-50" : "bg-red-50", help: "Receita - Spend - Fixos" },
    { label: "ROI",            value: `${main.roi.toFixed(1)}%`,        icon: BarChart2,     color: main.roi     >= 0 ? "text-emerald-600" : "text-red-500", bg: main.roi     >= 0 ? "bg-emerald-50" : "bg-red-50", help: "Lucro / Budget x 100"   },
    { label: "ROAS",           value: `${(main.revenue / (dailyBudget || 1)).toFixed(2)}x`, icon: Zap, color: "text-slate-600", bg: "bg-slate-50", help: "Receita / Budget" },
  ];

  // ── Conclusion text ──────────────────────────────────────────────────────────
  const isModelProfitable = (comm * (cr / 100)) > cpc; // revenue/click > cpc
  const isOptimalCurrent  = optimalIdx === 3; // 4th bar = "Atual"
  const isOptimalAbove    = optimalIdx > 3;

  return (
    <div className="space-y-5 pb-10">

      {/* ── Dark Navy Header ─────────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-700/40 shadow-lg"
        style={{ background: "linear-gradient(135deg, #0A0E1A 0%, #0E2233 50%, #0A1628 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(34,211,238,0.06) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-2xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(34,211,238,0.70)" }}>
              Simulacao de Escala
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-white leading-tight">{product?.name ?? "Selecione um produto"}</span>
              {product?.nicho && <span className="text-2xs font-bold px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}>{product.nicho}</span>}
              {product?.funnelStage && <span className="text-2xs font-bold px-2 py-0.5 rounded-md uppercase" style={{ background: "rgba(139,92,246,0.12)", color: "rgba(167,139,250,0.85)", border: "1px solid rgba(139,92,246,0.22)" }}>{product.funnelStage} de Funil</span>}
            </div>
          </div>
          {product && (
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              {[
                { icon: <BadgePercent size={11} />, label: "Comissao", value: fmt(product.commissionLiquid), accent: "#22D3EE", bg: "rgba(34,211,238,0.10)", border: "rgba(34,211,238,0.22)" },
                { icon: <TrendingUp   size={11} />, label: "CPC Bom",  value: fmt(product.cpcBom),           accent: "#60A5FA", bg: "rgba(96,165,250,0.10)",  border: "rgba(96,165,250,0.22)"  },
                { icon: <Target       size={11} />, label: "Meta CR",  value: `${product.requiredCR.toFixed(2)}%`, accent: "#A78BFA", bg: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.22)" },
              ].map(k => (
                <div key={k.label} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: k.bg, border: `1px solid ${k.border}` }}>
                  <span style={{ color: k.accent }}>{k.icon}</span>
                  <div>
                    <div className="text-2xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.40)" }}>{k.label}</div>
                    <div className="text-sm font-black tabular-nums leading-none" style={{ color: k.accent }}>{k.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Params + Hero ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* LEFT — Params */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-slate-800 leading-none">Parametros</div>
                <div className="text-2xs text-slate-400 mt-0.5">Ajuste os 3 fatores da campanha</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<RotateCcw size={13} />}
              onClick={() => { setCpc(2.0); setCr(2.0); setDailyBudget(100); }}
              title="Resetar parâmetros"
              className="px-2"
            />
          </div>

          <div className="p-5 space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Produto</label>
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                {products.length === 0 && <option value="">Nenhum produto cadastrado</option>}
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Orcamento Diario</label>
                <span className="text-2xs text-slate-400">quanto investir/dia</span>
              </div>
              <div className="flex items-center bg-white rounded-xl border border-slate-200 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all mb-2">
                <span className="pl-3 pr-1 text-sm font-bold text-slate-500">R$</span>
                <input type="number" value={dailyBudget || ""} onChange={e => setDailyBudget(Number(e.target.value))} min={1}
                  className="w-full px-2 py-2.5 text-sm font-semibold text-slate-800 bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {BUDGET_CHIPS.map(v => (
                  <button key={v} onClick={() => setDailyBudget(v)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${dailyBudget === v ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                    {v >= 1000 ? `${v/1000}k` : v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">CPC Medio</label>
                <span className="text-2xs text-slate-400">custo por clique</span>
              </div>
              <div className="flex items-center bg-white rounded-xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all mb-1.5">
                <span className="pl-3 pr-1 text-sm font-bold text-slate-500">R$</span>
                <input type="number" value={cpc || ""} onChange={e => setCpc(Number(e.target.value))} min={0.01} step={0.1}
                  className="w-full px-2 py-2.5 text-sm font-semibold text-slate-800 bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              </div>
              {product && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold ${cpcZoneCfg.bg} ${cpcZoneCfg.border} ${cpcZoneCfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cpcZoneCfg.dot}`} />
                  {cpcZoneCfg.label} — CPC Bom: {fmt(product.cpcBom)}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Taxa de Conversao</label>
                <span className="text-2xs text-slate-400">% cliques → vendas</span>
              </div>
              <div className="flex items-center bg-white rounded-xl border border-slate-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all mb-1.5">
                <input type="number" value={cr || ""} onChange={e => setCr(Number(e.target.value))} min={0.1} step={0.1}
                  className="w-full px-3 py-2.5 text-sm font-semibold text-slate-800 bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                <span className="pr-3 text-sm font-bold text-slate-500">%</span>
              </div>
              {product && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold ${crStatusCfg.bg} ${crStatusCfg.border} ${crStatusCfg.color}`}>
                  {crStatus === "above" ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                  {crStatusCfg.label} — Meta: {product.requiredCR.toFixed(2)}%
                </div>
              )}
            </div>

            {product && (
              <Button
                variant="secondary"
                size="md"
                iconLeft={<Sparkles size={12} />}
                onClick={handleUseProductMetas}
                className="w-full border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
              >
                Usar metas do produto (CPC Bom + Meta CR)
              </Button>
            )}
          </div>
        </div>

        {/* RIGHT — Hero */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
          <div className={`px-5 pt-5 pb-4 border-b-2 ${vCfg.bg} ${vCfg.border}`}>
            <div className="text-2xs font-bold uppercase tracking-widest text-slate-500 mb-1">Lucro Mensal Projetado</div>
            <div className={`text-4xl font-black tabular-nums leading-none mb-3 ${main.monthlyProfit >= 0 ? "num-positive" : "num-negative"}`}>
              {fmt(main.monthlyProfit)}
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold ${vCfg.bg} ${vCfg.border} ${vCfg.color}`}>
              {vCfg.icon}
              <span>{vCfg.label}</span>
              <span className="opacity-70 text-2xs font-medium">— {vCfg.detail}</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-3 divide-x divide-y divide-slate-100">
            {kpis.map(({ label, value, icon: Icon, color, bg, help }) => (
              <div key={label} className="px-4 py-4">
                <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                  <Icon size={13} className={color} />
                </div>
                <div className="text-2xs font-bold uppercase tracking-widest text-slate-500 mb-0.5">{label}</div>
                <div className={`text-base font-bold tabular-nums leading-tight ${color}`}>{value}</div>
                <div className="text-2xs text-slate-300 mt-0.5 font-mono">{help}</div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-2xs text-slate-400 font-medium flex-wrap">
            <span>Budget: <strong className="text-slate-600">{fmt(dailyBudget)}/dia</strong></span>
            <ArrowRight size={10} />
            {fixedCostsTotal > 0 && <>
              <span>Fixos: <strong className="text-slate-600">{fmt(fixedCostsTotal / 30)}/dia</strong></span>
              <ArrowRight size={10} />
            </>}
            <span>Precisa gerar: <strong className="text-slate-600">{fmt(dailyBudget + fixedCostsTotal / 30)}/dia</strong></span>
          </div>
        </div>
      </div>

      {/* ── Comparacao Visual: Lucro vs ROI ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                <BarChart2 size={14} className="text-white" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-slate-800 leading-none">Comparacao Visual: Lucro vs ROI</div>
                <div className="text-2xs text-slate-400 mt-0.5">
                  Barras = lucro mensal por nivel de budget &nbsp;·&nbsp; Linha = ROI% &nbsp;·&nbsp; O modelo simula CPC crescente ao escalar
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 flex-shrink-0 flex-wrap text-2xs font-bold">
              <div className="flex items-center gap-1.5 text-emerald-600"><div className="w-3 h-3 rounded-sm bg-emerald-400" />Lucro positivo</div>
              <div className="flex items-center gap-1.5 text-red-500">   <div className="w-3 h-3 rounded-sm bg-red-400"     />Prejuizo</div>
              <div className="flex items-center gap-1.5 text-indigo-600"><div className="w-3 h-3 rounded-sm bg-indigo-500"  />Budget atual</div>
              <div className="flex items-center gap-1.5 text-amber-600"> <div className="w-3 h-3 rounded-sm bg-amber-400"   />Ponto otimo</div>
              <div className="flex items-center gap-1.5 text-cyan-600">  <div className="w-5 h-0.5 bg-cyan-500 rounded"     />ROI%</div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-6 pb-2">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartDataFinal} margin={{ top: 32, right: 55, left: 5, bottom: 5 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />

              {/* Left Y: Lucro mensal */}
              <YAxis
                yAxisId="profit"
                tickFormatter={v => fmtK(v)}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false} tickLine={false}
                domain={[Math.min(minP - padP, -200), maxP + padP]}
                width={62}
              />
              {/* Right Y: ROI */}
              <YAxis
                yAxisId="roi"
                orientation="right"
                tickFormatter={v => `${v.toFixed(0)}%`}
                tick={{ fontSize: 10, fill: "#22d3ee" }}
                axisLine={false} tickLine={false}
                domain={[minR - padR, maxR + padR]}
                width={42}
              />

              <RechartTooltip content={<ChartTooltip />} cursor={{ fill: "rgba(99,102,241,0.04)" }} />

              {/* Breakeven line */}
              <ReferenceLine
                yAxisId="profit" y={0}
                stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 4"
                label={{ value: "Breakeven", position: "insideTopLeft", fontSize: 9, fill: "#d97706", fontWeight: 700 }}
              />

              {/* Bars: Lucro mensal */}
              <Bar yAxisId="profit" dataKey="lucroMensal" name="Lucro/mes" radius={[5,5,0,0]} barSize={38}>
                {chartDataFinal.map((d, i) => (
                  <Cell key={`c-${i}`} fill={barColor(d)} fillOpacity={d.isOptimal || d.isCurrent ? 1 : 0.72} />
                ))}
                {/* ROI% label above each bar */}
                <LabelList
                  dataKey="roi"
                  position="top"
                  formatter={(v: unknown) => `${Number(v).toFixed(0)}%`}
                  style={{ fontSize: 9, fontWeight: 700, fill: "#64748b" }}
                />
              </Bar>

              {/* ROI line */}
              <Line
                yAxisId="roi"
                type="monotone"
                dataKey="roi"
                name="ROI %"
                stroke="#22d3ee"
                strokeWidth={2.5}
                dot={(props: any) => {
                  const d = chartDataFinal[props.index];
                  if (!d) return <circle key={props.index} />;
                  const fill = d.isOptimal ? "#f59e0b" : d.isCurrent ? "#6366f1" : "#22d3ee";
                  return (
                    <circle
                      key={props.index}
                      cx={props.cx} cy={props.cy}
                      r={d.isOptimal ? 7 : d.isCurrent ? 5 : 3}
                      fill={fill} stroke="#fff" strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
              />

              {/* Optimal star above the best ROI point */}
              {optimalBar && (
                <ReferenceDot
                  yAxisId="roi"
                  x={optimalBar.label}
                  y={optimalBar.roi}
                  r={0}
                  label={{
                    position: "top",
                    value: `OTIMO: ${optimalBar.roi.toFixed(0)}% ROI`,
                    fontSize: 9,
                    fontWeight: 800,
                    fill: "#d97706",
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Sub-legend */}
        <div className="px-5 pb-4 flex items-start gap-2 text-2xs text-slate-400">
          <AlertTriangle size={11} className="flex-shrink-0 mt-0.5 text-amber-400" />
          <span>
            O <strong className="text-slate-500">ROI%</strong> acima de cada barra muda quando voce altera CPC ou CR.
            A <strong className="text-amber-600">barra dourada</strong> e o cenario com melhor ROI —
            o modelo simula que o CPC cresce ~{Math.round((Math.pow(2, CPC_GROWTH_EXP) - 1) * 100)}% ao dobrar o budget (pressao de leilao).
            Hover em cada barra para ver o CPC estimado.
          </span>
        </div>
      </div>

      {/* ── Conclusao: Ponto Otimo ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isModelProfitable ? "bg-amber-500" : "bg-red-500"}`}>
            {isModelProfitable ? <Star size={14} className="text-white" /> : <TrendingDown size={14} className="text-white" />}
          </div>
          <div>
            <div className="text-[13px] font-bold text-slate-800 leading-none">Conclusao: Ponto Otimo de Investimento</div>
            <div className="text-2xs text-slate-400 mt-0.5">
              {isModelProfitable
                ? `Melhor ROI encontrado no cenario "${optimalBar?.label}" — ${optimalBar?.roi.toFixed(0)}% com budget de ${fmt(optimalBar?.budget ?? 0)}/dia`
                : "Modelo inviavel com esses parametros — veja o que ajustar"}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">

          {/* Inviavel */}
          {!isModelProfitable && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-bold text-red-700 mb-1">
                    Nenhum budget e lucrativo com CPC {fmt(cpc)} e CR {cr.toFixed(2)}%
                  </p>
                  <p className="text-[11px] text-red-600 leading-relaxed">
                    Cada clique gera <strong>{fmt(comm * (cr / 100))}</strong> de receita
                    mas custa <strong>{fmt(cpc)}</strong>. O custo supera o retorno — nenhum volume resolve isso estruturalmente.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-red-200">
                  <div className="text-2xs font-bold text-red-400 uppercase tracking-widest mb-1">CR minimo necessario</div>
                  <p className="text-[15px] font-bold text-red-700 tabular-nums">{((cpc / (comm || 1)) * 100).toFixed(2)}%</p>
                  <p className="text-2xs text-red-500 mt-0.5">para empatar no CPC atual</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-red-200">
                  <div className="text-2xs font-bold text-red-400 uppercase tracking-widest mb-1">CPC maximo sustentavel</div>
                  <p className="text-[15px] font-bold text-red-700 tabular-nums">{fmt(comm * (cr / 100))}</p>
                  <p className="text-2xs text-red-500 mt-0.5">com o CR atual de {cr.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Viavel */}
          {isModelProfitable && optimalBar && (
            <>
              {/* 3 KPI cards */}
              <div className="grid grid-cols-3 gap-3">
                {/* Breakeven */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="text-2xs font-bold text-amber-700 uppercase tracking-widest mb-1">Budget Minimo</div>
                  <div className="text-lg font-bold tabular-nums text-amber-700">
                    {isFinite(breakevenBudget) && breakevenBudget > 0 ? `${fmt(breakevenBudget)}/dia` : "R$0,01/dia"}
                  </div>
                  <p className="text-2xs text-amber-600 mt-1 leading-relaxed">
                    {isFinite(breakevenBudget) && breakevenBudget > 0
                      ? "Abaixo disso os custos fixos consomem todo o lucro."
                      : "Sem custos fixos: qualquer budget gera lucro."}
                  </p>
                </div>

                {/* Optimal */}
                <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={10} className="text-amber-500" fill="#f59e0b" />
                    <div className="text-2xs font-bold text-amber-700 uppercase tracking-widest">Ponto Otimo</div>
                  </div>
                  <div className="text-lg font-bold tabular-nums text-amber-700">
                    {fmt(optimalBar.budget)}/dia
                  </div>
                  <p className="text-2xs text-amber-700 mt-1 leading-relaxed font-semibold">
                    ROI {optimalBar.roi.toFixed(0)}% · Lucro {fmt(optimalBar.lucroMensal)}/mes
                  </p>
                  <p className="text-2xs text-amber-600 mt-0.5">Maior retorno por real investido.</p>
                </div>

                {/* Acima do otimo */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="text-2xs font-bold text-slate-500 uppercase tracking-widest mb-1">Acima do Otimo</div>
                  <div className="text-lg font-bold tabular-nums text-slate-600">
                    {fmt(optimalBar.budget * 2)}/dia
                  </div>
                  {(() => {
                    const above = calcWithScale(optimalBar.budget * 2, cpc, dailyBudget || 1, cr, comm, fixedCostsTotal);
                    return (
                      <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
                        ROI {above.roi.toFixed(0)}% · Lucro {fmt(above.monthlyProfit)}/mes
                        <br />CPC sobe para ~{fmt(above.adjCpc)}
                      </p>
                    );
                  })()}
                </div>
              </div>

              {/* Main message */}
              <div className={`rounded-2xl p-4 border-2 flex items-start gap-3 ${ isOptimalCurrent ? "bg-indigo-50 border-indigo-300" : isOptimalAbove ? "bg-emerald-50 border-emerald-300" : "bg-amber-50 border-amber-300" }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${ isOptimalCurrent ? "bg-indigo-600" : isOptimalAbove ? "bg-emerald-600" : "bg-amber-500" }`}>
                  {isOptimalCurrent
                    ? <CheckCircle size={14} className="text-white" />
                    : isOptimalAbove
                    ? <TrendingUp  size={14} className="text-white" />
                    : <AlertTriangle size={14} className="text-white" />}
                </div>
                <div>
                  <p className={`text-[12px] font-bold mb-1 ${ isOptimalCurrent ? "text-indigo-800" : isOptimalAbove ? "text-emerald-800" : "text-amber-800" }`}>
                    {isOptimalCurrent
                      ? "Voce ja esta no ponto otimo — escalar reduz o ROI"
                      : isOptimalAbove
                      ? `Voce tem espaco para escalar ate ${fmt(optimalBar.budget)}/dia`
                      : `Budget atual esta acima do otimo — ROI maior com ${fmt(optimalBar.budget)}/dia`}
                  </p>
                  <p className={`text-[11px] leading-relaxed ${ isOptimalCurrent ? "text-indigo-700" : isOptimalAbove ? "text-emerald-700" : "text-amber-700" }`}>
                    {isOptimalCurrent &&
                      `O modelo indica que aumentar o budget acima de ${fmt(dailyBudget)}/dia vai subir o CPC estimado e reduzir o ROI. Para escalar sem perder eficiencia, tente melhorar o CR ou negociar CPC menor antes de aumentar o budget.`}
                    {isOptimalAbove &&
                      `Com ${fmt(optimalBar.budget)}/dia voce teria ROI de ${optimalBar.roi.toFixed(0)}% e lucro de ${fmt(optimalBar.lucroMensal)}/mes — melhor que o cenario atual (${main.roi.toFixed(0)}% ROI). A partir desse ponto, o CPC aumenta mais que a receita e o ROI comeca a cair.`}
                    {!isOptimalCurrent && !isOptimalAbove &&
                      `O ponto de maior ROI esta em ${fmt(optimalBar.budget)}/dia (${optimalBar.label}). No budget atual de ${fmt(dailyBudget)}/dia, o CPC estimado e mais alto e come a margem. Considere reduzir o lance maximo para atingir o budget otimo.`}
                  </p>
                </div>
              </div>

              {/* Model caveat */}
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <AlertTriangle size={11} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-2xs text-slate-500 leading-relaxed">
                  <strong>Modelo simplificado:</strong> o crescimento de CPC e estimado com expoente de {CPC_GROWTH_EXP} (dobrando o budget o CPC sobe ~{Math.round((Math.pow(2, CPC_GROWTH_EXP) - 1) * 100)}%).
                  Na pratica, varia por nicho, horario e concorrencia. Use como orientacao — valide sempre com dados reais da campanha.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Cenarios Comparativos ────────────────────────────────────────────── */}
      <div>
        <p className="text-2xs font-bold uppercase tracking-widest text-slate-500 mb-3">Cenarios Comparativos</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map(s => {
            const sv    = getViability(s.data.roi, s.data.profit);
            const svCfg = VIAB_CFG[sv];
            return (
              <div key={s.id} className={`bg-white rounded-2xl border transition-all ${s.active ? "border-slate-900 ring-2 ring-slate-900/10 " : "border-slate-200 hover:border-slate-300"}`}>
                <div className={`px-4 py-3 flex items-center justify-between border-b ${s.active ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-100"}`}>
                  <div>
                    <div className={`text-[11px] font-bold uppercase tracking-wide ${s.active ? "text-white" : "text-slate-700"}`}>{s.label}</div>
                    <div className={`text-2xs mt-0.5 ${s.active ? "text-slate-400" : "text-slate-400"}`}>{s.badge}</div>
                  </div>
                  {s.active
                    ? <span className="text-2xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">ATIVO</span>
                    : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (s.id === "conservador") { setDailyBudget(Math.round(dailyBudget * 0.7)); setCr(+(cr * 0.9).toFixed(2)); }
                          if (s.id === "agressivo")   setDailyBudget(Math.round(dailyBudget * 1.5));
                        }}
                      >
                        Aplicar
                      </Button>
                    )
                  }
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-2xs font-bold uppercase tracking-widest text-slate-500 mb-0.5">Lucro Mensal</div>
                    <div className={`text-2xl font-black tabular-nums ${s.data.monthlyProfit >= 0 ? "num-positive" : "num-negative"}`}>{fmt(s.data.monthlyProfit)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <div className="text-2xs font-bold uppercase tracking-widest text-slate-500">ROI</div>
                      <div className={`text-sm font-bold tabular-nums mt-0.5 ${s.data.roi >= 0 ? "num-positive" : "num-negative"}`}>{s.data.roi.toFixed(1)}%</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5">
                      <div className="text-2xs font-bold uppercase tracking-widest text-slate-500">Budget/dia</div>
                      <div className="text-sm font-bold tabular-nums text-slate-700 mt-0.5">
                        {s.id === "conservador" ? fmt(dailyBudget * 0.7) : s.id === "agressivo" ? fmt(dailyBudget * 1.5) : fmt(dailyBudget)}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-2xs font-bold ${svCfg.bg} ${svCfg.border} ${svCfg.color}`}>
                    {svCfg.icon}{svCfg.label}
                    <span className="opacity-70 text-2xs font-medium">— {svCfg.detail}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
