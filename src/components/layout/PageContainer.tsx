/**
 * PageContainer — 统一的页面内容容器
 * 
 * 所有 Tab 工作台页面和二级页面内容区都用这个组件，保证：
 * - 统一 max-w-[1200px]
 * - 统一 px-4 sm:px-6 py-4
 * - 统一 space-y-4
 */
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /** 使用 space-y-6 而非默认的 space-y-4 */
  loose?: boolean;
}

export function PageContainer({ children, className, loose }: PageContainerProps) {
  return (
    <div className={cn(
      'page-container',
      loose ? 'space-y-6' : 'space-y-4',
      className
    )}>
      {children}
    </div>
  );
}
