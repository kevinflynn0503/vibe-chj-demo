# UI 设计规范

## 颜色系统

### 语义颜色

| 用途 | 颜色 | Tailwind 类 |
|------|------|-------------|
| 主色 | 蓝色 | `blue-500`, `blue-600` |
| 成功 | 绿色 | `emerald-50`, `emerald-600` |
| 警告 | 琥珀色 | `amber-50`, `amber-600` |
| 错误 | 红色 | `red-50`, `red-600` |
| 中性 | 灰色 | `gray-50` ~ `gray-900` |
| 特殊 | 紫色 | `purple-500`, `purple-600` |

### 状态颜色映射

```tsx
const statusConfig = {
  completed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  in_progress: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  pending: {
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    border: 'border-gray-200',
  },
  failed: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
};
```

## 间距系统

基于 4px 基准：

| 类型 | 值 | 用途 |
|------|-----|------|
| 小间距 | `gap-1`, `gap-1.5`, `gap-2` | 图标与文字、紧凑元素 |
| 中间距 | `gap-3`, `gap-4` | 卡片内元素、按钮组 |
| 大间距 | `gap-6`, `gap-8` | 区块之间 |
| 页面边距 | `px-6 py-4`, `px-6 py-6` | 页面内容 |
| 最大宽度 | `max-w-5xl` | 内容容器 |

## 圆角规范

| 大小 | 值 | 用途 |
|------|-----|------|
| 小圆角 | `rounded`, `rounded-lg` | 按钮、标签 |
| 中圆角 | `rounded-xl` | 卡片、对话框 |
| 大圆角 | `rounded-2xl` | 大型容器 |
| 全圆角 | `rounded-full` | 头像、徽章 |

## 字体大小

| 大小 | 值 | 用途 |
|------|-----|------|
| 超大 | `text-2xl` (24px) | 页面主标题 |
| 大 | `text-lg` (18px) | 副标题 |
| 中 | `text-base` (16px) | 正文 |
| 小 | `text-sm` (14px) | 辅助文本 |
| 超小 | `text-xs` (12px) | 标签、元数据 |

## 阴影系统

| 大小 | 值 | 用途 |
|------|-----|------|
| 小阴影 | `shadow-sm` | 按钮、输入框 |
| 中阴影 | `shadow` | 卡片悬停 |
| 大阴影 | `shadow-lg` | 对话框 |
| 超大阴影 | `shadow-2xl` | 弹出层 |

## 页面布局

### 标准页面结构

```tsx
<div className="min-h-screen bg-gray-50/50">
  {/* 头部 - 固定顶部 */}
  <div className="sticky top-0 z-10 border-b border-gray-100 bg-white">
    <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
      <h1 className="text-base font-semibold text-gray-900">App 名称</h1>
      <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white">
        操作按钮
      </button>
    </div>
  </div>

  {/* 内容区域 */}
  <div className="mx-auto max-w-5xl px-6 py-6">
    {/* 内容网格 */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 卡片列表 */}
    </div>
  </div>
</div>
```

### 详情页布局

```tsx
<div className="flex h-screen flex-col overflow-hidden bg-white">
  {/* 头部 - 固定 */}
  <div className="z-10 flex-shrink-0 border-b border-gray-100 bg-white">
    <DetailHeader />
    <ContentTabs />
  </div>

  {/* 主体区域 - 可滚动 */}
  <div className="flex min-h-0 flex-1 overflow-hidden">
    {/* 左侧导航（可选） */}
    <aside className="w-64 overflow-y-auto border-r border-gray-100">
      <TocNav />
    </aside>
    
    {/* 右侧内容 */}
    <main className="flex-1 overflow-y-auto p-6">
      {/* 内容 */}
    </main>
  </div>
</div>
```

## 响应式设计

```tsx
// 网格响应式
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

// 隐藏/显示
<div className="hidden lg:block">  {/* 仅大屏显示 */}
<div className="lg:hidden">        {/* 仅小屏显示 */}

// 布局切换
<div className="flex flex-col lg:flex-row">
```

## 动画规范

### 骨架屏动画

```tsx
<div className="animate-pulse">
  <div className="h-4 w-3/4 rounded bg-gray-200" />
  <div className="mt-2 h-4 w-1/2 rounded bg-gray-100" />
</div>
```

### 旋转加载

```tsx
// 样式 1：边框旋转
<div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />

// 样式 2：环形旋转
<div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
```

### 过渡动画

```tsx
// 颜色过渡
<button className="transition-colors hover:bg-gray-100">

// 全属性过渡
<div className="transition-all duration-300 ease-out">

// 透明度过渡
<div className="opacity-0 transition-opacity group-hover:opacity-100">
```

## 交互反馈

### Hover 状态

```tsx
<button className="hover:bg-gray-50 hover:text-gray-900">
<div className="hover:shadow-md">
```

### Focus 状态

```tsx
<input className="focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
```

### Disabled 状态

```tsx
<button className="disabled:cursor-not-allowed disabled:opacity-50">
```

## 组件设计模式

### 卡片组件

```tsx
<div className="rounded-xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md">
  <h3 className="text-sm font-medium text-gray-900">标题</h3>
  <p className="mt-1 text-xs text-gray-500">描述</p>
  <div className="mt-3 flex items-center gap-2">
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">
      标签
    </span>
  </div>
</div>
```

### 按钮组件

```tsx
// 主按钮
<button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
  主要操作
</button>

// 次按钮
<button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
  次要操作
</button>

// 文本按钮
<button className="text-sm text-blue-600 hover:underline">
  链接
</button>
```

### 输入框组件

```tsx
<input
  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
  placeholder="请输入..."
/>
```

### 标签页组件

```tsx
<div className="flex border-b border-gray-100">
  <button
    className={cn(
      'px-4 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'border-b-2 border-blue-500 text-blue-600'
        : 'text-gray-500 hover:text-gray-700'
    )}
  >
    标签名
  </button>
</div>
```

## 特殊设计元素

### 渐变背景

```tsx
<div className="bg-gradient-to-br from-blue-50 to-purple-50">
```

### 渐变装饰条

```tsx
<div className="h-1 w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
```

### 进度条

```tsx
<div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
  <div
    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

### 空状态

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="mb-4 rounded-full bg-gray-100 p-4">
    <svg className="h-8 w-8 text-gray-400">...</svg>
  </div>
  <h3 className="text-sm font-medium text-gray-900">暂无数据</h3>
  <p className="mt-1 text-xs text-gray-500">点击上方按钮创建</p>
</div>
```
