/**
 * KPICard v2 — semantic KPI display card integrating the Money component.
 *
 * Replaces ad-hoc KPI tiles that manually applied hardcoded colors.
 * Uses the Moneyness token system via <Money> and intent-aware icon ring.
 *
 * Usage:
 *   <KPICard
 *     title="Receita Total"
 *     value={receita}
 *     intent="volume"
 *     format="brl"
 *     delta={12.4}
 *     deltaLabel="vs mês anterior"
 *     icon={<TrendingUp size={16}/>}
 *   />
 *
 *   <KPICard
 *     title="Lucro Líquido"
 *     value={lucro}
 *     intent="profit"
 *     format="brl"
 *     showSign
 *   />
 *
 *   <KPICard
 *     title="ROI Médio"
 *     value={roi}
 *     intent="roi"
 *     format="pct"
 *     showSign
 *   />
 */
import React from 'react';
import { Money } from './Money';
import type { MoneyFormat, MoneyIntent } from './Money';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type KPIIntent = 'volume' | 'profit' | 'roi' | 'warning';

interface KPICardProps {
  title: string;
  value: number;
  /** Semantic intent — drives color of value and icon ring */
  intent?: KPIIntent;
  format?: MoneyFormat;
  /** Optional delta % (positive = up, negative = down) */
  delta?: number;
  /** Label shown next to the delta, e.g. "vs last 30d" */
  deltaLabel?: string;
  /** Icon shown in the colored ring */
  icon?: React.ReactNode;
  /** Subtitle under the title */
  subtitle?: string;
  /** Show + sign on positive values */
  showSign?: boolean;
  className?: string;
  /** Slot for extra content below the main value */
  children?: React.ReactNode;
}

/* intent → ring bg + icon color */
const INTENT_RING: Record<KPIIntent, { ring: string; icon: string }> = {
  volume:  { ring: 'bg-slate-100',   icon: 'text-slate-600'  },
  profit:  { ring: 'bg-emerald-50',  icon: 'text-emerald-600' },
  roi:     { ring: 'bg-cyan-50',     icon: 'text-cyan-700'    },
  warning: { ring: 'bg-amber-50',    icon: 'text-amber-600'   },
};

/* intent → Money intent mapping */
const INTENT_MONEY: Record<KPIIntent, MoneyIntent> = {
  volume:  'volume',
  profit:  'profit',
  roi:     'roi',
  warning: 'warning',
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  intent = 'volume',
  format = 'brl',
  delta,
  deltaLabel,
  icon,
  subtitle,
  showSign = false,
  className = '',
  children,
}) => {
  const ring = INTENT_RING[intent];
  const moneyIntent = INTENT_MONEY[intent];

  /* Delta display */
  const hasDelta = delta !== undefined && delta !== null;
  const deltaPos = hasDelta && delta! > 0;
  const deltaNeg = hasDelta && delta! < 0;

  const DeltaIcon = deltaPos ? TrendingUp : deltaNeg ? TrendingDown : Minus;
  const deltaClass = deltaPos
    ? 'text-emerald-600 bg-emerald-50'
    : deltaNeg
    ? 'text-red-600 bg-red-50'
    : 'text-slate-500 bg-slate-100';

  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-200
        p-5 flex flex-col gap-3
        ${className}
      `}
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      {/* Header row: icon + title */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="kpi-label">{title}</div>
          {subtitle && (
            <div
              className="text-[11px] text-slate-400 mt-0.5"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {icon && (
          <div
            className={`
              w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
              ${ring.ring} ${ring.icon}
            `}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="kpi-value">
        <Money
          value={value}
          intent={moneyIntent}
          format={format}
          showSign={showSign}
        />
      </div>

      {/* Delta badge */}
      {hasDelta && (
        <div className="flex items-center gap-2">
          <span
            className={`
              inline-flex items-center gap-1
              text-[11px] font-semibold px-2 py-0.5 rounded-full
              ${deltaClass}
            `}
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            <DeltaIcon size={10} strokeWidth={2.5} />
            {Math.abs(delta!).toFixed(1)}%
          </span>
          {deltaLabel && (
            <span className="text-[11px] text-slate-400">{deltaLabel}</span>
          )}
        </div>
      )}

      {/* Optional slot */}
      {children}
    </div>
  );
};
