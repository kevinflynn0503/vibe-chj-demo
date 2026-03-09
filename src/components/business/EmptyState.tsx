/**
 * EmptyState — 空状态
 *
 * Impeccable 重构：
 * - 去掉大图标（图标+圆角矩形模板）
 * - 空状态应"教用户如何开始"
 */

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  message?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  message = '暂无数据',
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center py-16 animate-fade-in', className)}>
      {Icon && <Icon className="h-8 w-8 text-text-muted mb-3 opacity-40" />}
      <p className="text-sm font-medium text-text-secondary">{message}</p>
      {description && (
        <p className="text-xs text-text-muted mt-1.5 max-w-xs text-center">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
