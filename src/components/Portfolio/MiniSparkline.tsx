import React from 'react';

interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  width = 80,
  height = 28,
  color,
  className = '',
}) => {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} className={className}>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2}
          stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="3 3" />
      </svg>
    );
  }

  const allZero = data.every(v => v === 0);
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const padX = 2;
  const padY = 3;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;

  const pts = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * usableW;
    const y = allZero
      ? padY + usableH / 2
      : padY + usableH - ((v - min) / range) * usableH;
    return [x, y] as [number, number];
  });

  const positive = (max + min) / 2 >= 0;
  const autoColor = allZero
    ? '#cbd5e1'
    : positive
      ? '#22c55e'
      : '#ef4444';

  const strokeColor = color ?? autoColor;

  // Build smooth path
  const d = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    return `${acc} C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }, '');

  // Fill area
  const fillD = `${d} L ${pts[pts.length - 1][0]} ${height} L ${pts[0][0]} ${height} Z`;

  return (
    <svg width={width} height={height} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`sg-${strokeColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.15} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#sg-${strokeColor.replace('#', '')})`} />
      <path d={d} fill="none" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
