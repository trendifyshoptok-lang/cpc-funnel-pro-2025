import React, { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Settings,
  BarChart2,
  FileText,
  ArrowRight,
  Activity,
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  FlaskConical,
  Trash2,
} from "lucide-react";
import type { Product, Campaign, OperationalCosts } from "../types";
import { MetricTile } from "./ui/MetricTile";
import { StatusDot } from "./ui/StatusDot";

interface TodayPanelProps {
  products: Product[];
  history: Campaign[];
  currentProduct: Product | null;
  fixedCosts: OperationalCosts;
  fixedCostsTotal: number;
  onChangeTab: (tab: string) => void;
  onSelectProduct?: (product: Product) => void;
  onLoadSeedData?: () => void;
  onClearSeedData?: () => void;
  hasSeedData?: boolean;
  userName?: string;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function fmt(value: number | undefined | null): string {
  return (value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtPct(value: number | undefined | null): string {
  return `${(value ?? 0).toFixed(1)}%`;
}

/** Build a sparkline array from the last N days of campaign data */
function buildDailySparkline(
  history: Campaign[],
  key: "revenue" | "profit" | "spend",
  days = 7
): number[] {
  const result: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const sum = history
      .filter((c) => {
        const d = new Date(c.date).getTime();
        return d >= dayStart.getTime() && d < dayEnd.getTime();
      })
      .reduce((s, c) => s + c[key], 0);
    result.push(sum);
  }
  return result;
}

const QuickAction: React.FC<{
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  description: string;
  tab: string;
  onChangeTab: (tab: string) => void;
  accentVar?: string;
}> = ({ icon: Icon, label, description, tab, onChangeTab, accentVar = "var(--accent)" }) => (
  <button
    onClick={() => onChangeTab(tab)}
    className="card-interactive flex items-start gap-3 p-4 text-left group"
    style={{ background: "var(--bg-card)" }}
  >
    <div
      className="mt-0.5 flex-shrink-0 p-1.5 rounded-lg"
      style={{ background: `${accentVar}15`, color: accentVar }}
    >
      <Icon size={14} />
    </div>
    <div className="min-w-0 flex-1">
      <p
        className="text-[13px] font-semibold leading-snug"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-ui)", letterSpacing: "-0.01em" }}
      >
        {label}
      </p>
      <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {description}
      </p>
    </div>
    <ArrowRight
      size={13}
      className="flex-shrink-0 mt-0.5"
      style={{
        color: "var(--border-strong)",
        transition: `color var(--motion-fast) var(--ease-out)`,
      }}
    />
  </button>
);

export const TodayPanel: React.FC<TodayPanelProps> = ({
  products,
  history,
  currentProduct,
  onChangeTab,
  onSelectProduct,
  onLoadSeedData,
  onClearSeedData,
  hasSeedData,
  userName,
}) => {
  const lastCampaign = useMemo(
    () =>
      [...history].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0] ?? null,
    [history]
  );

  const sevenDaysAgo   = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentActivity = history.filter((c) => new Date(c.date).getTime() >= sevenDaysAgo);
  const weekProfit     = recentActivity.reduce((s, c) => s + c.profit, 0);
  const weekRevenue    = recentActivity.reduce((s, c) => s + c.revenue, 0);
  const weekSpend      = recentActivity.reduce((s, c) => s + c.spend, 0);

  const prevWeekStart  = sevenDaysAgo - 7 * 24 * 60 * 60 * 1000;
  const prevActivity   = history.filter((c) => {
    const t = new Date(c.date).getTime();
    return t >= prevWeekStart && t < sevenDaysAgo;
  });
  const prevWeekRevenue = prevActivity.reduce((s, c) => s + c.revenue, 0);
  const prevWeekProfit  = prevActivity.reduce((s, c) => s + c.profit, 0);

  const revenueDelta = prevWeekRevenue > 0
    ? ((weekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100
    : undefined;
  const profitDelta  = prevWeekProfit !== 0
    ? ((weekProfit - prevWeekProfit) / Math.abs(prevWeekProfit)) * 100
    : undefined;

  const totalRevenue = history.reduce((s, c) => s + c.revenue, 0);
  const totalProfit  = history.reduce((s, c) => s + c.profit, 0);

  const profitableProducts = products.filter((p) => {
    const camps = history.filter((c) => c.productId === p.id);
    return camps.length > 0 && camps.reduce((s, c) => s + c.profit, 0) > 0;
  });

  const revenueSparkline = buildDailySparkline(history, "revenue", 7);
  const profitSparkline  = buildDailySparkline(history, "profit",  7);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const isRecentCampaign =
    lastCampaign &&
    Date.now() - new Date(lastCampaign.date).getTime() < 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-4">

      {/* ─── BANNER DADOS DE EXEMPLO ───────────────────────── */}
      {onLoadSeedData && !hasSeedData && (
        <div
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(14,116,144,0.08) 100%)",
            border: "1px solid rgba(6,182,212,0.25)",
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)" }}
              >
                <FlaskConical size={16} style={{ color: "#06B6D4" }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-ui)" }}>
                  Nenhum dado encontrado
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>
                  Carregue dados de demonstracao para ver todos os graficos em acao
                </p>
              </div>
            </div>
            <button
              onClick={onLoadSeedData}
              className="px-4 py-2 rounded-xl text-[12px] font-bold flex-shrink-0 transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #06B6D4, #0891B2)",
                color: "#fff",
                fontFamily: "var(--font-ui)",
                boxShadow: "0 2px 8px rgba(6,182,212,0.35)",
              }}
            >
              Carregar dados de exemplo
            </button>
          </div>
        </div>
      )}

      {onLoadSeedData && hasSeedData && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl"
          style={{
            background: "rgba(16,185,129,0.07)",
            border: "1px solid rgba(16,185,129,0.18)",
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={13} style={{ color: "#10B981", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-ui)" }}>
              Dados de exemplo carregados. Explore o dashboard!
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onLoadSeedData}
              className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
              style={{
                background: "rgba(16,185,129,0.12)",
                color: "#10B981",
                border: "1px solid rgba(16,185,129,0.2)",
                fontFamily: "var(--font-ui)",
              }}
            >
              Recarregar
            </button>
            {onClearSeedData && (
              <button
                onClick={onClearSeedData}
                className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  color: "#EF4444",
                  border: "1px solid rgba(239,68,68,0.18)",
                  fontFamily: "var(--font-ui)",
                }}
              >
                Limpar dados
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── HERO ─────────────────────────────────────────── */}
      <div
        className="rounded-[18px] p-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0A0E1A 0%, #0E2233 50%, #0A1628 100%)",
        }}
      >
        {/* Dot matrix bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(34,211,238,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Glow orb */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(14,116,144,0.20) 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />

        {/* 2-col grid: greeting left, stats right */}
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">

          {/* ── LEFT: date + name greeting ── */}
          <div className="flex-1 min-w-0">
            <p
              className="text-2xs font-bold uppercase mb-3"
              style={{
                color: "rgba(34,211,238,0.70)",
                letterSpacing: "0.14em",
                fontFamily: "var(--font-ui)",
              }}
            >
              {today}
            </p>

            <h1
              className="font-display leading-[1.05] mb-1"
              style={{ fontSize: 40, color: "#FFFFFF" }}
            >
              {greeting()},
            </h1>
            <h1
              className="font-display leading-[1.05]"
              style={{ fontSize: 40, color: "rgba(250,250,249,0.60)" }}
            >
              {userName || "Bem-vindo"}
            </h1>

            <p
              className="mt-3 text-[13px]"
              style={{ color: "rgba(250,250,249,0.45)", fontFamily: "var(--font-body)" }}
            >
              {products.length === 0
                ? "Comece mapeando seu primeiro produto."
                : `${products.length} produto${products.length !== 1 ? "s" : ""} no portfolio · ${history.length} campanha${history.length !== 1 ? "s" : ""} registrada${history.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* ── RIGHT: stat cards + trend pill ── */}
          <div className="flex-shrink-0 flex flex-col gap-2.5 sm:items-end">

            {/* Stat cards row */}
            <div className="flex gap-2.5">
              {/* Receita total */}
              <div
                className="px-4 py-3 rounded-2xl flex flex-col gap-0.5 min-w-[120px]"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <span
                  className="text-2xs font-bold uppercase"
                  style={{ color: "rgba(250,250,249,0.35)", letterSpacing: "0.10em", fontFamily: "var(--font-ui)" }}
                >
                  Receita total
                </span>
                <span
                  className="tnum text-[17px] font-black leading-tight"
                  style={{ color: "var(--accent-glow)", fontFamily: "var(--font-ui)" }}
                >
                  {fmt(totalRevenue)}
                </span>
              </div>

              {/* Lucro total */}
              <div
                className="px-4 py-3 rounded-2xl flex flex-col gap-0.5 min-w-[120px]"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <span
                  className="text-2xs font-bold uppercase"
                  style={{ color: "rgba(250,250,249,0.35)", letterSpacing: "0.10em", fontFamily: "var(--font-ui)" }}
                >
                  Lucro total
                </span>
                <span
                  className="tnum text-[17px] font-black leading-tight"
                  style={{ color: totalProfit >= 0 ? "#34d399" : "#f87171", fontFamily: "var(--font-ui)" }}
                >
                  {fmt(totalProfit)}
                </span>
              </div>
            </div>

            {/* 7-day trend pill */}
            {weekProfit !== 0 && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg self-start sm:self-end"
                style={{
                  background: weekProfit > 0
                    ? "rgba(5,150,105,0.15)"
                    : "rgba(220,38,38,0.15)",
                  border: `1px solid ${weekProfit > 0 ? "rgba(5,150,105,0.30)" : "rgba(220,38,38,0.30)"}`,
                }}
              >
                {weekProfit > 0
                  ? <TrendingUp size={12} style={{ color: "#34d399" }} />
                  : <TrendingDown size={12} style={{ color: "#f87171" }} />}
                <span
                  className="tnum text-[12px] font-semibold"
                  style={{ color: weekProfit > 0 ? "#34d399" : "#f87171" }}
                >
                  {weekProfit > 0 ? "+" : ""}
                  {fmt(weekProfit)} · 7 dias
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: "rgba(250,250,249,0.30)" }}
                >
                  gasto: <span className="tnum">{fmt(weekSpend)}</span>
                </span>
              </div>
            )}

            {/* Empty state hint when no history */}
            {history.length === 0 && (
              <div
                className="px-4 py-3 rounded-2xl text-center"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  minWidth: 240,
                }}
              >
                <p className="text-[11px]" style={{ color: "rgba(250,250,249,0.35)", fontFamily: "var(--font-ui)" }}>
                  Registre campanhas para ver os totais aqui
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ─── METRIC TILES ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTile
          label="Produtos"
          value={products.length}
          format={(v) => Math.round(v).toString()}
          icon={<Zap size={11} />}
        />
        <MetricTile
          label="Lucrativos"
          value={profitableProducts.length}
          format={(v) => `${Math.round(v)}/${products.length}`}
          status={profitableProducts.length > 0 ? "positive" : "neutral"}
        />
        <MetricTile
          label="Receita 7d"
          value={weekRevenue}
          format={fmt}
          delta={revenueDelta}
          sparkline={revenueSparkline}
          status={weekRevenue > 0 ? "positive" : "neutral"}
        />
        <MetricTile
          label="Lucro 7d"
          value={weekProfit}
          format={fmt}
          delta={profitDelta}
          sparkline={profitSparkline}
          status={weekProfit >= 0 ? "positive" : "negative"}
        />
      </div>

      {/* ─── ACTIVE PRODUCT + LAST CAMPAIGN ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

        {/* Active Product */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">Produto Ativo</p>
            {currentProduct && products.length > 1 && onSelectProduct && (
              <button
                onClick={() => onSelectProduct(null as unknown as Product)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md transition-all hover:opacity-80"
                style={{
                  color: "var(--text-muted)",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-subtle)",
                  fontFamily: "var(--font-ui)",
                }}
                title="Trocar produto ativo"
              >
                Trocar
              </button>
            )}
          </div>

          {currentProduct ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className="text-[14px] font-semibold"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-ui)", letterSpacing: "-0.01em" }}
                  >
                    {currentProduct.name}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {currentProduct.nicho} · {currentProduct.platform ?? "—"}
                  </p>
                </div>
                <div>
                  {currentProduct.viabilityStatus === "APROVADO" ? (
                    <span className="badge badge-success">
                      <CheckCircle size={9} /> Aprovado
                    </span>
                  ) : currentProduct.viabilityStatus === "REPROVADO" ? (
                    <span className="badge badge-danger">
                      <AlertCircle size={9} /> Reprovado
                    </span>
                  ) : (
                    <span className="badge badge-warn">
                      <Clock size={9} /> Risco
                    </span>
                  )}
                </div>
              </div>

              {/* CPC metrics row */}
              <div
                className="grid grid-cols-3 gap-2 rounded-lg p-3"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)" }}
              >
                {[
                  { label: "CPC Bom",   val: currentProduct.cpcBom,        color: "var(--success)" },
                  { label: "CPC Ruim",  val: currentProduct.cpcRuim,       color: "var(--danger)" },
                  { label: "Comissao",  val: currentProduct.commissionValue, color: "var(--accent)" },
                ].map(({ label, val, color }) => (
                  <div key={label}>
                    <p className="metric-label">{label}</p>
                    <p className="tnum text-[13px] font-bold mt-0.5" style={{ color }}>{fmt(val)}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onChangeTab("analysis")}
                className="btn btn-primary btn-md w-full"
              >
                <BarChart2 size={13} />
                Analisar campanha
              </button>
            </div>
          ) : products.length > 0 ? (
            /* Lista de produtos para selecionar diretamente */
            <div className="space-y-2">
              <p className="text-[11px] mb-2" style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>
                Selecione qual produto deseja monitorar:
              </p>
              {products.slice(0, 4).map((p) => {
                const pCamps = history.filter((c) => c.productId === p.id);
                const pProfit = pCamps.reduce((s, c) => s + c.profit, 0);
                const isPositive = pProfit > 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectProduct?.(p)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:scale-[1.01]"
                    style={{
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border-subtle)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(6,182,212,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
                      (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-subtle)";
                    }}
                  >
                    <div className="min-w-0">
                      <p
                        className="text-[12px] font-semibold truncate"
                        style={{ color: "var(--text-primary)", fontFamily: "var(--font-ui)" }}
                      >
                        {p.name}
                      </p>
                      <p className="text-2xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {p.nicho} · {p.platform ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {pCamps.length > 0 && (
                        <span
                          className="text-[11px] font-bold tnum"
                          style={{ color: isPositive ? "var(--success)" : "var(--danger)" }}
                        >
                          {isPositive ? "+" : ""}{fmt(pProfit)}
                        </span>
                      )}
                      <ArrowRight size={12} style={{ color: "var(--border-strong)" }} />
                    </div>
                  </button>
                );
              })}
              {products.length > 4 && (
                <button
                  onClick={() => onChangeTab("portfolio")}
                  className="w-full text-center text-[11px] py-1.5 transition-all hover:opacity-80"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-ui)" }}
                >
                  Ver todos os {products.length} produtos
                </button>
              )}
            </div>
          ) : (
            /* Sem produtos cadastrados */
            <div className="flex flex-col items-center justify-center text-center gap-3 py-4">
              <Target size={24} style={{ color: "var(--border-strong)" }} />
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                Nenhum produto cadastrado
              </p>
              <button
                onClick={() => onChangeTab("mapping")}
                className="text-[12px] font-semibold"
                style={{ color: "var(--accent)" }}
              >
                Cadastrar primeiro produto
              </button>
            </div>
          )}
        </div>

        {/* Last Campaign */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">Ultima Campanha</p>
            {isRecentCampaign && <StatusDot status="live" label="recente" className="opacity-80" />}
          </div>
          {lastCampaign ? (
            <div className="space-y-3">
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-ui)", letterSpacing: "-0.01em" }}
                >
                  {lastCampaign.productName}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {new Date(lastCampaign.date).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div
                className="grid grid-cols-2 gap-2 rounded-lg p-3"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)" }}
              >
                {[
                  { label: "Gasto",   val: fmt(lastCampaign.spend),   color: "var(--text-primary)" },
                  { label: "Receita", val: fmt(lastCampaign.revenue),  color: "var(--accent)" },
                  { label: "Lucro",   val: fmt(lastCampaign.profit),
                    color: (lastCampaign.profit ?? 0) >= 0 ? "var(--success)" : "var(--danger)" },
                  { label: "ROAS",    val: `${(lastCampaign.roas ?? 0).toFixed(2)}x`, color: "var(--text-primary)" },
                ].map(({ label, val, color }) => (
                  <div key={label}>
                    <p className="metric-label">{label}</p>
                    <p className="tnum text-[13px] font-bold mt-0.5" style={{ color }}>{val}</p>
                  </div>
                ))}
              </div>

              {/* ROI bar */}
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 h-1 rounded-full"
                  style={{
                    background: (lastCampaign.profit ?? 0) >= 0
                      ? "rgba(5,150,105,0.15)"
                      : "rgba(220,38,38,0.15)",
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.abs(lastCampaign.roi ?? 0))}%`,
                      background: (lastCampaign.roi ?? 0) >= 0 ? "var(--success)" : "var(--danger)",
                      transition: `width var(--motion-slow) var(--ease-out)`,
                    }}
                  />
                </div>
                <span
                  className="tnum text-[12px] font-bold flex-shrink-0"
                  style={{
                    color: (lastCampaign.roi ?? 0) >= 0 ? "var(--success)" : "var(--danger)",
                  }}
                >
                  ROI {fmtPct(lastCampaign.roi)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-28 text-center gap-2">
              <Activity size={24} style={{ color: "var(--border-strong)" }} />
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                Nenhuma campanha registrada
              </p>
              <button
                onClick={() => onChangeTab("analysis")}
                className="text-[12px] font-semibold"
                style={{ color: "var(--accent)" }}
              >
                Registrar campanha
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── QUICK ACTIONS ────────────────────────────────── */}
      <div className="card p-4">
        <p className="section-title mb-3">Acoes Rapidas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
          <QuickAction
            icon={Plus}
            label="Novo Produto"
            description="Mapear e analisar um novo produto afiliado"
            tab="mapping"
            onChangeTab={onChangeTab}
            accentVar="var(--accent)"
          />
          <QuickAction
            icon={Settings}
            label="Setup"
            description="Configurar keywords, anuncios e custos"
            tab="setup"
            onChangeTab={onChangeTab}
            accentVar="#7C3AED"
          />
          <QuickAction
            icon={TrendingUp}
            label="Simular Escala"
            description="Projetar lucro com diferentes volumes"
            tab="scale"
            onChangeTab={onChangeTab}
            accentVar="var(--success)"
          />
          <QuickAction
            icon={FileText}
            label="Relatorios"
            description="Gerar relatorio completo do portfolio"
            tab="reports"
            onChangeTab={onChangeTab}
            accentVar="var(--warn)"
          />
        </div>
      </div>

    </div>
  );
};
