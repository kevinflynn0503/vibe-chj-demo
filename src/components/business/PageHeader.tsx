/**
 * PageHeader — 统一页面头部组件
 */

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  extra?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  extra,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-sp-6 pb-sp-3',
        className,
      )}
    >
      <div>
        <h1 className="text-xl font-semibold text-text-primary tracking-tight">{title}</h1>
        {description && (
          <p className="text-xs text-text-muted mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
      {extra && !actions && extra}
    </div>
  );
}
