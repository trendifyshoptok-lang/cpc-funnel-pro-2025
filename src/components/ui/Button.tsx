/**
 * Button — design-system button that uses the .btn-* tokens from index.css.
 *
 * Variants map to CSS classes:
 *   primary   → .btn .btn-primary   (cyan — analytics, navigation CTAs)
 *   save      → .btn .btn-save      (blue-800 — save, confirm, commit actions)
 *   secondary → .btn .btn-secondary (white/border — secondary actions)
 *   ghost     → .btn .btn-ghost     (transparent — tertiary actions)
 *   danger    → .btn .btn-danger    (red — destructive actions)
 *   ai        → .btn .btn-ai        (violet — AI-powered feature CTAs only)
 *   dark      → @deprecated alias → save (kept for backward-compat, use save instead)
 *
 * Sizes:
 *   sm → .btn-sm  (text-xs  px-3 py-1.5)
 *   md → .btn-md  (text-sm  px-4 py-2)    ← default
 *   lg → .btn-lg  (text-base px-5 py-2.5)
 *
 * Props:
 *   align     — 'center' (default) | 'left' | 'right'
 *   loading   — show spinner + disable
 *   iconLeft  — icon before label
 *   iconRight — icon after label
 *   fullWidth — stretch to container width
 */
import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'save' | 'secondary' | 'ghost' | 'danger' | 'ai' | 'dark';
type Size    = 'sm' | 'md' | 'lg';
type Align   = 'center' | 'left' | 'right';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Text alignment inside the button (default: center) */
  align?: Align;
  /** Show spinner + disable button while true */
  loading?: boolean;
  /** Icon rendered left of label */
  iconLeft?: React.ReactNode;
  /** Icon rendered right of label */
  iconRight?: React.ReactNode;
  /** Stretch to full container width */
  fullWidth?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary:   'btn btn-primary',
  save:      'btn btn-save',
  secondary: 'btn btn-secondary',
  ghost:     'btn btn-ghost',
  danger:    'btn btn-danger',
  ai:        'btn btn-ai',
  /** @deprecated — use save instead */
  dark:      'btn btn-save',
};

const SIZE_CLASS: Record<Size, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

const ALIGN_CLASS: Record<Align, string> = {
  center: 'justify-center',
  left:   'justify-start',
  right:  'justify-end',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  align = 'center',
  loading = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...rest
}) => {
  const classes = [
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    ALIGN_CLASS[align],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={classes}
    >
      {loading
        ? <Loader2 size={14} className="animate-spin flex-shrink-0" />
        : iconLeft && <span className="flex-shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">{iconLeft}</span>
      }
      {children && <span>{children}</span>}
      {!loading && iconRight && (
        <span className="flex-shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">{iconRight}</span>
      )}
    </button>
  );
};
