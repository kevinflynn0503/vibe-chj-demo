/**
 * StatCard — 统一统计卡片组件
 *
 * 重构后：去掉多色 filled 模式，统一为白底卡片 + 品牌蓝数字 + 灰色图标
 * 对齐 deer-flow 的克制风格：不用彩色背景区分，用图标和文字区分
 *
 * 使用方式：
 * <StatCard icon={Building2} value={326} label="园区企业" />
 * <StatCard icon={Shield} value={12} label="A级企业" highlight />
 */

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  /** 是否高亮（数字用品牌蓝，否则用 text-primary） */
  highlight?: boolean;
  className?: string;
  onClick?: () => void;
  /** @deprecated 兼容旧代码，不再使用 */
  variant?: string;
  /** @deprecated 兼容旧代码 */
  color?: string;
  /** @deprecated 兼容旧代码 */
  bg?: string;
  /** @deprecated 兼容旧代码 */
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
        'transition-colors duration-150',
        'hover:bg-surface-hover-card',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted">{label}</span>
        <Icon className="h-3.5 w-3.5 text-text-muted" />
      </div>
      <div className={cn(
        'text-2xl font-semibold font-mono leading-none tabular-nums',
        highlight ? 'text-brand' : 'text-text-primary'
      )}>
        {typeof value === 'number' ? (
          <AnimatedNumber value={value} className="" />
        ) : value}
      </div>
    </div>
  );
}
