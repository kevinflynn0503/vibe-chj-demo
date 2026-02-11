/**
 * Skeleton — 骨架屏加载占位组件
 * 
 * 使用 CSS shimmer 动画，比 animate-pulse 更丝滑
 */
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/** 基础骨架条 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton h-4', className)} />;
}

/** 卡片骨架 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white border border-slate-200 rounded-[10px] p-4 space-y-3', className)}
      style={{ boxShadow: 'var(--card-shadow)' }}>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-12 rounded" />
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

/** Tab 工作台页面骨架 */
export function PageSkeleton() {
  return (
    <div className="page-container space-y-4">
      {/* 头部区 */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white border border-slate-100 rounded-[10px] p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
      {/* 内容 */}
      <div className="grid grid-cols-2 gap-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonCard />
    </div>
  );
}

/** 二级详情页骨架 */
export function DetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* 头部 */}
      <div className="detail-header">
        <div className="detail-header-inner space-y-3">
          <Skeleton className="h-3 w-24" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
        </div>
      </div>
      {/* 内容 */}
      <div className="page-container space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <SkeletonCard className="p-6" />
            <SkeletonCard className="p-6" />
          </div>
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </div>
  );
}
