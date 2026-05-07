/**
 * KPITile — compact KPI display for grid rows.
 *
 * Visual hierarchy:
 *   LABEL (icon + uppercase label)
 *   VALUE (large tabular numeral)
 *   SECONDARY (small context line, optional)
 *
 * Used in: VerdictCard KPIs row, Dashboard hero row, ScaleSimulator, etc.
 */
import React from 'react';

type ValueStatus = 'positive' | 'negative' | 'neutral' | 'warning';

interface KPITileProps {
  /** Small icon rendered beside the label */
  icon?: React.ReactNode;
  /** All-caps label */
  label: string;
  /** Formatted value string (already formatted by caller) */
  value: string;
  /** Optional secondary info line below value */
  secondary?: string;
  /** Secondary line color intent */
  secondaryStatus?: 'positive' | 'negative' | 'neutral';
  /** Color intent for the value */
  valueStatus?: ValueStatus;
  /** Show em-dash when no meaningful value */
  empty?: boolean;
  className?: string;
}

const VALUE_COLORS: Record<ValueStatus, string> = {
  positive: 'text-emerald-600',
  negative: 'text-red-500',
  warning:  'text-amber-600',
  neutral:  'text-slate-800',
};

const SECONDARY_COLORS = {
  positive: 'text-emerald-600',
  negative: 'text-red-500',
  neutral:  'text-slate-500',
};

export const KPITile: React.FC<KPITileProps> = ({
  icon,
  label,
  value,
  secondary,
  secondaryStatus = 'neutral',
  valueStatus = 'neutral',
  empty = false,
  className = '',
}) => {
  return (
    <div className={`px-3 py-3.5 text-center ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
        {icon && <span className="opacity-70 [&>svg]:w-2.5 [&>svg]:h-2.5">{icon}</span>}
        {label}
      </div>

      {/* Value */}
      <div
        className={`text-sm font-bold tabular-nums leading-none ${empty ? 'text-slate-300' : VALUE_COLORS[valueStatus]}`}
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums slashed-zero' }}
      >
        {empty ? '—' : value}
      </div>

      {/* Secondary */}
      {secondary && !empty && (
        <div className={`text-[10px] font-semibold tabular-nums mt-0.5 ${SECONDARY_COLORS[secondaryStatus]}`}>
          {secondary}
        </div>
      )}
    </div>
  );
};
