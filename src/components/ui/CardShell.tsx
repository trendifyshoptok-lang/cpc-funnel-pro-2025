/**
 * CardShell — the canonical card pattern used throughout the app.
 *
 * Structure:
 *   ┌─────────────────────────────────────────────┐
 *   │ [iconBox] Title          [headerRight slot] │ ← header (optional)
 *   │           Subtitle                          │
 *   ├─────────────────────────────────────────────┤
 *   │ {children}                                  │ ← body
 *   └─────────────────────────────────────────────┘
 *
 * Usage:
 *   <CardShell icon={<Activity size={14} />} iconBg="bg-blue-600" title="Dados" subtitle="Google Ads">
 *     ...content...
 *   </CardShell>
 */
import React from 'react';

interface CardShellProps {
  /** Lucide icon element rendered inside the icon box */
  icon?: React.ReactNode;
  /** Tailwind bg class for the icon box, e.g. "bg-blue-600" */
  iconBg?: string;
  /** Tailwind shadow class for the icon box, e.g. "shadow-blue-200" */
  iconShadow?: string;
  /** Card heading */
  title: string;
  /** Small sub-label below title */
  subtitle?: string;
  /** Content rendered on the right side of the header row */
  headerRight?: React.ReactNode;
  /** Card body content */
  children: React.ReactNode;
  /** Extra classes for the outermost div */
  className?: string;
  /** Extra classes for the body wrapper div */
  bodyClassName?: string;
  /**
   * When true the body receives no padding — useful when children
   * are grids/dividers that should bleed to the card edges.
   */
  noPadding?: boolean;
  /**
   * Footer slot — rendered below body, separated by a top border.
   * Use for save buttons, status rows, etc.
   */
  footer?: React.ReactNode;
}

export const CardShell: React.FC<CardShellProps> = ({
  icon,
  iconBg = 'bg-slate-600',
  iconShadow,
  title,
  subtitle,
  headerRight,
  children,
  className = '',
  bodyClassName = '',
  noPadding = false,
  footer,
}) => {
  const hasHeader = !!(icon || title || subtitle || headerRight);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden ${className}`}>

      {/* ── Header ── */}
      {hasHeader && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconShadow ? `shadow-sm ${iconShadow}` : ''}`}
              >
                <span className="text-white [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-800 leading-none truncate">{title}</div>
              {subtitle && (
                <div className="text-2xs text-slate-500 mt-0.5 font-medium leading-none">{subtitle}</div>
              )}
            </div>
          </div>

          {headerRight && (
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">{headerRight}</div>
          )}
        </div>
      )}

      {/* ── Body ── */}
      <div className={noPadding ? bodyClassName : `p-card-lg ${bodyClassName}`}>
        {children}
      </div>

      {/* ── Footer ── */}
      {footer && (
        <div className="border-t border-slate-100 px-5 py-3">
          {footer}
        </div>
      )}
    </div>
  );
};
