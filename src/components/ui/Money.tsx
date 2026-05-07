/**
 * Money — semantic numeric display component ("Moneyness" design token system).
 *
 * Automatically picks the correct color token based on the value's semantic intent:
 *
 *   intent="volume"    → --num-volume   (slate-900)  — raw volumes (Receita, Investimento)
 *   intent="profit"    → positive/negative based on sign
 *   intent="roi"       → positive/negative based on sign
 *   intent="warning"   → --num-warning  (amber-700)  — CPC intermediário, near-miss
 *   intent="neutral"   → --num-neutral  (slate-500)  — zero, labels
 *   intent="positive"  → --num-positive (emerald-700) — always green regardless of value
 *   intent="negative"  → --num-negative (red-700)     — always red regardless of value
 *
 * Usage:
 *   <Money value={lucro} intent="profit" format="brl" />
 *   <Money value={roi} intent="roi" format="pct" suffix="%" />
 *   <Money value={receita} intent="volume" format="brl" />
 *
 * Format helpers:
 *   "brl"  → R$ 1.234,56
 *   "pct"  → 12,3%
 *   "raw"  → 1234.56 (no formatting)
 *   fn     → custom formatter
 */
import React from 'react';

export type MoneyIntent =
  | 'volume'    // raw volumes — slate-900
  | 'profit'    // sign-based  — positive or negative
  | 'roi'       // sign-based  — positive or negative
  | 'warning'   // amber
  | 'neutral'   // slate-500
  | 'positive'  // always green
  | 'negative'; // always red

export type MoneyFormat = 'brl' | 'pct' | 'raw' | ((v: number) => string);

interface MoneyProps {
  value: number;
  intent?: MoneyIntent;
  format?: MoneyFormat;
  /** Appended after formatted value, e.g. "%" */
  suffix?: string;
  /** Prepended before formatted value */
  prefix?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show sign explicitly: "+R$ 1.200" or "+12%" */
  showSign?: boolean;
  /** Fallback text when value is undefined/NaN */
  fallback?: string;
}

const BRL_FMT = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PCT_FMT = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatValue(value: number, format: MoneyFormat, showSign: boolean): string {
  let str: string;
  if (typeof format === 'function') {
    str = format(value);
  } else if (format === 'brl') {
    str = BRL_FMT.format(Math.abs(value));
    if (showSign && value > 0) str = '+' + str;
    if (value < 0) str = '-' + str;
  } else if (format === 'pct') {
    str = PCT_FMT.format(Math.abs(value)) + '%';
    if (showSign && value > 0) str = '+' + str;
    if (value < 0) str = '-' + str;
  } else {
    str = String(value);
    if (showSign && value > 0) str = '+' + str;
  }
  return str;
}

function resolveColorClass(intent: MoneyIntent, value: number): string {
  switch (intent) {
    case 'volume':   return 'num-volume';
    case 'neutral':  return 'num-neutral';
    case 'warning':  return 'num-warning';
    case 'positive': return 'num-positive';
    case 'negative': return 'num-negative';
    case 'profit':
    case 'roi':
      if (value > 0) return 'num-positive';
      if (value < 0) return 'num-negative';
      return 'num-neutral';
    default:
      return 'num-volume';
  }
}

export const Money: React.FC<MoneyProps> = ({
  value,
  intent = 'volume',
  format = 'brl',
  suffix,
  prefix,
  className = '',
  showSign = false,
  fallback = '—',
}) => {
  if (value === undefined || value === null || isNaN(value)) {
    return (
      <span className={`num-neutral font-mono tabular-nums ${className}`}>
        {fallback}
      </span>
    );
  }

  const colorClass = resolveColorClass(intent, value);
  const formatted = formatValue(value, format, showSign);

  return (
    <span
      className={`${colorClass} font-mono tabular-nums ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums slashed-zero' }}
    >
      {prefix}{formatted}{suffix}
    </span>
  );
};
