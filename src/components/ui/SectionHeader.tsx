/**
 * SectionHeader — dark navy header block used at the tops of Analysis / Setup cards.
 *
 * Visual spec:
 *   ┌────────────────────────────────────────────────────────────┐
 *   │ [icon]  SECTION TITLE                                      │
 *   │         Subtitle / context                                 │
 *   └────────────────────────────────────────────────────────────┘
 *
 * Background: gradient dark navy (#0F172A → #1E293B)
 * Used by: Analysis index, Setup sections, any full-width dark header
 *
 * Lighter variant (light=true): white card header row — matches CampaignInputs style
 */
import React from 'react';

interface SectionHeaderProps {
  icon?: React.ReactNode;
  /** Tailwind bg class for icon box bg when light=false */
  iconBg?: string;
  title: string;
  subtitle?: string;
  /** Content for the right slot */
  right?: React.ReactNode;
  /**
   * light=true → white background (card header row style)
   * light=false (default) → dark navy gradient (full-width section header)
   */
  light?: boolean;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  iconBg = 'bg-slate-700',
  title,
  subtitle,
  right,
  light = false,
  className = '',
}) => {
  if (light) {
    /* ── Light variant: card header row ─────────────────────────── */
    return (
      <div className={`flex items-center justify-between px-5 py-4 border-b border-slate-100 ${className}`}>
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
              <span className="text-white [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
            </div>
          )}
          <div>
            <div className="text-[13px] font-bold text-slate-800 leading-none">{title}</div>
            {subtitle && (
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{subtitle}</div>
            )}
          </div>
        </div>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    );
  }

  /* ── Dark variant: full-width section header ─────────────────── */
  return (
    <div
      className={`px-5 py-5 ${className}`}
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <span className="text-white [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
            </div>
          )}
          <div>
            <div
              className="text-sm font-bold leading-none"
              style={{ color: 'var(--text-on-dark-strong)' }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                className="text-[11px] mt-1 font-medium"
                style={{ color: 'var(--text-on-dark-muted)' }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    </div>
  );
};
