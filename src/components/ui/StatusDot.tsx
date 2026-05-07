import React from 'react';

export type DotStatus = 'live' | 'warn' | 'error' | 'idle';

interface StatusDotProps {
  status?: DotStatus;
  label?: string;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status = 'live',
  label,
  className = '',
}) => (
  <span className={`inline-flex items-center gap-1.5 ${className}`}>
    <span className={`status-dot status-dot-${status}`} />
    {label && (
      <span
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: 'rgba(250,250,249,0.40)', letterSpacing: '0.1em' }}
      >
        {label}
      </span>
    )}
  </span>
);
