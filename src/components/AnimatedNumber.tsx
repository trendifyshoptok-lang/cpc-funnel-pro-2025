import React, { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  format?: (v: number) => string;
  duration?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  format = (v) => v.toFixed(2),
  duration = 500,
  className = '',
}) => {
  const [display, setDisplay] = useState(value);
  const prevRef  = useRef(value);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  useEffect(() => {
    const from = prevRef.current;
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // ease-out cubic

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed  = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const current  = from + (value - from) * ease(progress);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = value;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <span className={`tnum ${className}`}>
      {format(display)}
    </span>
  );
};
