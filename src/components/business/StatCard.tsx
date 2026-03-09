/**
 * StatCard — 统计指标展示
 *
 * 重构：去掉 hero metric 模板（大数字+小标签+图标），
 * 改为 inline 展示，用排版层级区分而非卡片包裹。
 * 去掉 font-mono，用 tabular-nums 实现等宽数字。
 */

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  highlight?: boolean;
  className?: string;
  onClick?: () => void;
  /** @deprecated */
  variant?: string;
  /** @deprecated */
  color?: string;
  /** @deprecated */
  bg?: string;
  /** @deprecated */
  iconBg?: string;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  highlight = true,
  className,
  onClick,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-surface-card border border-line rounded-lg p-4',
        'transition-all duration-normal ease-out-expo',
        'hover:shadow-card-hover hover:border-line-hover',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <Icon className="h-3.5 w-3.5 text-text-muted" />
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <div className={cn(
        'text-2xl font-semibold leading-none tabular-nums',
        highlight ? 'text-brand' : 'text-text-primary'
      )}>
        {typeof value === 'number' ? (
          <AnimatedNumber value={value} className="" />
        ) : value}
      </div>
    </div>
  );
}
