/**
 * SegmentedControl — replaces raw inline toggle patterns.
 *
 * Typical replacements:
 *   - Grid/Table view toggle  (Portfolio, Dashboard)
 *   - Sort direction buttons  (column headers)
 *   - Filter chip groups      (status, nicho, etc.)
 *
 * Usage:
 *   const [view, setView] = useState<'grid'|'table'>('grid');
 *   <SegmentedControl
 *     options={[
 *       { value: 'grid',  label: 'Grid',  icon: <LayoutGrid size={13}/> },
 *       { value: 'table', label: 'Lista', icon: <List size={13}/> },
 *     ]}
 *     value={view}
 *     onChange={setView}
 *   />
 */
import React from 'react';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  /** Accessibility title override if label is not a string */
  title?: string;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  /** sm = compact (height 28px), md = standard (height 32px) */
  size?: 'sm' | 'md';
  /** Additional classes on the container */
  className?: string;
  /** Disable all segments */
  disabled?: boolean;
}

const SIZE: Record<'sm' | 'md', string> = {
  sm: 'text-[11px] px-2.5 py-1 gap-1',
  md: 'text-xs    px-3   py-1.5 gap-1.5',
};

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'sm',
  className = '',
  disabled = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      className={`
        inline-flex items-center
        bg-slate-100 rounded-xl p-0.5
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
        ${className}
      `}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={opt.title ?? (typeof opt.label === 'string' ? opt.label : undefined)}
            title={opt.title ?? (typeof opt.label === 'string' ? opt.label : undefined)}
            onClick={() => onChange(opt.value)}
            className={`
              inline-flex items-center justify-center font-semibold
              rounded-lg transition-all select-none cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
              ${SIZE[size]}
              ${isActive
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-700 border border-transparent'
              }
            `}
            style={{
              fontFamily: 'var(--font-ui)',
              transitionDuration: 'var(--motion-fast)',
            }}
          >
            {opt.icon && (
              <span className={isActive ? 'text-slate-700' : 'text-slate-400'}>
                {opt.icon}
              </span>
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
