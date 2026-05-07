import React from 'react';
import { Gauge, CheckCircle, AlertTriangle, XCircle, TrendingDown } from 'lucide-react';
import { fmt } from '../helpers';

interface Props {
  cpc: number;
  cpcBom: number;
  cpcInter: number;
  cpcApert: number;
  max: number;
  pos: number;
  status: 'excellent' | 'good' | 'warning' | 'danger';
  isProfitable?: boolean; // CPC alto mas ROI/ROAS positivos
}

const STATUS_CONFIG = {
  excellent: { label: 'CPC Excelente', pill: 'bg-emerald-100 text-emerald-700' },
  good:      { label: 'CPC Bom',       pill: 'bg-emerald-100 text-emerald-700' },
  warning:   { label: 'CPC Apertado',  pill: 'bg-amber-100 text-amber-700'     },
  danger:    { label: 'CPC Crítico',   pill: 'bg-red-100 text-red-700'         },
};

const STATUS_VALUE_COLOR = {
  excellent: 'text-emerald-600',
  good:      'text-emerald-600',
  warning:   'text-amber-600',
  danger:    'text-red-600',
};

const STATUS_MSG = {
  excellent: 'Abaixo do CPC Bom — lucro garantido',
  good:      'Dentro da zona boa — siga em frente',
  warning:   'Zona apertada — monitore os lances',
  danger:    'Zona crítica — reveja lances urgente',
  dangerProfitable: 'CPC alto mas campanha lucrativa — otimize sem pausar',
};

export const CPCGauge: React.FC<Props> = ({
  cpc, cpcBom, cpcInter, cpcApert, max, pos, status, isProfitable = false,
}) => {
  const cfg = STATUS_CONFIG[status];

  // Sort thresholds ascending regardless of how the product stores them
  // (some products have them stored in wrong order)
  const [sortedBom, sortedInter, sortedApert] = [cpcBom, cpcInter, cpcApert]
    .filter(v => v > 0)
    .sort((a, b) => a - b)
    .concat([0, 0, 0]);   // pad so destructure never fails
  const safeMax = Math.max(sortedApert * 1.6, max, 1);

  // Zone widths as percentage of total bar (using sorted values)
  const bomW   = (sortedBom               / safeMax) * 100;
  const interW = ((sortedInter - sortedBom)  / safeMax) * 100;
  const apertW = ((sortedApert - sortedInter)/ safeMax) * 100;
  const ruimW  = Math.max(0, 100 - bomW - interW - apertW);

  // Threshold positions for value labels below bar
  const t1 = bomW;
  const t2 = bomW + interW;
  const t3 = bomW + interW + apertW;

  // Minimum width to show label inside bar (%)
  const MIN_LABEL_W = 14;

  const zones = [
    { w: bomW,   label: 'Bom',    gradient: 'from-emerald-400 to-emerald-500', textCol: 'text-emerald-700' },
    { w: interW, label: 'Médio',  gradient: 'from-blue-400 to-blue-500',       textCol: 'text-blue-700'    },
    { w: apertW, label: 'Apert',  gradient: 'from-amber-400 to-amber-500',     textCol: 'text-amber-700'   },
    { w: ruimW,  label: 'Crítico',gradient: 'from-red-500 to-red-600',         textCol: 'text-red-700',    pulse: status === 'danger' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-blue-200">
            <Gauge size={14} className="text-white" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-slate-800 leading-none">Termômetro de CPC</div>
            <div className="text-2xs text-slate-400 mt-0.5 font-medium">Custo por Clique vs metas do produto</div>
          </div>
        </div>
        {cpc > 0 && (
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.pill}`}>
            {cfg.label}
          </span>
        )}
      </div>

      <div className="px-5 py-5 space-y-4">

        {/* ── No data ── */}
        {cpc === 0 ? (
          <div className="text-center py-8">
            <TrendingDown size={28} className="mx-auto text-slate-200 mb-2" />
            <p className="text-sm font-semibold text-slate-500">Insira cliques e gasto</p>
            <p className="text-[11px] text-slate-300 mt-0.5">para ver o CPC real da campanha</p>
          </div>
        ) : (
          <>
            {/* ── CPC hero ── */}
            <div className="flex items-center gap-3">
              <div>
                <div className="text-2xs font-bold uppercase tracking-widest text-slate-500 mb-0.5">CPC Atual</div>
                <div className={`text-3xl font-black tabular-nums leading-none ${STATUS_VALUE_COLOR[status]}`}>
                  {fmt(cpc)}
                </div>
              </div>
              <div className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${ status === 'excellent' || status === 'good' ? 'bg-emerald-50 text-emerald-700' : status === 'warning' ? 'bg-amber-50 text-amber-700' : isProfitable ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700' }`}>
                {(status === 'excellent' || status === 'good')
                  ? <CheckCircle size={11} />
                  : <AlertTriangle size={11} />
                }
                {status === 'danger' && isProfitable ? STATUS_MSG.dangerProfitable : STATUS_MSG[status]}
              </div>
            </div>

            {/* ── Colored bar with labels INSIDE ── */}
            <div>
              {/* The bar */}
              <div className="relative h-11 rounded-xl overflow-hidden flex shadow-inner bg-slate-100">
                {zones.map((z, i) => (
                  <div
                    key={i}
                    className={`relative h-full bg-gradient-to-r ${z.gradient} flex items-center justify-center ${z.pulse ? 'animate-pulse' : ''}`}
                    style={{ width: `${z.w}%`, minWidth: z.w > 0 ? 2 : 0 }}
                  >
                    {/* White divider on left side (except first zone) */}
                    {i > 0 && z.w > 0 && (
                      <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-white/50 rounded-full" />
                    )}
                    {/* Zone label inside bar */}
                    {z.w >= MIN_LABEL_W && (
                      <span className="text-2xs font-bold text-white/95 uppercase tracking-wide drop- select-none">
                        {z.label}
                      </span>
                    )}
                  </div>
                ))}

                {/* ── Needle ── */}
                <div
                  className="absolute top-0 bottom-0 transition-all duration-700 ease-out pointer-events-none"
                  style={{ left: `${Math.min(Math.max(pos, 1), 99)}%`, transform: 'translateX(-50%)' }}
                >
                  {/* Stem */}
                  <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-slate-900 rounded-full" />
                  {/* Triangle tip above */}
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2"
                    style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '7px solid #0F172A' }}
                  />
                  {/* CPC value tooltip above the triangle */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-2xs font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-xl tabular-nums">
                    {fmt(cpc)}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>
                  {/* Bottom dot */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-slate-900 rounded-full ring-2 ring-white shadow-lg" />
                </div>
              </div>

              {/* ── Threshold labels below bar ── */}
              <div className="relative mt-4" style={{ height: 36 }}>
                <span className="absolute left-0 top-0 text-2xs font-bold text-slate-500 tabular-nums">
                  R$ 0
                </span>

                {/* Threshold 1 — Bom */}
                {sortedBom > 0 && (
                  <div className="absolute flex flex-col items-center" style={{ left: `${t1}%`, transform: 'translateX(-50%)' }}>
                    <div className="w-px h-2 bg-emerald-400 mb-0.5" />
                    <span className="text-2xs font-bold text-emerald-600 tabular-nums whitespace-nowrap">{fmt(sortedBom)}</span>
                    <span className="text-2xs font-semibold text-emerald-500 uppercase tracking-wide">Bom</span>
                  </div>
                )}

                {/* Threshold 2 — Médio (only if distinct from Bom) */}
                {sortedInter > 0 && Math.abs(t2 - t1) > 4 && (
                  <div className="absolute flex flex-col items-center" style={{ left: `${t2}%`, transform: 'translateX(-50%)' }}>
                    <div className="w-px h-2 bg-blue-400 mb-0.5" />
                    <span className="text-2xs font-bold text-blue-600 tabular-nums whitespace-nowrap">{fmt(sortedInter)}</span>
                    <span className="text-2xs font-semibold text-blue-500 uppercase tracking-wide">Médio</span>
                  </div>
                )}

                {/* Threshold 3 — Apert (only if distinct from previous) */}
                {sortedApert > 0 && Math.abs(t3 - t2) > 4 && Math.abs(t3 - t1) > 4 && (
                  <div className="absolute flex flex-col items-center" style={{ left: `${t3}%`, transform: 'translateX(-50%)' }}>
                    <div className="w-px h-2 bg-amber-400 mb-0.5" />
                    <span className="text-2xs font-bold text-amber-600 tabular-nums whitespace-nowrap">{fmt(sortedApert)}</span>
                    <span className="text-2xs font-semibold text-amber-500 uppercase tracking-wide">Apert</span>
                  </div>
                )}

                <span className="absolute right-0 top-0 text-2xs font-bold text-slate-500 tabular-nums text-right">
                  {fmt(safeMax)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* ── Zone guide — always visible ── */}
        <div>
          <p className="text-2xs font-bold uppercase tracking-widest text-slate-500 mb-2">Guia de Zonas</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { key: 'bom',  label: 'Bom',          range: `≤ ${fmt(sortedBom)}`,   desc: 'Lucro garantido',        icon: <CheckCircle  size={12} className="text-emerald-500" />, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', sub: 'text-emerald-600' },
              { key: 'inter',label: 'Intermediário', range: `${fmt(sortedBom)} – ${fmt(sortedInter)}`, desc: 'Monitore os lances',   icon: <AlertTriangle size={12} className="text-blue-500" />,    bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    sub: 'text-blue-600'    },
              { key: 'apert',label: 'Apertado',      range: `${fmt(sortedInter)} – ${fmt(sortedApert)}`, desc: 'Otimize urgente',  icon: <AlertTriangle size={12} className="text-amber-500" />,  bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   sub: 'text-amber-600'   },
              { key: 'ruim', label: 'Crítico',       range: `> ${fmt(sortedApert)}`,desc: isProfitable ? 'Otimize lances — lucro ok' : 'Pause a campanha',        icon: <XCircle      size={12} className="text-red-500" />,    bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     sub: 'text-red-600'     },
            ].map(z => {
              const isActive = cpc > 0 && (
                (z.key === 'bom'   && cpc <= sortedBom)     ||
                (z.key === 'inter' && cpc > sortedBom   && cpc <= sortedInter) ||
                (z.key === 'apert' && cpc > sortedInter && cpc <= sortedApert) ||
                (z.key === 'ruim'  && cpc > sortedApert)
              );
              return (
                <div
                  key={z.key}
                  className={`rounded-xl p-3 border transition-all ${z.bg} ${z.border} ${ isActive ? 'ring-2 ring-offset-1 ring-slate-500 ' : 'opacity-65' }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {z.icon}
                      <span className={`text-2xs font-bold uppercase tracking-wide ${z.text}`}>{z.label}</span>
                    </div>
                    {isActive && (
                      <span className="text-2xs font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded">ATUAL</span>
                    )}
                  </div>
                  <p className={`text-[11px] font-bold tabular-nums ${z.text} mb-0.5`}>{z.range}</p>
                  <p className={`text-2xs leading-tight ${z.sub}`}>{z.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
