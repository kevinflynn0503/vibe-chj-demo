/**
 * PageHeader — 统一页面头部组件
 *
 * 替代各页面重复的 "标题 + 描述 + 操作按钮" 头部区域
 *
 * 使用方式：
 * <PageHeader
 *   title="企业画像库"
 *   description="共 326 家园区企业"
 *   actions={<><Button>AI 分析</Button><Button variant="primary">AI 推荐</Button></>}
 * />
 */

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** 右侧操作按钮区 */
  actions?: ReactNode;
  /** 右侧统计信息（用于首页等场景，与 actions 互斥） */
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
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-5 pb-1',
        className,
      )}
    >
      <div>
        <h1 className="text-lg font-semibold text-text-primary tracking-tight">{title}</h1>
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
