/**
 * IconButton — accessible icon-only button primitive.
 *
 * Replaces raw icon-only <button> elements that lack aria-label.
 * The `label` prop is required and becomes aria-label + title.
 *
 * Usage:
 *   <IconButton icon={<X size={14}/>} label="Fechar" onClick={onClose} />
 *   <IconButton icon={<Copy size={14}/>} label="Copiar" variant="outline" size="sm" />
 *   <IconButton icon={<ChevronDown size={14}/>} label="Expandir" variant="subtle" />
 */
import React from 'react';

export type IconButtonVariant = 'ghost' | 'outline' | 'subtle';
export type IconButtonSize    = 'xs' | 'sm' | 'md';

interface IconButtonProps {
  /** The icon element (e.g. <X size={14}/>) */
  icon: React.ReactNode;
  /** Required for accessibility — becomes aria-label and title */
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** ghost=transparent bg, outline=bordered, subtle=filled-soft */
  variant?: IconButtonVariant;
  /** xs=24px, sm=28px, md=32px hit area */
  size?: IconButtonSize;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  /** Override icon color class (default comes from variant) */
  iconClassName?: string;
}

const SIZE_CLS: Record<IconButtonSize, string> = {
  xs: 'w-6 h-6 rounded-lg',
  sm: 'w-7 h-7 rounded-lg',
  md: 'w-8 h-8 rounded-xl',
};

const VARIANT_CLS: Record<IconButtonVariant, string> = {
  ghost:   'bg-transparent border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-100',
  outline: 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 hover:border-slate-300',
  subtle:  'bg-slate-50 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100',
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'ghost',
  size = 'sm',
  className = '',
  disabled = false,
  type = 'button',
  iconClassName,
}) => {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center flex-shrink-0
        border cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
        transition-all
        ${SIZE_CLS[size]}
        ${VARIANT_CLS[variant]}
        ${className}
      `}
      style={{
        transitionDuration: 'var(--motion-fast)',
      }}
    >
      <span className={iconClassName}>{icon}</span>
    </button>
  );
};
