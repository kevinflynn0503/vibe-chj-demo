/**
 * EmptyState — 统一空状态组件
 *
 * 替代各页面重复的空状态提示
 *
 * 使用方式：
 * <EmptyState icon={Building2} message="未找到匹配企业" />
 * <EmptyState icon={FileText} message="暂无走访记录" action={<Button>新建走访</Button>} />
 */

import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  message?: string;
  description?: string;
  /** 操作区（按钮等） */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  message = '暂无数据',
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center py-16', className)}>
      <Icon className="h-12 w-12 text-text-muted mb-3" />
      <p className="text-sm text-text-secondary">{message}</p>
      {description && (
        <p className="text-xs text-text-muted mt-1">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
