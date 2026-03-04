/**
 * SectionTitle — 统一区块标题组件
 *
 * 替代 CSS 类 .section-title，组件化实现带品牌色竖线的区块标题
 *
 * 使用方式：
 * <SectionTitle>今日重点</SectionTitle>
 * <SectionTitle icon={<Zap />} extra={<span>5 条新消息</span>}>AI 动态</SectionTitle>
 */

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SectionTitleProps {
  children: ReactNode;
  /** 标题前的图标 */
  icon?: ReactNode;
  /** 标题后的附加信息 */
  extra?: ReactNode;
  className?: string;
}

export function SectionTitle({
  children,
  icon,
  extra,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 text-sm font-semibold text-text-primary',
        className,
      )}
    >
      {/* 品牌色竖线 */}
      <span className="w-[3px] h-4 bg-brand rounded-full shrink-0" />
      {icon && (
        <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      )}
      {children}
      {extra && (
        <span className="text-xs text-text-muted font-normal ml-1">
          {extra}
        </span>
      )}
    </div>
  );
}
