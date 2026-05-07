import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Award, TrendingUp, DollarSign, Target, Activity, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import type { VerdictResult } from '../../../types';
import type { Alert } from '../hooks';
import type { AutoSuggestion } from '../helpers';
import { getHealthConfig, fmt, fmtPct, fmtX } from '../helpers';

interface Props {
  verdict: VerdictResult | null;
  healthScore: number;
  hasData: boolean;
  alerts: Alert[];
  metrics: { roas: number; roi: number; cpa: number };
  product: { commissionLiquid: number };
  suggestions?: AutoSuggestion[];
}

const PRIO_DOT: Record<string, string> = {
  ALTA:  'bg-red-500',
  MEDIA: 'bg-amber-400',
  BAIXA: 'bg-slate-300',
};
const PRIO_TEXT: Record<string, string> = {
  ALTA:  'text-red-600',
  MEDIA: 'text-amber-600',
  BAIXA: 'text-slate-400',
};

function AlertIcon({ level }: { level: Alert['level'] }) {
  if (level === 'critical') return <AlertCircle size={10} className="text-red-500 flex-shrink-0 mt-px" />;
  if (level === 'warning') return <AlertTriangle size={10} className="text-amber-500 flex-shrink-0 mt-px" />;
  return <Info size={10} className="text-blue-400 flex-shrink-0 mt-px" />;
}

// SVG circular arc for health score
function ScoreArc({ score, config }: { score: number; config: ReturnType<typeof getHealthConfig> }) {
  const size = 88;
  const cx = size / 2;
  const cy = size / 2;
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      {/* Track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        className="text-slate-100"
      />
      {/* Progress */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={config.stroke}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
    </svg>
  );
}

export const VerdictCard: React.FC<Props> = ({
  verdict, healthScore, hasData, alerts, metrics, product, suggestions = [],
}) => {
  const [planOpen, setPlanOpen] = useState(true);
  const health = getHealthConfig(healthScore);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <Activity size={14} className="text-slate-400" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-slate-800 leading-none">Veredito</div>
            <div className="text-2xs text-slate-400 mt-0.5 font-medium">Health Score + KPIs</div>
          </div>
        </div>

        {/* Empty content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
          {/* Score placeholder */}
          <div className="relative">
            <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90 opacity-20">
              <circle cx="44" cy="44" r="34" fill="none" stroke="#94a3b8" strokeWidth="6" strokeDasharray="213.6" strokeDashoffset="213.6" strokeLinecap="round" />
              <circle cx="44" cy="44" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-200">—</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-500">Insira Gasto e Conversoes</p>
            <p className="text-[11px] text-slate-300">para calcular o Health Score</p>
          </div>

          {/* KPI placeholders */}
          <div className="w-full mt-2 grid grid-cols-3 gap-2">
            {['ROAS', 'ROI', 'CPA'].map(k => (
              <div key={k} className="bg-slate-50 rounded-xl py-3 text-center border border-slate-100">
                <div className="text-2xs font-bold text-slate-300 uppercase tracking-widest">{k}</div>
                <div className="text-base font-bold text-slate-200 mt-1">—</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Has data ──────────────────────────────────────────────────────────────
  const excellentPerf = metrics.roas >= 2.5 && metrics.roi > 30;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full">

      {/* ── Score + verdict header ── */}
      <div className={`px-5 pt-5 pb-4 ${health.bg} border-b ${health.border}`}>
        <div className="flex items-center gap-4">
          {/* Arc */}
          <div className="relative flex-shrink-0">
            <ScoreArc score={healthScore} config={health} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-black leading-none tabular-nums ${health.color}`}>{healthScore}</span>
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wide">/100</span>
            </div>
          </div>

          {/* Label */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[11px] font-bold uppercase tracking-widest ${health.color}`}>{health.label}</span>
              {excellentPerf && (
                <span className="flex items-center gap-1 text-2xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                  <Award size={8} strokeWidth={2.5} /> Top
                </span>
              )}
            </div>
            {verdict && (
              <>
                <p className="text-sm font-bold text-slate-800 leading-tight">{verdict.title}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{verdict.action}</p>
              </>
            )}
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-3.5 h-1.5 rounded-full bg-white/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${health.bar}`}
            style={{ width: `${healthScore}%` }}
          />
        </div>
      </div>

      {/* ── KPIs row ── */}
      <div className="grid grid-cols-3 divide-x divide-slate-100">
        {/* ROAS */}
        <div className="px-3 py-3.5 text-center">
          <div className="flex items-center justify-center gap-1 text-2xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            <TrendingUp size={8} strokeWidth={3} /> ROAS
          </div>
          <div className={`text-lg font-bold tabular-nums ${
            metrics.roas >= 1.5 ? 'text-emerald-600'
            : metrics.roas > 0 ? 'text-amber-600'
            : 'text-slate-300'
          }`}>
            {metrics.roas > 0 ? fmtX(metrics.roas) : '—'}
          </div>
        </div>

        {/* ROI */}
        <div className="px-3 py-3.5 text-center">
          <div className="flex items-center justify-center gap-1 text-2xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            <DollarSign size={8} strokeWidth={3} /> ROI
          </div>
          <div className={`text-lg font-bold tabular-nums ${
            metrics.roi > 30 ? 'text-emerald-600'
            : metrics.roi > 0 ? 'text-blue-600'
            : metrics.roi < 0 ? 'text-red-500'
            : 'text-slate-300'
          }`}>
            {metrics.roi !== 0 ? fmtPct(metrics.roi, 1) : '—'}
          </div>
        </div>

        {/* CPA */}
        <div className="px-3 py-3.5 text-center">
          <div className="flex items-center justify-center gap-1 text-2xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            <Target size={8} strokeWidth={3} /> CPA
          </div>
          <div className="text-lg font-bold tabular-nums text-slate-700">
            {metrics.cpa > 0 ? fmt(metrics.cpa) : '—'}
          </div>
          {metrics.cpa > 0 && (
            <div className={`text-2xs font-bold tabular-nums ${
              product.commissionLiquid - metrics.cpa > 0 ? 'text-emerald-500' : 'text-red-400'
            }`}>
              {product.commissionLiquid - metrics.cpa > 0 ? '+' : ''}{fmt(product.commissionLiquid - metrics.cpa)}
            </div>
          )}
        </div>
      </div>

      {/* ── Alerts ── */}
      <div className="px-4 py-3 border-t border-slate-100">
        {alerts.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold py-1">
            <CheckCircle2 size={13} className="text-emerald-500" />
            Tudo dentro do esperado
          </div>
        ) : (
          <div className="space-y-1.5">
            {alerts.slice(0, 3).map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-1.5 text-[11px] font-medium rounded-lg px-2.5 py-2 leading-snug ${
                  a.level === 'critical'
                    ? 'bg-red-50 text-red-700 border border-red-100'
                    : a.level === 'warning'
                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                    : 'bg-blue-50 text-blue-700 border border-blue-100'
                }`}
              >
                <AlertIcon level={a.level} />
                <span>{a.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Plano de Ação — inline ── */}
      {suggestions.length > 0 && (
        <div className="border-t border-slate-100">
          {/* Collapsible header */}
          <button
            onClick={() => setPlanOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Zap size={11} className="text-amber-500" />
              <span className="text-[11px] font-bold text-slate-700">Plano de Ação</span>
              <span className="text-2xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                {suggestions.length}
              </span>
              {suggestions.some(s => s.priority === 'ALTA') && (
                <span className="text-2xs font-bold text-red-500">
                  · {suggestions.filter(s => s.priority === 'ALTA').length} alta
                </span>
              )}
            </div>
            {planOpen
              ? <ChevronUp size={12} className="text-slate-400" />
              : <ChevronDown size={12} className="text-slate-400" />}
          </button>

          {planOpen && (
            <div className="divide-y divide-slate-50">
              {suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5 px-4 py-2.5">
                  {/* Priority indicator */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIO_DOT[s.priority] ?? 'bg-slate-300'}`} />
                  </div>
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-2xs font-bold uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {s.area}
                      </span>
                      <span className={`text-2xs font-bold uppercase ${PRIO_TEXT[s.priority] ?? 'text-slate-400'}`}>
                        {s.priority}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700 leading-snug">{s.action}</p>
                    <p className="text-2xs text-slate-500 leading-relaxed mt-0.5 line-clamp-2">{s.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
