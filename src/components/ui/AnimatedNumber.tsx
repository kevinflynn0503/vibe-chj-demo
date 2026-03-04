'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (n: number) => string;
}

/**
 * AnimatedNumber — 数字从 0 滚动到目标值
 *
 * 用于统计卡片、KPI 等场景，给数据展示增加动感
 */
export function AnimatedNumber({
  value,
  duration = 600,
  className,
  formatter = (n) => Math.round(n).toLocaleString(),
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const startVal = display;
    const diff = value - startVal;
    if (diff === 0) return;

    startRef.current = performance.now();

    function step(now: number) {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(startVal + diff * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={className}>{formatter(display)}</span>;
}
