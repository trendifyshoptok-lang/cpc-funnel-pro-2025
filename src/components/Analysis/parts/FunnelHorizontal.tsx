import React, { useState } from 'react';
import { Users, MousePointer, ShoppingBag, TrendingDown, ChevronRight } from 'lucide-react';
import { fmtPct, fmtCompact } from '../helpers';

interface Props {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cr: number;
  requiredCR: number;
  ctrBottleneck: boolean;
  crBottleneck: boolean;
  lostClicks: number;
  lostConversions: number;
  ctrLossPct: number;
  crLossPct: number;
}

type HoveredStage = 'impressions' | 'clicks' | 'conversions' | null;

// Rate badge between stages
function RateConnector({
  label,
  value,
  isBottleneck,
  lossValue,
  lossPct,
  hasData,
}: {
  label: 'CTR' | 'CR';
  value: number;
  isBottleneck: boolean;
  lossValue: number;
  lossPct: number;
  hasData: boolean;
}) {
  const good = label === 'CTR' ? value >= 2 : value >= 0;
  const excellent = label === 'CTR' ? value >= 5 : !isBottleneck;

  const rateColor = isBottleneck
    ? 'bg-red-500 text-white shadow-red-200'
    : excellent
    ? 'bg-emerald-500 text-white shadow-emerald-200'
    : 'bg-amber-500 text-white shadow-amber-200';

  return (
    <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0 w-28">
      {/* Arrow rail */}
      <div className="relative w-full flex items-center justify-center">
        <div className={`absolute inset-y-0 left-0 right-0 flex items-center ${!hasData ? 'opacity-30' : ''}`}>
          <div className={`w-full h-0.5 ${isBottleneck ? 'bg-red-300' : 'bg-slate-200'}`} />
        </div>
        {/* Rate pill */}
        <div className={`relative z-10 px-3 py-1.5 rounded-full text-[11px] font-bold ${rateColor} ${!hasData ? 'opacity-40' : ''}`}>
          {hasData ? fmtPct(value) : '— %'}
        </div>
      </div>

      {/* Label */}
      <div className={`text-2xs font-bold uppercase tracking-widest ${isBottleneck ? 'text-red-400' : 'text-slate-300'}`}>
        {label}
      </div>

      {/* Loss */}
      {hasData && lossValue > 0 && (
        <div className="flex items-center gap-1 text-2xs font-semibold text-slate-500">
          <TrendingDown size={9} className={isBottleneck ? 'text-red-400' : 'text-slate-400'} />
          <span className={isBottleneck ? 'text-red-500' : ''}>-{fmtPct(lossPct, 1)}</span>
        </div>
      )}
    </div>
  );
}

// Individual stage card
function StageCard({
  icon,
  label,
  sublabel,
  value,
  formatted,
  sharePct,
  gradient,
  textColor,
  isActive,
  onHover,
  tooltip,
  isEmpty,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  value: number;
  formatted: string;
  sharePct: number; // 0-100 for fill bar
  gradient: string;
  textColor: string;
  isActive: boolean;
  onHover: (v: boolean) => void;
  tooltip: string;
  isEmpty: boolean;
}) {
  return (
    <div
      className="relative flex-1 min-w-0 cursor-default"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Main card */}
      <div className={`relative rounded-2xl border overflow-hidden transition-all duration-200 ${ isActive ? 'border-slate-300 shadow-lg shadow-slate-200/60 -translate-y-0.5' : 'border-slate-200 ' } bg-white`}>

        {/* Colored top accent */}
        <div className={`h-1 w-full ${gradient}`} />

        <div className="p-4">
          {/* Icon + label */}
          <div className="flex items-center justify-between mb-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${gradient} bg-opacity-15`}
                 style={{ background: 'transparent' }}>
              <div className={`${textColor}`}>{icon}</div>
            </div>
            <span className="text-2xs font-bold uppercase tracking-widest text-slate-500">{sublabel}</span>
          </div>

          {/* Big number */}
          <div className={`text-3xl font-black tabular-nums leading-none mb-1 ${isEmpty ? 'text-slate-200' : textColor}`}>
            {isEmpty ? '—' : formatted}
          </div>

          {/* Label */}
          <div className="text-[11px] font-bold text-slate-500">{label}</div>

          {/* Fill bar — share of total impressions */}
          <div className="mt-3 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${gradient}`}
              style={{ width: isEmpty ? '0%' : `${Math.max(1, sharePct)}%` }}
            />
          </div>
          {!isEmpty && (
            <div className="text-2xs font-semibold text-slate-500 mt-1 tabular-nums">
              {fmtPct(sharePct, 1)} do alcance
            </div>
          )}
        </div>
      </div>

      {/* Hover tooltip */}
      {isActive && !isEmpty && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap bg-slate-900 text-white text-2xs font-semibold px-3 py-1.5 rounded-lg shadow-xl pointer-events-none">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
        </div>
      )}
    </div>
  );
}

export const FunnelHorizontal: React.FC<Props> = ({
  impressions, clicks, conversions,
  ctr, cr, requiredCR,
  ctrBottleneck, crBottleneck,
  lostClicks, lostConversions,
  ctrLossPct, crLossPct,
}) => {
  const [hovered, setHovered] = useState<HoveredStage>(null);

  const hasAnyData = impressions > 0 || clicks > 0 || conversions > 0;
  const base = impressions || 1;

  const clickSharePct = Math.min(100, (clicks / base) * 100);
  const convSharePct = Math.min(100, (conversions / base) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-violet-200">
            <ChevronRight size={14} className="text-white" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-slate-800 leading-none">Funil de Conversao</div>
            <div className="text-2xs text-slate-400 mt-0.5 font-medium">Impressoes → Cliques → Vendas</div>
          </div>
        </div>

        {hasAnyData && (
          <div className="flex items-center gap-2">
            {ctrBottleneck && (
              <span className="flex items-center gap-1 text-2xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                CTR baixo
              </span>
            )}
            {crBottleneck && (
              <span className="flex items-center gap-1 text-2xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                CR baixo
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Stages + connectors ── */}
      <div className="p-5">
        <div className="flex items-stretch gap-0">

          {/* Stage 1: Impressões */}
          <StageCard
            icon={<Users size={13} strokeWidth={2.5} />}
            label="Impressoes"
            sublabel="Alcance"
            value={impressions}
            formatted={fmtCompact(impressions)}
            sharePct={100}
            gradient="bg-gradient-to-r from-violet-500 to-indigo-500"
            textColor="text-indigo-600"
            isActive={hovered === 'impressions'}
            onHover={v => setHovered(v ? 'impressions' : null)}
            tooltip={`${impressions.toLocaleString('pt-BR')} exibicoes totais`}
            isEmpty={!hasAnyData && impressions <= 1000}
          />

          {/* Connector CTR */}
          <RateConnector
            label="CTR"
            value={ctr}
            isBottleneck={ctrBottleneck}
            lossValue={lostClicks}
            lossPct={ctrLossPct}
            hasData={impressions > 0 && clicks >= 0}
          />

          {/* Stage 2: Cliques */}
          <StageCard
            icon={<MousePointer size={13} strokeWidth={2.5} />}
            label="Cliques"
            sublabel="Visitas"
            value={clicks}
            formatted={fmtCompact(clicks)}
            sharePct={clickSharePct}
            gradient={ctrBottleneck ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}
            textColor={ctrBottleneck ? 'text-red-600' : 'text-blue-600'}
            isActive={hovered === 'clicks'}
            onHover={v => setHovered(v ? 'clicks' : null)}
            tooltip={`${clicks.toLocaleString('pt-BR')} cliques • ${fmtPct(clickSharePct)} do alcance`}
            isEmpty={clicks === 0}
          />

          {/* Connector CR */}
          <RateConnector
            label="CR"
            value={cr}
            isBottleneck={crBottleneck}
            lossValue={lostConversions}
            lossPct={crLossPct}
            hasData={clicks > 0}
          />

          {/* Stage 3: Conversões */}
          <StageCard
            icon={<ShoppingBag size={13} strokeWidth={2.5} />}
            label="Vendas"
            sublabel="Conversoes"
            value={conversions}
            formatted={String(conversions)}
            sharePct={convSharePct}
            gradient={crBottleneck ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}
            textColor={crBottleneck ? 'text-orange-600' : 'text-emerald-600'}
            isActive={hovered === 'conversions'}
            onHover={v => setHovered(v ? 'conversions' : null)}
            tooltip={`${conversions} vendas • meta CR ${fmtPct(requiredCR)}`}
            isEmpty={conversions === 0}
          />
        </div>

        {/* ── Bottom meta row ── */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xs font-bold uppercase tracking-widest text-slate-500">Alcance</div>
            <div className="text-sm font-bold text-indigo-600 tabular-nums mt-0.5">{fmtCompact(impressions)}</div>
          </div>
          <div>
            <div className="text-2xs font-bold uppercase tracking-widest text-slate-500">Taxa CTR → CR</div>
            <div className="text-sm font-bold text-slate-700 tabular-nums mt-0.5">
              {fmtPct(ctr)} → {fmtPct(cr)}
            </div>
          </div>
          <div>
            <div className="text-2xs font-bold uppercase tracking-widest text-slate-500">Meta CR</div>
            <div className={`text-sm font-bold tabular-nums mt-0.5 ${cr >= requiredCR ? 'text-emerald-600' : 'text-slate-400'}`}>
              {fmtPct(requiredCR)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
