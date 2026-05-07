import React, { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface CardProps {
  title?: string;
  subtitle?: string;
  sparkline?: number[];
  delta?: number;
  metric?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  sparkline,
  delta,
  metric,
  collapsible = false,
  defaultOpen = false,
  actions,
  children,
  className = '',
  noPadding = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const hasHeader = !!(title || subtitle || sparkline || metric !== undefined || actions || collapsible);
  const isOpen = collapsible ? open : true;

  return (
    <div className={`card overflow-hidden ${className}`}>
      {hasHeader && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 ${
            collapsible
              ? 'cursor-pointer select-none hover:bg-slate-50/60 transition-colors duration-150'
              : ''
          }`}
          style={{ minHeight: 44 }}
          onClick={() => collapsible && setOpen((o) => !o)}
        >
          {/* Left */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="min-w-0">
              {title && (
                <p
                  className="text-[13px] font-semibold text-slate-900 truncate"
                  style={{ fontFamily: 'var(--font-ui)', letterSpacing: '-0.01em' }}
                >
                  {title}
                </p>
              )}
              {subtitle && (
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {sparkline && sparkline.length > 1 && (
              <Sparkline data={sparkline} width={72} height={22} />
            )}
            {metric && (
              <span className="tnum text-sm font-bold text-stone-900">{metric}</span>
            )}
            {delta !== undefined && (
              <span
                className="tnum text-xs font-semibold"
                style={{ color: delta >= 0 ? 'var(--success)' : 'var(--danger)' }}
              >
                {delta >= 0 ? '+' : ''}
                {delta.toFixed(1)}%
              </span>
            )}
            {actions}
            {collapsible && (
              <ChevronDown
                size={14}
                className="text-slate-500 flex-shrink-0"
                style={{
                  transition: `transform var(--motion-base) var(--ease-out)`,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div className={hasHeader ? 'border-t border-slate-100' : ''}>
          {noPadding ? children : <div className="p-4">{children}</div>}
        </div>
      )}
    </div>
  );
};
