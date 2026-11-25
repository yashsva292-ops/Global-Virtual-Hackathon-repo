import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

interface NumberTickerProps {
  value: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  decimals = 2,
  className,
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const targetRef = useRef(value);
  const currentRef = useRef(value);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    targetRef.current = value;

    const animate = () => {
      const diff = targetRef.current - currentRef.current;
      if (Math.abs(diff) < 0.001) {
        currentRef.current = targetRef.current;
        setDisplayValue(targetRef.current);
        return;
      }

      // Smooth exponential approach
      currentRef.current += diff * 0.18;
      setDisplayValue(currentRef.current);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [value]);

  return (
    <span className={cn('font-mono tabular-nums tracking-tight', className)}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};
