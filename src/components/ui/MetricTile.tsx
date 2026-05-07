import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { AnimatedNumber } from '../AnimatedNumber';

interface MetricTileProps {
  label: string;
  value: number;
  format?: (v: number) => string;
  delta?: number;
  sparkline?: number[];
  status?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  format = (v) => v.toFixed(2),
  delta,
  sparkline,
  status = 'neutral',
  icon,
  className = '',
}) => {
  const valueColor =
    status === 'positive' ? 'var(--success)'
    : status === 'negative' ? 'var(--danger)'
    : 'inherit';

  return (
    <div className={`metric-tile ${className}`}>
      {/* Label row */}
      <div className="flex items-center justify-between gap-1">
        <span className="metric-label">{label}</span>
        {icon && <span className="text-slate-300">{icon}</span>}
      </div>

      {/* Value */}
      <div className="metric-value" style={{ color: valueColor }}>
        <AnimatedNumber value={value} format={format} />
      </div>

      {/* Footer: delta + sparkline */}
      {(delta !== undefined || (sparkline && sparkline.length > 1)) && (
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          {delta !== undefined ? (
            <span
              className="metric-delta flex items-center gap-1"
              style={{ color: delta >= 0 ? 'var(--success)' : 'var(--danger)' }}
            >
              {delta >= 0
                ? <TrendingUp size={10} />
                : <TrendingDown size={10} />}
              {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
            </span>
          ) : (
            <span />
          )}
          {sparkline && sparkline.length > 1 && (
            <Sparkline data={sparkline} width={56} height={18} />
          )}
        </div>
      )}
    </div>
  );
};
