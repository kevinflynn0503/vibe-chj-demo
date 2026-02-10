/**
 * 加载动画示例
 * 
 * 各种加载状态的动画组件
 */

// ============================================
// 旋转加载动画
// ============================================

// 样式 1：边框旋转（最常用）
export function SpinnerBorder({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${className}`}
    />
  );
}

// 样式 2：环形旋转
export function SpinnerRing({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-indigo-500 border-t-transparent ${className}`}
    />
  );
}

// 样式 3：带图标
export function SpinnerWithIcon() {
  return (
    <div className="relative h-12 w-12">
      {/* 外圈旋转 */}
      <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500" />
      {/* 中间图标 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="h-5 w-5 animate-pulse text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
    </div>
  );
}

// ============================================
// 全屏加载
// ============================================

export function FullScreenLoading({ message = '加载中...' }: { message?: string }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <SpinnerBorder className="mx-auto h-8 w-8" />
        <p className="mt-4 text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

// ============================================
// 内容区域加载
// ============================================

export function ContentLoading({ message = '正在加载...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <SpinnerRing className="h-8 w-8" />
      <p className="mt-4 text-sm text-gray-500">{message}</p>
    </div>
  );
}

// ============================================
// 按钮内加载
// ============================================

export function ButtonLoading() {
  return (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  );
}

// 使用示例
export function SubmitButton({
  loading,
  children,
  ...props
}: {
  loading: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading && <ButtonLoading />}
      {children}
    </button>
  );
}

// ============================================
// 调研中状态
// ============================================

export function ResearchingStatus() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <SpinnerWithIcon />
      </div>
      <p className="mt-4 text-gray-500">正在调研中...</p>
      <p className="mt-1 text-xs text-gray-400">AI 正在为您收集和分析信息</p>
    </div>
  );
}

// ============================================
// 图片加载状态
// ============================================

export function ImageLoading({ className = 'h-64' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      <SpinnerBorder className="h-6 w-6" />
    </div>
  );
}

// ============================================
// 进度条
// ============================================

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

// ============================================
// 脉冲点加载
// ============================================

export function PulseDots() {
  return (
    <div className="flex items-center gap-1">
      <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
      <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
      <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// ============================================
// 使用示例
// ============================================

/*
// 全屏加载
if (status !== 'running') {
  return <FullScreenLoading message="正在初始化..." />;
}

// 内容加载
{isLoading && <ContentLoading message="正在加载项目列表..." />}

// 按钮加载
<SubmitButton loading={isSubmitting}>
  提交
</SubmitButton>

// 调研中状态
{isResearching && <ResearchingStatus />}
*/
