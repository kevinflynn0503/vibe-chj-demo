/**
 * SectionTitle — 区块标题
 *
 * 重构：去掉"左侧色条"模式（V-DN-2 违规），
 * 改为用字号+字重的排版层级区分 section。
 */

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SectionTitleProps {
  children: ReactNode;
  icon?: ReactNode;
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
        'flex items-center gap-2 text-sm font-semibold text-text-primary tracking-tight',
        className,
      )}
    >
      {icon && (
        <span className="shrink-0 text-text-muted [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      )}
      {children}
      {extra && (
        <span className="text-xs text-text-muted font-normal ml-auto">
          {extra}
        </span>
      )}
    </div>
  );
}
