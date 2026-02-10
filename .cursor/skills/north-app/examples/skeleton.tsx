/**
 * 骨架屏组件示例
 * 
 * 使用场景：数据加载中显示的占位内容
 */

// ============================================
// 卡片骨架屏
// ============================================

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4">
      {/* 标题 */}
      <div className="mb-3 h-4 w-3/4 rounded bg-gray-200" />
      {/* 描述 */}
      <div className="mb-4 h-3 w-1/2 rounded bg-gray-100" />
      {/* 标签 */}
      <div className="flex items-center gap-2">
        <div className="h-6 w-16 rounded-full bg-gray-100" />
        <div className="h-6 w-12 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

// ============================================
// 报告骨架屏
// ============================================

export function ReportSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      {/* 标题 */}
      <div className="h-8 w-1/3 rounded bg-gray-200" />
      {/* 摘要 */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-5/6 rounded bg-gray-100" />
        <div className="h-4 w-4/5 rounded bg-gray-100" />
      </div>
      {/* 章节标题 */}
      <div className="mt-8 h-6 w-1/4 rounded bg-gray-200" />
      {/* 章节内容 */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-3/4 rounded bg-gray-100" />
      </div>
    </div>
  );
}

// ============================================
// 详情页骨架屏
// ============================================

export function DetailPageSkeleton() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* 头部骨架 */}
      <div className="flex-shrink-0 border-b border-gray-100 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
        </div>
        {/* Tab 栏骨架 */}
        <div className="mt-4 flex gap-4">
          <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
          <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
          <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
        </div>
      </div>

      {/* 主体骨架 */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 左侧目录骨架 */}
        <div className="w-64 border-r border-gray-100 p-4">
          <div className="space-y-3">
            <div className="h-8 w-full animate-pulse rounded bg-gray-100" />
            <div className="ml-4 h-6 w-4/5 animate-pulse rounded bg-gray-100" />
            <div className="ml-4 h-6 w-3/5 animate-pulse rounded bg-gray-100" />
            <div className="h-8 w-full animate-pulse rounded bg-gray-100" />
            <div className="ml-4 h-6 w-4/5 animate-pulse rounded bg-gray-100" />
          </div>
        </div>

        {/* 右侧内容骨架 */}
        <div className="flex-1 overflow-y-auto p-6">
          <ReportSkeleton />
        </div>
      </div>
    </div>
  );
}

// ============================================
// 列表骨架屏
// ============================================

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-lg border border-gray-100 bg-white p-3"
        >
          <div className="h-10 w-10 rounded bg-gray-100" />
          <div className="flex-1">
            <div className="h-4 w-2/3 rounded bg-gray-200" />
            <div className="mt-1 h-3 w-1/3 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// 模板选择器骨架屏
// ============================================

export function TemplateSelectorSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-10 w-24 flex-shrink-0 animate-pulse rounded-lg bg-gray-100"
        />
      ))}
    </div>
  );
}

// ============================================
// 使用示例
// ============================================

/*
export default function Page() {
  const { loading, data } = useData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return <DataList data={data} />;
}
*/
