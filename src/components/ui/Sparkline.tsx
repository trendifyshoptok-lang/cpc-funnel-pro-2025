import React, { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  showArea?: boolean;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 80,
  height = 24,
  color,
  strokeWidth = 1.5,
  showArea = true,
  className = '',
}) => {
  const { path, areaPath, lastPoint, trend } = useMemo(() => {
    if (!data || data.length < 2) {
      return { path: '', areaPath: '', lastPoint: null, trend: 0 };
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 2;
    const innerH = height - pad * 2;
    const stepX = width / (data.length - 1);

    const points = data.map((v, i) => ({
      x: i * stepX,
      y: pad + innerH - ((v - min) / range) * innerH,
    }));

    const linePath = points
      .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
      .join(' ');

    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
    const trend = data[data.length - 1] - data[0];

    return { path: linePath, areaPath, lastPoint: points[points.length - 1], trend };
  }, [data, width, height]);

  const stroke = color ?? (trend >= 0 ? '#059669' : '#DC2626');
  const fill   = trend >= 0 ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)';

  if (!path) {
    return <div style={{ width, height }} className={`rounded bg-stone-100 ${className}`} />;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible flex-shrink-0 ${className}`}
    >
      {showArea && <path d={areaPath} fill={fill} />}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {lastPoint && (
        <>
          <circle cx={lastPoint.x} cy={lastPoint.y} r={3} fill={stroke} opacity={0.25}>
            <animate attributeName="r"       from="3"   to="7"   dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.25" to="0" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx={lastPoint.x} cy={lastPoint.y} r={2} fill={stroke} />
        </>
      )}
    </svg>
  );
};

export default Sparkline;
