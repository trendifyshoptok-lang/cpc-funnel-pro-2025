import React from 'react';

interface ShimmerProps {
  width?: number | string;
  height?: number | string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%',
  height = 16,
  rounded = 'md',
  className = '',
}) => {
  const r = { sm: 'rounded', md: 'rounded-md', lg: 'rounded-lg', full: 'rounded-full' }[rounded];
  return (
    <div
      className={`skeleton ${r} ${className}`}
      style={{ width, height }}
    />
  );
};
