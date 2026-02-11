/**
 * Card 组件库 - 统一卡片样式
 * 
 * 使用规范：
 * - CardCompact: 看板小卡片 (p-3, 12px padding)
 * - CardStandard: 列表卡片 (p-4, 16px padding)
 * - CardAccent: 带强调色边条的卡片
 */

import { cn } from '@/lib/utils';
import { ReactNode, HTMLAttributes } from 'react';

// ── 基础卡片 ──
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;  // 是否显示hover效果
  clickable?: boolean;  // 是否可点击
}

export function Card({ 
  children, 
  hover = false, 
  clickable = false, 
  className, 
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        // 基础样式（统一！）
        'bg-white border border-slate-200 rounded-lg shadow-card',
        // 可选样式
        hover && 'hover:border-slate-300 hover:shadow-card-hover transition-all',
        clickable && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── 紧凑卡片（看板用）──
export function CardCompact({ children, className, ...props }: CardProps) {
  return (
    <Card className={cn('p-3', className)} hover clickable {...props}>
      {children}
    </Card>
  );
}

// ── 标准卡片 ──
export function CardStandard({ children, className, ...props }: CardProps) {
  return (
    <Card className={cn('p-4', className)} hover {...props}>
      {children}
    </Card>
  );
}

// ── 带强调色边条的卡片 ──
interface CardAccentProps extends CardProps {
  accentColor?: string;
}

export function CardAccent({ 
  children, 
  accentColor = '#3370FF', 
  className, 
  ...props 
}: CardAccentProps) {
  return (
    <Card 
      className={cn('border-l-[3px]', className)} 
      style={{ borderLeftColor: accentColor }}
      {...props}
    >
      {children}
    </Card>
  );
}
