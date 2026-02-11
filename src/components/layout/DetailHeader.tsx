/**
 * DetailHeader — 统一的二级页面头部栏
 * 
 * 所有二级/详情页面使用同一个头部模式：
 * - bg-white border-b
 * - max-w-[1200px] 内容区
 * - 统一 padding
 */
import { cn } from '@/lib/utils';

interface DetailHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DetailHeader({ children, className }: DetailHeaderProps) {
  return (
    <div className="detail-header">
      <div className={cn('detail-header-inner', className)}>
        {children}
      </div>
    </div>
  );
}
