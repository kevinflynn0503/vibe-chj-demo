/**
 * ProgressBar — 统一进度条组件
 *
 * 替代所有页面中内联 style={{ width: `${percent}%` }} 的进度条
 */

import { cn } from '@/lib/utils';

type ProgressVariant = 'brand' | 'success' | 'warning' | 'error' | 'muted';

interface ProgressBarProps {
  /** 0-100 的百分比 */
  value: number;
  /** 颜色变体 */
  variant?: ProgressVariant;
  /** 轨道高度 */
  size?: 'sm' | 'md';
  className?: string;
  /** 是否显示百分比文字 */
  showLabel?: boolean;
}

const variantFill: Record<ProgressVariant, string> = {
  brand: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  muted: 'bg-text-muted',
};

export function ProgressBar({
  value,
  variant = 'brand',
  size = 'sm',
  className,
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'flex-1 rounded-full bg-[rgba(27,27,27,0.06)] overflow-hidden',
        size === 'sm' ? 'h-1.5' : 'h-2.5',
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            variantFill[variant],
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-text-muted font-mono tabular-nums shrink-0">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
