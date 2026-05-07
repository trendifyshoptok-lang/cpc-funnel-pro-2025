import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warn' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const CONFIG = {
  success: {
    icon: CheckCircle2,
    bg: 'var(--success-soft)',
    border: '#A7F3D0',
    text: '#065F46',
    iconColor: 'var(--success)',
  },
  error: {
    icon: AlertCircle,
    bg: 'var(--danger-soft)',
    border: '#FECACA',
    text: '#7F1D1D',
    iconColor: 'var(--danger)',
  },
  warn: {
    icon: AlertTriangle,
    bg: 'var(--warn-soft)',
    border: '#FDE68A',
    text: '#78350F',
    iconColor: 'var(--warn)',
  },
  info: {
    icon: Info,
    bg: 'var(--bg-card)',
    border: 'var(--border-subtle)',
    text: 'var(--text-primary)',
    iconColor: 'var(--accent)',
  },
} as const;

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const cfg = CONFIG[type];
  const Icon = cfg.icon;

  return (
    <div
      className="fixed bottom-5 right-5 z-[500] toast-enter"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="flex items-center gap-2.5 pl-3 pr-2 py-2.5 min-w-[260px] max-w-[360px]"
        style={{
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 24px rgba(10,14,26,0.10), 0 0 0 1px rgba(10,14,26,0.04)',
          color: cfg.text,
        }}
      >
        <Icon size={14} style={{ color: cfg.iconColor, flexShrink: 0 }} />
        <span
          className="text-[13px] font-medium flex-1 leading-snug"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {message}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-black/5 transition-colors flex-shrink-0"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};
