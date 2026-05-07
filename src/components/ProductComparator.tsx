import React, { useState, useMemo } from "react";
import {
  TrendingUp, DollarSign, Target, BarChart2, Trophy,
  BadgePercent, AlertTriangle, CheckCircle, Minus,
  MousePointer2, Percent, ShoppingCart, Zap,
} from "lucide-react";
import type { Product, Campaign } from "../types";

interface ProductComparatorProps {
  products: Product[];
  campaigns: Campaign[];
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtX = (v: number) => `${v.toFixed(2)}x`;
const fmtPct = (v: number) => `${v.toFixed(1)}%`;

// ── Extended stats from campaigns ─────────────────────────────────────────────
function buildStats(id: string, campaigns: Campaign[]) {
  const camps = campaigns.filter((c) => c.productId === id);
  if (camps.length === 0) return null;

  const spend   = camps.reduce((s, c) => s + c.spend,   0);
  const revenue = camps.reduce((s, c) => s + c.revenue, 0);
  const profit  = camps.reduce((s, c) => s + c.profit,  0);

  const avgROAS = camps.reduce((s, c) => s + c.roas, 0) / camps.length;
  const avgROI  = camps.reduce((s, c) => s + c.roi,  0) / camps.length;

  const cpcCamps = camps.filter((c) => c.cpc > 0);
  const avgCpc = cpcCamps.length ? cpcCamps.reduce((s, c) => s + c.cpc, 0) / cpcCamps.length : 0;

  const crCamps = camps.filter((c) => c.cr > 0);
  const avgCr = crCamps.length ? crCamps.reduce((s, c) => s + c.cr, 0) / crCamps.length : 0;

  const cpaCamps = camps.filter((c) => c.conversions > 0);
  const avgCpa = cpaCamps.length
    ? cpaCamps.reduce((s, c) => s + c.spend / c.conversions, 0) / cpaCamps.length
    : 0;

  const bestCampaign = [...camps].sort((a, b) => b.roi - a.roi)[0] ?? null;

  return { spend, revenue, profit, avgROAS, avgROI, avgCpc, avgCr, avgCpa, bestCampaign, count: camps.length };
}

// ── Battle bar %: how much of the total does A represent ──────────────────────
function battlePct(a: number, b: number): number {
  const total = Math.abs(a) + Math.abs(b);
  return total > 0 ? (Math.abs(a) / total) * 100 : 50;
}

// ── Determine winner for a metric ─────────────────────────────────────────────
function winner(a: number, b: number, higherWins: boolean): "a" | "b" | "tie" {
  if (Math.abs(a - b) < 0.001) return "tie";
  return higherWins ? (a > b ? "a" : "b") : (a < b ? "a" : "b");
}

// ── Battle row component ───────────────────────────────────────────────────────
const BattleRow: React.FC<{
  label: string;
  icon: React.ReactNode;
  valueA: string;
  valueB: string;
  rawA: number;
  rawB: number;
  higherWins: boolean;
  hasDataA: boolean;
  hasDataB: boolean;
}> = ({ label, icon, valueA, valueB, rawA, rawB, higherWins, hasDataA, hasDataB }) => {
  const w = (hasDataA && hasDataB) ? winner(rawA, rawB, higherWins) : "tie";
  const pctA = battlePct(rawA, rawB);
  const pctB = 100 - pctA;

  const winStyle = "font-black text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1";
  const loseStyle = "font-semibold text-slate-500 px-2 py-1";
  const tieStyle = "font-semibold text-slate-600 px-2 py-1";

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2.5 border-b border-slate-100 last:border-0">
      {/* Value A */}
      <div className="flex justify-end">
        <span className={`text-sm tabular-nums ${w === "a" ? winStyle : w === "tie" ? tieStyle : loseStyle}`}>
          {hasDataA ? valueA : "—"}
        </span>
      </div>

      {/* Center: label + battle bar */}
      <div className="flex flex-col items-center gap-1 min-w-[120px]">
        <div className="flex items-center gap-1 text-2xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">
          <span className="text-slate-300">{icon}</span>
          {label}
        </div>
        {hasDataA && hasDataB && rawA + rawB > 0 && (
          <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-slate-100">
            <div
              className={`h-full rounded-l-full transition-all duration-500 ${w === "a" ? "bg-cyan-400" : w === "b" ? "bg-slate-300" : "bg-slate-300"}`}
              style={{ width: `${pctA}%` }}
            />
            <div
              className={`h-full rounded-r-full transition-all duration-500 ${w === "b" ? "bg-violet-400" : w === "a" ? "bg-slate-200" : "bg-slate-200"}`}
              style={{ width: `${pctB}%` }}
            />
          </div>
        )}
      </div>

      {/* Value B */}
      <div className="flex justify-start">
        <span className={`text-sm tabular-nums ${w === "b" ? winStyle : w === "tie" ? tieStyle : loseStyle}`}>
          {hasDataB ? valueB : "—"}
        </span>
      </div>
    </div>
  );
};

// ── Spec row (no battle, just comparison) ─────────────────────────────────────
const SpecRow: React.FC<{
  label: string;
  icon: React.ReactNode;
  valueA: string;
  valueB: string;
}> = ({ label, icon, valueA, valueB }) => (
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2.5 border-b border-slate-100 last:border-0">
    <div className="flex justify-end">
      <span className="text-sm font-semibold text-slate-700 tabular-nums px-2 py-1">{valueA}</span>
    </div>
    <div className="flex items-center gap-1.5 text-2xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap min-w-[120px] justify-center">
      <span className="text-slate-300">{icon}</span>
      {label}
    </div>
    <div className="flex justify-start">
      <span className="text-sm font-semibold text-slate-700 tabular-nums px-2 py-1">{valueB}</span>
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
export const ProductComparator: React.FC<ProductComparatorProps> = ({
  products,
  campaigns,
}) => {
  const [idA, setIdA] = useState<string>(products[0]?.id ?? "");
  const [idB, setIdB] = useState<string>(products[1]?.id ?? products[0]?.id ?? "");

  const productA = products.find((p) => p.id === idA) ?? null;
  const productB = products.find((p) => p.id === idB) ?? null;
  const statsA = useMemo(() => buildStats(idA, campaigns), [idA, campaigns]);
  const statsB = useMemo(() => buildStats(idB, campaigns), [idB, campaigns]);

  // Head-to-head score
  const score = useMemo(() => {
    if (!statsA || !statsB) return { a: 0, b: 0, tie: 0, total: 0 };
    const criteria: Array<{ a: number; b: number; higherWins: boolean }> = [
      { a: statsA.count,   b: statsB.count,   higherWins: true  },
      { a: statsA.revenue, b: statsB.revenue,  higherWins: true  },
      { a: statsA.profit,  b: statsB.profit,   higherWins: true  },
      { a: statsA.avgROAS, b: statsB.avgROAS,  higherWins: true  },
      { a: statsA.avgROI,  b: statsB.avgROI,   higherWins: true  },
      { a: statsA.avgCpc,  b: statsB.avgCpc,   higherWins: false },
      { a: statsA.avgCr,   b: statsB.avgCr,    higherWins: true  },
      { a: statsA.avgCpa,  b: statsB.avgCpa,   higherWins: false },
      { a: statsA.spend,   b: statsB.spend,    higherWins: false },
    ];
    return criteria.reduce(
      (acc, { a, b, higherWins }) => {
        const w = winner(a, b, higherWins);
        return { ...acc, [w]: acc[w as keyof typeof acc] + 1, total: acc.total + 1 };
      },
      { a: 0, b: 0, tie: 0, total: 0 }
    );
  }, [statsA, statsB]);

  const overallWinner: "a" | "b" | "tie" =
    score.a > score.b ? "a" : score.b > score.a ? "b" : "tie";
  const winnerProduct = overallWinner === "a" ? productA : overallWinner === "b" ? productB : null;

  const hasBothStats = statsA !== null && statsB !== null;

  return (
    <div className="space-y-5 pb-10">

      {/* ── Split Dark Header ────────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-700/40 shadow-lg"
        style={{ background: "linear-gradient(135deg, #0A0E1A 0%, #0E2233 50%, #0A1628 100%)" }}
      >
        {/* Dot matrix */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(34,211,238,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative px-5 py-4">
          {/* Selects row */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
            {/* Select A */}
            <div>
              <div className="text-[8px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(34,211,238,0.60)" }}>Produto A</div>
              <select
                value={idA}
                onChange={(e) => setIdA(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold text-white outline-none cursor-pointer transition-all"
                style={{ background: "rgba(34,211,238,0.10)", border: "1px solid rgba(34,211,238,0.25)" }}
              >
                {products.map((p) => <option key={p.id} value={p.id} style={{ background: "#0F172A" }}>{p.name}</option>)}
              </select>
            </div>

            {/* VS badge */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.70)" }}
              >
                VS
              </div>
            </div>

            {/* Select B */}
            <div>
              <div className="text-[8px] font-semibold uppercase tracking-widest mb-1.5 text-right" style={{ color: "rgba(167,139,250,0.70)" }}>Produto B</div>
              <select
                value={idB}
                onChange={(e) => setIdB(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold text-white outline-none cursor-pointer transition-all"
                style={{ background: "rgba(167,139,250,0.10)", border: "1px solid rgba(167,139,250,0.25)" }}
              >
                {products.map((p) => <option key={p.id} value={p.id} style={{ background: "#0F172A" }}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* Product chips row */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
            {/* Product A info */}
            <div className="flex items-start gap-2 flex-wrap">
              {productA?.nicho && (
                <span className="text-2xs font-bold px-2 py-0.5 rounded-md"
                  style={{ background: "rgba(34,211,238,0.10)", color: "rgba(34,211,238,0.80)", border: "1px solid rgba(34,211,238,0.20)" }}>
                  {productA.nicho}
                </span>
              )}
              {productA?.funnelStage && (
                <span className="text-2xs font-bold px-2 py-0.5 rounded-md uppercase"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  {productA.funnelStage}
                </span>
              )}
              {productA && (
                <span className="text-2xs font-bold px-2 py-0.5 rounded-md"
                  style={{ background: "rgba(34,211,238,0.08)", color: "rgba(34,211,238,0.65)", border: "1px solid rgba(34,211,238,0.15)" }}>
                  {fmt(productA.commissionLiquid)}
                </span>
              )}
            </div>

            <div className="w-10" />

            {/* Product B info */}
            <div className="flex items-start gap-2 flex-wrap justify-end">
              {productB?.nicho && (
                <span className="text-2xs font-bold px-2 py-0.5 rounded-md"
                  style={{ background: "rgba(167,139,250,0.10)", color: "rgba(167,139,250,0.80)", border: "1px solid rgba(167,139,250,0.20)" }}>
                  {productB.nicho}
                </span>
              )}
              {productB?.funnelStage && (
                <span className="text-2xs font-bold px-2 py-0.5 rounded-md uppercase"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  {productB.funnelStage}
                </span>
              )}
              {productB && (
                <span className="text-2xs font-bold px-2 py-0.5 rounded-md"
                  style={{ background: "rgba(167,139,250,0.08)", color: "rgba(167,139,250,0.65)", border: "1px solid rgba(167,139,250,0.15)" }}>
                  {fmt(productB.commissionLiquid)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Winner Banner ────────────────────────────────────────────────────── */}
      {hasBothStats && (
        <div className={`rounded-2xl border px-5 py-4 ${
          overallWinner !== "tie"
            ? "bg-emerald-50 border-emerald-200"
            : "bg-amber-50 border-amber-200"
        }`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {overallWinner !== "tie" ? (
                <Trophy size={20} className="text-emerald-600 flex-shrink-0" />
              ) : (
                <Minus size={20} className="text-amber-600 flex-shrink-0" />
              )}
              <div>
                {overallWinner !== "tie" ? (
                  <>
                    <div className="text-sm font-bold text-emerald-800">
                      {winnerProduct?.name ?? "—"} vence
                    </div>
                    <div className="text-[11px] font-medium text-emerald-600 mt-0.5">
                      {Math.max(score.a, score.b)} de {score.total} métricas analisadas
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-bold text-amber-800">Empate técnico</div>
                    <div className="text-[11px] font-medium text-amber-600 mt-0.5">
                      {score.a} vs {score.b} métricas (com {score.tie} empates)
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Score bar */}
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold text-cyan-700 bg-cyan-100 px-2 py-1 rounded-lg">A: {score.a}</span>
              <div className="w-24 h-2 rounded-full overflow-hidden bg-slate-200 flex">
                <div className="bg-cyan-400 h-full rounded-l-full transition-all duration-500"
                  style={{ width: `${score.total > 0 ? (score.a / score.total) * 100 : 50}%` }} />
                <div className="bg-violet-400 h-full rounded-r-full transition-all duration-500"
                  style={{ width: `${score.total > 0 ? (score.b / score.total) * 100 : 50}%` }} />
              </div>
              <span className="text-2xs font-bold text-violet-700 bg-violet-100 px-2 py-1 rounded-lg">B: {score.b}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Battle Rows: Performance ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Section header */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-slate-100 bg-slate-50">
          <div className="px-5 py-3 flex items-center justify-end gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-sm font-bold text-slate-800 truncate">{productA?.name ?? "Produto A"}</span>
          </div>
          <div className="px-4 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">
            Performance
          </div>
          <div className="px-5 py-3 flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 truncate">{productB?.name ?? "Produto B"}</span>
            <div className="w-2 h-2 rounded-full bg-violet-400" />
          </div>
        </div>

        {/* No data state */}
        {!hasBothStats && (
          <div className="py-10 flex flex-col items-center gap-3 text-center px-8">
            <BarChart2 size={28} className="text-slate-200" />
            <p className="text-sm font-semibold text-slate-400">
              {!statsA && !statsB
                ? "Nenhum produto tem campanhas registradas"
                : !statsA
                ? `${productA?.name ?? "Produto A"} ainda não tem campanhas`
                : `${productB?.name ?? "Produto B"} ainda não tem campanhas`}
            </p>
            <p className="text-[11px] text-slate-300 leading-snug">
              Salve campanhas na aba Análise para comparar desempenho
            </p>
          </div>
        )}

        {/* Battle rows */}
        {hasBothStats && (
          <div className="px-5">
            <BattleRow label="Campanhas"    icon={<BarChart2 size={9} />}      valueA={String(statsA!.count)}               valueB={String(statsB!.count)}               rawA={statsA!.count}   rawB={statsB!.count}   higherWins={true}  hasDataA={true} hasDataB={true} />
            <BattleRow label="Receita"      icon={<DollarSign size={9} />}     valueA={fmt(statsA!.revenue)}                valueB={fmt(statsB!.revenue)}                rawA={statsA!.revenue} rawB={statsB!.revenue} higherWins={true}  hasDataA={true} hasDataB={true} />
            <BattleRow label="Lucro"        icon={<TrendingUp size={9} />}     valueA={fmt(statsA!.profit)}                 valueB={fmt(statsB!.profit)}                 rawA={statsA!.profit}  rawB={statsB!.profit}  higherWins={true}  hasDataA={true} hasDataB={true} />
            <BattleRow label="ROAS med"     icon={<Zap size={9} />}            valueA={fmtX(statsA!.avgROAS)}               valueB={fmtX(statsB!.avgROAS)}               rawA={statsA!.avgROAS} rawB={statsB!.avgROAS} higherWins={true}  hasDataA={true} hasDataB={true} />
            <BattleRow label="ROI med"      icon={<Percent size={9} />}        valueA={fmtPct(statsA!.avgROI)}              valueB={fmtPct(statsB!.avgROI)}              rawA={statsA!.avgROI}  rawB={statsB!.avgROI}  higherWins={true}  hasDataA={true} hasDataB={true} />
            <BattleRow label="CPC med"      icon={<MousePointer2 size={9} />}  valueA={statsA!.avgCpc > 0 ? fmt(statsA!.avgCpc) : "—"} valueB={statsB!.avgCpc > 0 ? fmt(statsB!.avgCpc) : "—"} rawA={statsA!.avgCpc} rawB={statsB!.avgCpc} higherWins={false} hasDataA={statsA!.avgCpc > 0} hasDataB={statsB!.avgCpc > 0} />
            <BattleRow label="CR med"       icon={<Target size={9} />}         valueA={statsA!.avgCr > 0 ? fmtPct(statsA!.avgCr) : "—"}   valueB={statsB!.avgCr > 0 ? fmtPct(statsB!.avgCr) : "—"}   rawA={statsA!.avgCr}   rawB={statsB!.avgCr}   higherWins={true}  hasDataA={statsA!.avgCr > 0}   hasDataB={statsB!.avgCr > 0} />
            <BattleRow label="CPA med"      icon={<ShoppingCart size={9} />}   valueA={statsA!.avgCpa > 0 ? fmt(statsA!.avgCpa) : "—"}     valueB={statsB!.avgCpa > 0 ? fmt(statsB!.avgCpa) : "—"}     rawA={statsA!.avgCpa}  rawB={statsB!.avgCpa}  higherWins={false} hasDataA={statsA!.avgCpa > 0}  hasDataB={statsB!.avgCpa > 0} />
            <BattleRow label="Gasto"        icon={<DollarSign size={9} />}     valueA={fmt(statsA!.spend)}                  valueB={fmt(statsB!.spend)}                  rawA={statsA!.spend}   rawB={statsB!.spend}   higherWins={false} hasDataA={true} hasDataB={true} />
          </div>
        )}
      </div>

      {/* ── Specs do Produto ─────────────────────────────────────────────────── */}
      {(productA || productB) && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-slate-100 bg-slate-50">
            <div className="px-5 py-3 flex items-center justify-end gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-sm font-bold text-slate-800 truncate">{productA?.name ?? "—"}</span>
            </div>
            <div className="px-4 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">
              Specs do Produto
            </div>
            <div className="px-5 py-3 flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 truncate">{productB?.name ?? "—"}</span>
              <div className="w-2 h-2 rounded-full bg-violet-400" />
            </div>
          </div>
          <div className="px-5">
            <SpecRow label="Comissao"    icon={<BadgePercent size={9} />}    valueA={productA ? fmt(productA.commissionLiquid) : "—"}         valueB={productB ? fmt(productB.commissionLiquid) : "—"} />
            <SpecRow label="CPC Bom"     icon={<MousePointer2 size={9} />}   valueA={productA ? fmt(productA.cpcBom) : "—"}                   valueB={productB ? fmt(productB.cpcBom) : "—"} />
            <SpecRow label="Meta CR"     icon={<Target size={9} />}          valueA={productA ? fmtPct(productA.requiredCR) : "—"}            valueB={productB ? fmtPct(productB.requiredCR) : "—"} />
            <SpecRow label="Funil"       icon={<Zap size={9} />}             valueA={productA?.funnelStage ?? "—"}                            valueB={productB?.funnelStage ?? "—"} />
            <SpecRow label="Plataforma"  icon={<BarChart2 size={9} />}       valueA={productA?.platform ?? "—"}                               valueB={productB?.platform ?? "—"} />
            {(productA?.viabilityScore !== undefined || productB?.viabilityScore !== undefined) && (
              <SpecRow label="Score"     icon={<CheckCircle size={9} />}     valueA={productA?.viabilityScore !== undefined ? `${productA.viabilityScore}/100` : "—"} valueB={productB?.viabilityScore !== undefined ? `${productB.viabilityScore}/100` : "—"} />
            )}
          </div>
        </div>
      )}

      {/* ── Melhores Campanhas ───────────────────────────────────────────────── */}
      {hasBothStats && (
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Melhor Campanha de Cada</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              { product: productA, stats: statsA, accent: "cyan" },
              { product: productB, stats: statsB, accent: "violet" },
            ] as const).map(({ product: p, stats: s, accent }) => {
              const best = s?.bestCampaign ?? null;
              const accentMap = {
                cyan:   { ring: "ring-cyan-200",   bg: "bg-cyan-50",   border: "border-cyan-200",   header: "bg-cyan-900",   dot: "bg-cyan-400",   text: "text-cyan-300" },
                violet: { ring: "ring-violet-200", bg: "bg-violet-50", border: "border-violet-200", header: "bg-violet-900", dot: "bg-violet-400", text: "text-violet-300" },
              };
              const ac = accentMap[accent];
              return (
                <div key={accent} className={`bg-white rounded-2xl border ${ac.border} overflow-hidden`}>
                  <div className={`px-4 py-3 flex items-center gap-2 ${ac.bg} border-b ${ac.border}`}>
                    <div className={`w-2 h-2 rounded-full ${ac.dot}`} />
                    <div>
                      <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                        Melhor Campanha
                      </div>
                      <div className="text-2xs text-slate-500 font-medium truncate">{p?.name ?? "—"}</div>
                    </div>
                  </div>

                  {best ? (
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {[
                        { label: "ROI",      value: fmtPct(best.roi),    color: best.roi >= 0 ? "text-emerald-600" : "text-red-500" },
                        { label: "ROAS",     value: fmtX(best.roas),     color: best.roas >= 1.5 ? "text-emerald-600" : "text-amber-600" },
                        { label: "Lucro",    value: fmt(best.profit),    color: best.profit >= 0 ? "text-emerald-600" : "text-red-500" },
                        { label: "Data",     value: new Date(best.date).toLocaleDateString("pt-BR"), color: "text-slate-700" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-2.5">
                          <div className="text-[8px] font-semibold uppercase tracking-widest text-slate-400">{label}</div>
                          <div className={`text-sm font-bold tabular-nums mt-0.5 ${color}`}>{value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 flex flex-col items-center gap-2 text-center">
                      <AlertTriangle size={18} className="text-slate-200" />
                      <p className="text-xs font-semibold text-slate-400">Sem campanhas registradas</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
