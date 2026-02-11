# vibe-chj-demo UI 规范统一深度分析

> **文档目标**：全面诊断项目中UI不规范问题，提出系统化的统一方案  
> **创建日期**：2026-02-11  
> **项目**：漕河泾智能驾驶舱 B 端应用

---

## 📋 目录

1. [现状诊断](#1-现状诊断)
2. [核心问题分析](#2-核心问题分析)
3. [Design Token 体系设计](#3-design-token-体系设计)
4. [组件规范方案](#4-组件规范方案)
5. [实施路线图](#5-实施路线图)
6. [优先级与影响评估](#6-优先级与影响评估)

---

## 1. 现状诊断

### 1.1 项目技术栈

- **框架**：Next.js 14 + TypeScript
- **样式方案**：Tailwind CSS + CSS Variables + Custom CSS Classes
- **组件策略**：自定义组件 + Utility-First CSS

### 1.2 现有规范体系

#### ✅ 已有的良好实践

1. **CSS 变量体系**（`src/index.css`）
   ```css
   --bg-primary, --bg-card, --bg-section
   --text-primary, --text-secondary, --text-muted
   --brand, --brand-hover, --brand-subtle
   --card-radius: 10px
   --card-shadow: ...
   ```

2. **自定义 CSS 类库**
   - `.card`, `.stat-card`, `.enterprise-card`
   - `.btn`, `.btn-primary`, `.btn-default`, `.btn-ghost`
   - `.tag`, `.tag-blue`, `.tag-green`
   - `.section-title`, `.dtable`

3. **Tailwind 扩展配置**
   ```js
   colors: { brand, surface, data }
   borderRadius: { sm: '6px', DEFAULT: '8px', lg: '12px' }
   ```

4. **布局容器组件**
   - `PageContainer` 组件
   - `.page-container` 类
   - `.detail-header` 类

---

## 2. 核心问题分析

### 2.1 字体大小规范问题 🔴

#### 问题现象

| 使用场景 | 实际使用的字号 | 出现位置 | 问题 |
|---------|--------------|---------|------|
| 正文 | `text-sm`(13px), `text-xs`(12px), 14px(body默认) | 混用于各个页面 | **3种字号混用** |
| 小字/辅助文字 | `text-xs`(12px), `text-[11px]`, `text-[10px]` | 标签、提示、时间戳 | **无统一标准** |
| 标题 | `text-base`(16px), `text-sm`(14px), `text-lg`(18px) | 页面标题、卡片标题 | **层级不清晰** |
| 数值/统计 | `text-xl`(20px), `text-2xl`(24px), `text-lg`(18px) | KPI卡片、统计数据 | **大小不一致** |
| 按钮文字 | `text-[11px]`, `text-xs`, `13px`(.btn默认) | 各种按钮 | **同一组件不同大小** |
| 表格 | `12px`(thead), `13px`(tbody) | `.dtable` | 相对统一 |

#### 代码示例（不规范案例）

**visit/page.tsx**：
```tsx
// 标题使用 text-base
<h1 className="text-base font-bold text-slate-900">走访任务看板</h1>
// 描述文字使用 text-xs
<p className="text-xs text-slate-400 mt-0.5">...</p>
// 企业名称使用 text-sm
<div className="text-sm font-semibold text-slate-900">...</div>
// 小标签使用 text-[10px]
<span className="text-[10px] px-1.5 py-0.5">...</span>
// 详情文字使用 text-[11px]
<div className="text-[11px] text-slate-500">...</div>
// 按钮文字特殊处理
<button className="text-[10px] text-[#3370FF]">查看准备 →</button>
```

**page.tsx (首页)**：
```tsx
// 统计值使用 text-xl
<div className="text-xl font-bold font-mono">...</div>
// 标签使用 text-xs
<div className="text-xs text-slate-600">...</div>
// 标题使用 text-sm
<p className="text-sm font-semibold text-slate-900">...</p>
// 场景卡片标题使用 text-sm
<h3 className="text-sm font-semibold text-slate-900">...</h3>
// 场景描述使用 text-[10px]
<p className="text-[10px] text-slate-400">...</p>
```

#### 根本原因

1. **缺少明确的字体大小规范文档**
2. **Tailwind 提供太多选项**（text-xs, text-sm, text-base等），开发者自由选择
3. **任意值语法**（`text-[10px]`, `text-[11px]`）降低了一致性
4. **CSS类与Tailwind混用**（`.btn` 定义 13px，但外层可能被 Tailwind 覆盖）

---

### 2.2 卡片样式规范问题 🔴

#### 问题现象

| 卡片类型 | 定义方式 | 圆角 | 阴影 | 边框 | 使用位置 |
|---------|---------|------|------|------|---------|
| `.card` | CSS类 | 10px | 多层精致阴影 | 1px solid var(--border) | index.css定义，使用较少 |
| `.stat-card` | CSS类 | 10px | 多层阴影 | 1px solid var(--border) | index.css定义 |
| `.enterprise-card` | CSS类 | 10px | 多层阴影 | 1px border-slate-200 | 混合CSS+Tailwind |
| 内联卡片 | Tailwind | `rounded-[10px]` | 内联style | `border-slate-200` | visit/page.tsx的Card组件 |
| 白底容器 | Tailwind | `rounded-lg`(12px) | 无/简单阴影 | `border-slate-200` | 多处列表/表单容器 |
| 统计卡片 | Tailwind | `rounded-[10px]` | 无 | `border-transparent` | page.tsx彩色统计卡 |

#### 代码示例（不规范案例）

**visit/page.tsx** - 局部定义Card组件：
```tsx
function Card({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-[10px] p-3 hover:border-slate-300 transition-all cursor-pointer"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}
      onClick={onClick}>
      {children}
    </div>
  );
}
```
❌ **问题**：
- 未使用 `.card` 类
- 内联 `style` 写阴影
- 在组件内部重复定义，无法复用

**page.tsx** - 统计卡片：
```tsx
<div className={cn("rounded-[10px] p-3.5 flex items-center gap-3 border border-transparent", s.bg)}>
```
❌ **问题**：
- 无阴影
- `border-transparent` 与其他卡片不一致

**enterprises/page.tsx** - 企业卡片：
```tsx
<div className="bg-white border border-slate-200 rounded-[10px] p-4 hover:border-slate-300 transition-all cursor-pointer group"
  style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}
  onClick={() => router.push(`/enterprises/${ent.id}`)}>
```
❌ **问题**：
- 再次重复内联阴影定义
- 与 visit/page.tsx 的Card完全相同，但未复用

**index.css** - 定义了卡片类但使用率低：
```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.02);
}

.stat-card { ... }  /* 几乎未使用 */
.enterprise-card { ... }  /* 使用较少 */
```

#### 圆角不一致问题

| 圆角值 | Tailwind类 | CSS值 | 使用场景 |
|-------|-----------|-------|---------|
| 6px | `rounded-sm` | `--` | 小元素（标签、输入框内边角） |
| 8px | `rounded-md`, `rounded` | `borderRadius.DEFAULT` | 按钮、输入框 |
| 10px | `rounded-[10px]` | `--card-radius` | 卡片（主要） |
| 12px | `rounded-lg` | `borderRadius.lg` | 部分容器 |

❌ **问题**：
- 卡片圆角应该统一用 `--card-radius: 10px`，但实际上：
  - 有的写 `rounded-[10px]`
  - 有的写 `rounded-lg` (12px)
  - 有的写 `rounded` (8px)

#### 根本原因

1. **定义了CSS类但未强制使用**
2. **组件内部重复定义样式**
3. **Tailwind 的灵活性导致开发者直接写类而不用预定义**
4. **缺少卡片组件库**（所有卡片都是临时拼装）

---

### 2.3 按钮样式规范问题 🟡

#### 问题现象

虽然 `index.css` 定义了完整的 `.btn` 系列：

```css
.btn { padding: 8px 16px; font-size: 13px; ... }
.btn-primary { background: var(--brand); ... }
.btn-default { ... }
.btn-ghost { ... }
.btn-text { ... }
.btn-sm { padding: 5px 12px; font-size: 12px; }
.btn-lg { padding: 10px 24px; font-size: 14px; }
```

✅ **实际使用情况**：
- 大部分页面使用了 `.btn .btn-primary .btn-sm` 组合 ✓
- 基本遵循了规范

🟡 **小问题**：
1. **特殊按钮样式不一致**
   ```tsx
   // visit/page.tsx - AI生成按钮
   <button className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium text-[#3370FF] bg-blue-50 hover:bg-blue-100 rounded border border-blue-100">
   ```
   未使用 `.btn` 基础类，完全自定义

2. **文字按钮无统一样式**
   ```tsx
   <button className="text-[10px] text-[#3370FF] font-medium hover:underline">查看准备 →</button>
   ```
   应该用 `.btn-text` 但实际自定义

3. **图标按钮缺少规范**
   - 有的用 `.btn.btn-ghost`
   - 有的直接写 `<button className="p-2 hover:bg-slate-100">`

#### 根本原因

- 按钮基础类（`.btn`, `.btn-primary`）已规范，但 **特殊场景按钮** 缺少预定义类
- 缺少 **文字按钮**、**图标按钮** 的专用类

---

### 2.4 文字颜色与排版问题 🟡

#### 问题现象

**颜色使用混乱**：

| 场景 | CSS变量定义 | 实际使用 | 问题 |
|------|-----------|---------|------|
| 主文字 | `var(--text-primary)` #1A1D26 | `text-slate-900` #0F172A | **颜色不一致** |
| 次级文字 | `var(--text-secondary)` #5E6278 | `text-slate-600` #475569 | **颜色不一致** |
| 弱化文字 | `var(--text-muted)` #9097A7 | `text-slate-400` #94A3B8 | **颜色接近但不同** |
| 品牌色 | `var(--brand)` #3370FF | `text-[#3370FF]` | 方式不同但值相同 ✓ |

**代码示例**：

```tsx
// 定义了 CSS 变量，但实际使用 Tailwind
<div className="text-slate-900">标题</div>  // ❌ 应该用 var(--text-primary)
<div className="text-slate-600">描述</div>  // ❌ 应该用 var(--text-secondary)
<div className="text-slate-400">提示</div>  // ❌ 应该用 var(--text-muted)

// 品牌色使用不统一
<span className="text-[#3370FF]">...</span>  // ❌ 硬编码
<span style={{ color: '#3370FF' }}>...</span>  // ❌ 内联样式
<span className="text-blue-500">...</span>  // ❌❌ 完全错误（#3B82F6 ≠ #3370FF）
```

#### 字重使用混乱

| 字重 | 使用场景 | 实际情况 |
|------|---------|---------|
| 400 (normal) | 正文 | ✓ 基本统一 |
| 500 (medium) | 次级强调 | ✓ 基本统一 |
| 600 (semibold) | 标题 | ⚠️ 有时用 `font-bold`(700) |
| 700 (bold) | 强调、数值 | ✓ 统一用于KPI |

**问题**：
- 标题有时用 `font-semibold`(600)，有时用 `font-bold`(700)
- 缺少字重使用规范文档

#### 行高混乱

```tsx
<p className="leading-snug">...</p>     // 1.375
<p className="leading-relaxed">...</p>  // 1.625
<p className="text-sm">...</p>          // line-height: 1.5 (body默认)
```

❌ **没有统一的行高规范**

---

### 2.5 标签(Tag)样式问题 🟡

#### 已定义的标签类

```css
.tag { padding: 2px 8px; font-size: 11px; border-radius: 5px; }
.tag-blue, .tag-green, .tag-orange, .tag-red, .tag-purple, .tag-gray
```

#### 实际使用情况

❌ **大量不使用 `.tag` 类的情况**：

```tsx
// visit/page.tsx
<span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{ent.industry}</span>

// enterprises/page.tsx
<span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border-emerald-100 rounded border">政策 A级</span>

// page.tsx
<span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-600">紧急</span>
```

⚠️ **问题**：
1. 字号不一致：`.tag` 定义 11px，实际使用 `text-[10px]`
2. 内边距不一致：`.tag` 定义 `2px 8px`，实际使用 `px-1.5 py-0.5`（6px 2px）
3. 圆角不一致：`.tag` 定义 5px，实际使用 `rounded`（8px）
4. 有的带 `border`，有的不带

---

### 2.6 间距系统问题 🟡

#### 已定义的间距变量

```css
--page-px: 1rem;       /* 16px */
--page-py: 1rem;       /* 16px */
--content-gap: 1rem;   /* 16px = space-y-4 */
--detail-gap: 1.5rem;  /* 24px = space-y-6 */
```

#### 实际使用情况

✅ **PageContainer 组件统一使用了 `.page-container` 类**

❌ **问题**：
1. **内容间距不统一**：
   - 有的用 `space-y-4` (16px)
   - 有的用 `space-y-6` (24px)
   - 有的用 `space-y-3` (12px)
   - 缺少明确的使用场景说明

2. **卡片内边距不统一**：
   ```tsx
   <div className="p-3">...</div>   // 12px (visit/page.tsx)
   <div className="p-4">...</div>   // 16px (enterprises/page.tsx)
   <div className="p-3.5">...</div> // 14px (page.tsx)
   ```

3. **元素间距随意**：
   ```tsx
   <div className="gap-1">...</div>
   <div className="gap-1.5">...</div>
   <div className="gap-2">...</div>
   <div className="gap-3">...</div>
   ```
   缺少间距使用规范

---

## 3. Design Token 体系设计

### 3.1 Typography Tokens（字体排版）

#### 字号层级（Font Size Scale）

```css
/* ═══ Typography Tokens ═══ */

/* 基础字号 */
--text-xs: 12px;      /* 小字：辅助信息、时间戳 */
--text-sm: 13px;      /* 正文：卡片内容、描述 */
--text-base: 14px;    /* 标准：表单、按钮 */
--text-lg: 16px;      /* 大号：页面标题、卡片标题 */
--text-xl: 18px;      /* 统计：小型KPI */
--text-2xl: 24px;     /* 统计：大型KPI */

/* 标签/标注专用 */
--text-tag: 11px;     /* 标签、徽章 */
```

#### 映射到 Tailwind 配置

```js
// tailwind.config.js
theme: {
  fontSize: {
    xs: ['12px', '1.5'],      // [font-size, line-height]
    sm: ['13px', '1.5'],
    base: ['14px', '1.5'],
    lg: ['16px', '1.5'],
    xl: ['18px', '1.4'],
    '2xl': ['24px', '1.3'],
    tag: ['11px', '1.4'],     // 新增：标签专用
  }
}
```

#### 使用规范

| 类名 | 字号 | 使用场景 | 示例 |
|------|------|---------|------|
| `text-xs` | 12px | 时间戳、来源标签、次要提示 | "2分钟前", "来源：AI" |
| `text-sm` | 13px | 卡片正文、表单标签、按钮文字 | 企业描述、输入框文字 |
| `text-base` | 14px | 标准正文、表格内容 | 页面主体内容 |
| `text-lg` | 16px | 页面标题、卡片主标题 | "走访任务看板" |
| `text-xl` | 18px | 小型统计值 | "12 家企业" |
| `text-2xl` | 24px | 大型KPI | "326 家" |
| `text-tag` | 11px | 标签、徽章 | "待处理", "A级" |

🚫 **禁用**：
- ~~`text-[10px]`~~ → 改用 `text-tag`
- ~~`text-[11px]`~~ → 改用 `text-tag`
- ~~`text-[13px]`~~ → 改用 `text-sm`

---

### 3.2 Color Tokens（颜色系统）

#### 扩展 Tailwind 颜色配置

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      // ── 文字颜色 ──
      text: {
        primary: '#1A1D26',    // 主文字
        secondary: '#5E6278',  // 次级文字
        muted: '#9097A7',      // 弱化文字
      },
      // ── 品牌色 ──
      brand: {
        DEFAULT: '#3370FF',
        hover: '#2860E1',
        active: '#1D4ED8',
        light: '#EBF2FF',
        subtle: 'rgba(51, 112, 255, 0.06)',
        muted: 'rgba(51, 112, 255, 0.08)',
      },
      // ── 语义色（保持现有） ──
      data: {
        blue: '#3B82F6',
        green: '#10B981',
        orange: '#F59E0B',
        red: '#EF4444',
        purple: '#8B5CF6',
        cyan: '#06B6D4',
      },
    }
  }
}
```

#### 使用规范

| 旧写法 ❌ | 新写法 ✅ | 说明 |
|---------|---------|------|
| `text-slate-900` | `text-text-primary` | 主文字 |
| `text-slate-600` | `text-text-secondary` | 次级文字 |
| `text-slate-400` | `text-text-muted` | 弱化文字 |
| `text-[#3370FF]` | `text-brand` | 品牌色 |
| `bg-blue-50` (品牌相关) | `bg-brand-subtle` | 品牌色背景 |

---

### 3.3 Spacing Tokens（间距系统）

#### 标准间距值

```css
/* ═══ Spacing Tokens ═══ */

/* 内容间距 */
--space-xs: 8px;    /* 紧凑间距：同组元素 */
--space-sm: 12px;   /* 小间距：相关元素 */
--space-md: 16px;   /* 标准间距：卡片/区块间 */
--space-lg: 24px;   /* 大间距：页面区块间 */
--space-xl: 32px;   /* 超大间距：页面区域分隔 */

/* 卡片内边距 */
--card-padding-sm: 12px;   /* 小卡片 */
--card-padding: 16px;      /* 标准卡片 */
--card-padding-lg: 20px;   /* 大卡片 */
```

#### 使用规范

| 场景 | Tailwind类 | Token | 说明 |
|------|-----------|-------|------|
| 卡片内边距 | `p-3` (12px) | `--card-padding-sm` | 看板卡片、小卡片 |
| 卡片内边距 | `p-4` (16px) | `--card-padding` | 标准卡片 |
| 元素间距 | `gap-2` (8px) | `--space-xs` | 图标+文字 |
| 元素间距 | `gap-3` (12px) | `--space-sm` | 按钮组、标签组 |
| 内容垂直间距 | `space-y-4` (16px) | `--space-md` | 页面内容块 |
| 内容垂直间距 | `space-y-6` (24px) | `--space-lg` | 二级页面区块 |

🎯 **统一规则**：
- **看板小卡片**：`p-3` (12px)
- **列表/详情卡片**：`p-4` (16px)
- **页面级容器**：`p-6` (24px)

---

### 3.4 Border Radius Tokens（圆角系统）

#### 标准圆角值

```css
/* ═══ Border Radius Tokens ═══ */

--radius-xs: 4px;    /* 超小圆角：内嵌元素 */
--radius-sm: 6px;    /* 小圆角：标签、徽章 */
--radius: 8px;       /* 标准：按钮、输入框 */
--radius-lg: 10px;   /* 大圆角：卡片 */
--radius-xl: 12px;   /* 超大圆角：大型容器 */
--radius-full: 9999px; /* 圆形：头像、图标 */
```

#### Tailwind 映射

```js
// tailwind.config.js
borderRadius: {
  xs: '4px',
  sm: '6px',
  DEFAULT: '8px',
  lg: '10px',    // ← 卡片专用
  xl: '12px',
  full: '9999px',
}
```

#### 使用规范

| 元素类型 | 圆角类 | 值 | 说明 |
|---------|-------|-----|------|
| 标签、徽章 | `rounded-sm` | 6px | 小元素 |
| 按钮、输入框 | `rounded` | 8px | 标准交互元素 |
| 卡片 | `rounded-lg` | 10px | 主要卡片样式 |
| 大型容器 | `rounded-xl` | 12px | 弹窗、侧边栏 |

🚫 **禁用**：
- ~~`rounded-[10px]`~~ → 改用 `rounded-lg`
- ~~`rounded-md`~~ → 改用 `rounded`（8px）

---

### 3.5 Shadow Tokens（阴影系统）

#### 标准阴影值

```css
/* ═══ Shadow Tokens ═══ */

--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);  /* 极轻阴影：hover状态 */
--shadow-sm: 
  0 1px 2px rgba(0, 0, 0, 0.03),
  0 2px 4px rgba(0, 0, 0, 0.02);              /* 卡片默认 */
--shadow-md: 
  0 1px 2px rgba(0, 0, 0, 0.03),
  0 4px 8px rgba(0, 0, 0, 0.04);              /* 卡片hover */
--shadow-lg: 
  0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -2px rgba(0, 0, 0, 0.1);          /* 弹窗、下拉 */
```

#### Tailwind 配置

```js
// tailwind.config.js
boxShadow: {
  'card': '0 1px 2px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.02)',
  'card-hover': '0 1px 2px rgba(0, 0, 0, 0.03), 0 4px 8px rgba(0, 0, 0, 0.04)',
}
```

---

## 4. 组件规范方案

### 4.1 卡片组件体系

#### 方案：创建标准化 Card 组件库

```tsx
// src/components/ui/Card.tsx

import { cn } from '@/lib/utils';
import { ReactNode, HTMLAttributes } from 'react';

// ── 基础卡片 ──
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;  // 是否显示hover效果
  clickable?: boolean;  // 是否可点击
}

export function Card({ children, hover = false, clickable = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        // 基础样式（统一！）
        'bg-white border border-slate-200 rounded-lg shadow-card',
        // 可选样式
        hover && 'hover:border-slate-300 hover:shadow-card-hover transition-all',
        clickable && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── 紧凑卡片（看板用）──
export function CardCompact({ children, className, ...props }: CardProps) {
  return (
    <Card className={cn('p-3', className)} hover clickable {...props}>
      {children}
    </Card>
  );
}

// ── 标准卡片 ──
export function CardStandard({ children, className, ...props }: CardProps) {
  return (
    <Card className={cn('p-4', className)} {...props}>
      {children}
    </Card>
  );
}

// ── 带强调色边条的卡片 ──
interface CardAccentProps extends CardProps {
  accentColor?: string;
}

export function CardAccent({ children, accentColor = '#3370FF', className, ...props }: CardAccentProps) {
  return (
    <Card 
      className={cn('border-l-[3px]', className)} 
      style={{ borderLeftColor: accentColor }}
      {...props}
    >
      {children}
    </Card>
  );
}

// ── 统计卡片 ──
interface CardStatProps extends CardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  color?: string;
  bgColor?: string;
}

export function CardStat({ icon, value, label, color, bgColor, className, ...props }: CardStatProps) {
  return (
    <div
      className={cn('rounded-lg p-3.5 flex items-center gap-3 border border-transparent', bgColor, className)}
      {...props}
    >
      <div className="p-2 rounded-lg shrink-0 bg-white/60">
        {icon}
      </div>
      <div>
        <div className={cn('text-2xl font-bold font-mono', color)}>{value}</div>
        <div className="text-xs text-slate-600">{label}</div>
      </div>
    </div>
  );
}
```

#### 使用示例

```tsx
// ❌ 旧代码（visit/page.tsx）
<div className="bg-white border border-slate-200 rounded-[10px] p-3"
  style={{ boxShadow: '...' }}
  onClick={onClick}>
  {children}
</div>

// ✅ 新代码
<CardCompact onClick={onClick}>
  {children}
</CardCompact>
```

---

### 4.2 标签（Tag）组件

```tsx
// src/components/ui/Tag.tsx

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type TagVariant = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray' | 'emerald' | 'amber' | 'violet';

interface TagProps {
  children: ReactNode;
  variant?: TagVariant;
  className?: string;
  withBorder?: boolean;
}

const variantStyles: Record<TagVariant, string> = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  violet: 'bg-violet-50 text-violet-600 border-violet-100',
  gray: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function Tag({ children, variant = 'gray', withBorder = false, className }: TagProps) {
  return (
    <span
      className={cn(
        // 统一基础样式
        'inline-flex items-center px-2 py-0.5 text-tag font-medium rounded-sm',
        // 颜色变体
        variantStyles[variant],
        // 可选边框
        withBorder && 'border',
        className
      )}
    >
      {children}
    </span>
  );
}

// 预设的语义标签
export function TagPolicyGrade({ grade }: { grade: string }) {
  const variant = grade === 'A' ? 'emerald' : grade === 'B' ? 'blue' : grade === 'C' ? 'amber' : 'gray';
  return <Tag variant={variant} withBorder>政策 {grade}级</Tag>;
}

export function TagStatus({ status }: { status: 'pending' | 'done' | 'warning' }) {
  const config = {
    pending: { variant: 'orange' as TagVariant, label: '待处理' },
    done: { variant: 'green' as TagVariant, label: '已完成' },
    warning: { variant: 'red' as TagVariant, label: '预警' },
  };
  const { variant, label } = config[status];
  return <Tag variant={variant} withBorder>{label}</Tag>;
}
```

#### 使用示例

```tsx
// ❌ 旧代码
<span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
  {ent.industry}
</span>

// ✅ 新代码
<Tag variant="blue">{ent.industry}</Tag>
<TagPolicyGrade grade="A" />
<TagStatus status="pending" />
```

---

### 4.3 按钮组件增强

#### 新增按钮变体

```css
/* src/index.css - 新增按钮类型 */

/* 图标按钮 */
.btn-icon {
  padding: 6px;
  border-radius: 6px;
}

/* 链接按钮（文字按钮加强版）*/
.btn-link {
  background: transparent;
  color: var(--brand);
  padding: 0;
  border: none;
  font-size: 13px;
  font-weight: 500;
}
.btn-link:hover {
  text-decoration: underline;
}

/* 特殊：AI 功能按钮 */
.btn-ai {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 500;
  color: var(--brand);
  background: rgba(51, 112, 255, 0.06);
  border: 1px solid rgba(51, 112, 255, 0.12);
  border-radius: 6px;
  transition: all 0.15s;
}
.btn-ai:hover {
  background: rgba(51, 112, 255, 0.1);
  border-color: rgba(51, 112, 255, 0.2);
}
```

#### 使用规范

| 场景 | 类名组合 | 示例 |
|------|---------|------|
| 主要操作 | `.btn .btn-primary .btn-sm` | 新增走访 |
| 次要操作 | `.btn .btn-default .btn-sm` | 取消、返回 |
| 辅助操作 | `.btn .btn-ghost .btn-sm` | 更多选项 |
| 文字链接 | `.btn-link` | "查看详情 →" |
| 图标按钮 | `.btn-icon .btn-ghost` | 设置、关闭 |
| AI功能 | `.btn-ai` | "AI 生成报告" |

---

### 4.4 Typography 组件（新增）

```tsx
// src/components/ui/Typography.tsx

import { cn } from '@/lib/utils';
import { HTMLAttributes, ReactNode } from 'react';

// ── 页面标题 ──
export function PageTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className={cn('text-lg font-bold text-text-primary', className)} {...props}>
      {children}
    </h1>
  );
}

// ── 页面描述 ──
export function PageDescription({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-text-muted mt-0.5', className)} {...props}>
      {children}
    </p>
  );
}

// ── 卡片标题 ──
export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-sm font-semibold text-text-primary', className)} {...props}>
      {children}
    </div>
  );
}

// ── 卡片描述 ──
export function CardDescription({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-xs text-text-secondary leading-relaxed', className)} {...props}>
      {children}
    </div>
  );
}

// ── 辅助文字 ──
export function TextMuted({ children, className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('text-xs text-text-muted', className)} {...props}>
      {children}
    </span>
  );
}

// ── 统计数值 ──
interface StatValueProps extends HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatValue({ value, label, size = 'md', className, ...props }: StatValueProps) {
  const sizeClass = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  }[size];

  return (
    <div className={cn('', className)} {...props}>
      <div className={cn(sizeClass, 'font-bold font-mono text-text-primary')}>{value}</div>
      {label && <div className="text-xs text-text-secondary mt-0.5">{label}</div>}
    </div>
  );
}
```

---

## 5. 实施路线图

### 阶段 1：基础设施（1-2天）

#### 1.1 更新 Design Tokens

**任务**：
- [ ] 更新 `tailwind.config.js`
  - 添加 `text-tag: 11px`
  - 更新 `colors` 添加 `text.*` 颜色
  - 统一 `borderRadius`（确保 `lg: 10px`）
  - 添加 `shadow-card` 和 `shadow-card-hover`
  
- [ ] 更新 `src/index.css`
  - 添加 Typography Tokens
  - 添加 Spacing Tokens
  - 添加 Shadow Tokens
  - 新增 `.btn-ai`, `.btn-link`, `.btn-icon` 类

**验证**：使用 Tailwind IntelliSense 确认新类可用

---

#### 1.2 创建基础组件

**任务**：
- [ ] 创建 `src/components/ui/Card.tsx`
  - `Card`, `CardCompact`, `CardStandard`, `CardAccent`, `CardStat`
  
- [ ] 创建 `src/components/ui/Tag.tsx`
  - `Tag`, `TagPolicyGrade`, `TagStatus`
  
- [ ] 创建 `src/components/ui/Typography.tsx`
  - `PageTitle`, `PageDescription`, `CardTitle`, `CardDescription`, `StatValue`

- [ ] 更新 `src/components/ui/index.ts`
  ```ts
  export * from './Card';
  export * from './Tag';
  export * from './Typography';
  export * from './Skeleton';
  ```

**验证**：在 Storybook 或测试页面中预览所有组件

---

### 阶段 2：页面重构（3-5天）

#### 优先级排序

| 页面 | 优先级 | 问题严重度 | 改造工作量 | 预计时间 |
|------|-------|-----------|-----------|---------|
| **visit/page.tsx** | P0 | 🔴 高 | 中 | 2h |
| **page.tsx (首页)** | P0 | 🔴 高 | 中 | 2h |
| **enterprises/page.tsx** | P1 | 🟡 中 | 中 | 2h |
| **其他页面** | P2 | 🟡 中 | 低-中 | 3-4h |

#### 2.1 重构 visit/page.tsx

**改造清单**：
```tsx
// ❌ 删除局部 Card 组件定义
function Card({ ... }) { ... }  // 删除！

// ✅ 使用新组件
import { CardCompact, Tag, PageTitle, PageDescription } from '@/components/ui';

// 替换所有卡片
<CardCompact onClick={() => router.push(`/visit/${ent.id}`)}>
  <CardTitle>{ent.short_name ?? ent.name}</CardTitle>
  <div className="flex flex-wrap gap-1 mb-2">
    <Tag variant="blue">{ent.industry}</Tag>
    <Tag variant="gray">{ent.development_stage}</Tag>
  </div>
  ...
</CardCompact>

// 替换标题
<PageTitle>走访任务看板</PageTitle>
<PageDescription>走访全流程：准备 → 走访 → 确认 → 跟进 · {total} 项任务</PageDescription>
```

**验证**：
- [ ] 视觉无变化（或更统一）
- [ ] 交互正常
- [ ] 无控制台警告

---

#### 2.2 重构 page.tsx (首页)

**改造清单**：
```tsx
import { CardStat, CardStandard, Tag, PageTitle, TextMuted } from '@/components/ui';

// 统计卡片
{statCards.map((s, i) => (
  <CardStat
    key={i}
    icon={<s.icon className="h-4 w-4" />}
    value={s.value}
    label={s.label}
    color={s.color}
    bgColor={s.bg}
  />
))}

// 场景入口卡片
<CardStandard onClick={() => router.push(s.href)}>
  ...
</CardStandard>
```

---

#### 2.3 重构其他页面

**批量替换策略**：
1. 全局搜索 `text-[10px]` → 替换为 `text-tag`
2. 全局搜索 `text-[11px]` → 替换为 `text-tag`
3. 全局搜索 `rounded-[10px]` → 替换为 `rounded-lg`
4. 全局搜索内联 `boxShadow` → 替换为 `shadow-card`
5. 全局搜索 `text-slate-900` → 酌情替换为 `text-text-primary`

---

### 阶段 3：文档与规范（1天）

#### 3.1 创建开发者文档

**文件**：`docs/UI开发规范.md`

**内容大纲**：
```markdown
# UI 开发规范

## 1. Typography（字体排版）
- 字号使用规范
- 字重使用规范
- 颜色使用规范

## 2. Components（组件）
### Card 组件
- CardCompact：看板卡片
- CardStandard：列表卡片
- CardAccent：强调卡片

### Tag 组件
- 使用场景
- 颜色变体

### Button 组件
- 主要/次要/辅助按钮
- AI 功能按钮

## 3. Spacing（间距）
- 卡片内边距规范
- 元素间距规范

## 4. 禁用清单
- ❌ text-[10px] → ✅ text-tag
- ❌ rounded-[10px] → ✅ rounded-lg
- ...
```

---

#### 3.2 配置 ESLint 规则（可选）

```js
// .eslintrc.js
rules: {
  'no-restricted-syntax': [
    'error',
    {
      selector: 'JSXAttribute[name.name="className"][value.value=/text-\\[\\d+px\\]/]',
      message: '禁止使用任意值字号（如 text-[10px]），请使用预定义字号类（text-tag, text-xs 等）',
    },
    {
      selector: 'JSXAttribute[name.name="className"][value.value=/rounded-\\[\\d+px\\]/]',
      message: '禁止使用任意值圆角，请使用预定义圆角类（rounded-lg 等）',
    },
  ],
}
```

---

### 阶段 4：验证与优化（1天）

#### 4.1 视觉回归测试

**工具**：
- Chromatic (Storybook)
- Percy (视觉对比)
- 或手动截图对比

**测试页面**：
- 首页
- 走访工作台
- 企业画像库
- 政策服务页面

---

#### 4.2 性能检查

- [ ] 检查 CSS 包体积（是否引入未使用的 Tailwind 类）
- [ ] 检查组件渲染性能（React DevTools Profiler）

---

#### 4.3 无障碍检查

- [ ] 颜色对比度（WCAG AA 标准）
- [ ] 键盘导航
- [ ] 屏幕阅读器友好性

---

## 6. 优先级与影响评估

### 6.1 问题严重性矩阵

| 问题类型 | 严重度 | 影响范围 | 修复成本 | 优先级 |
|---------|-------|---------|---------|--------|
| 字体大小混乱 | 🔴 高 | 全局 | 低 | **P0** |
| 卡片样式不统一 | 🔴 高 | 多页面 | 中 | **P0** |
| 标签样式混乱 | 🟡 中 | 多页面 | 低 | **P1** |
| 颜色使用不规范 | 🟡 中 | 全局 | 低 | **P1** |
| 按钮样式不统一 | 🟢 低 | 局部 | 低 | **P2** |
| 间距系统混乱 | 🟡 中 | 全局 | 中 | **P1** |

---

### 6.2 投入产出比分析

#### 高 ROI 改造项（优先实施）

1. **字体大小统一**
   - 投入：1-2小时（全局替换）
   - 产出：
     - ✅ 视觉一致性大幅提升
     - ✅ 未来开发效率提升（不再纠结用哪个字号）
     - ✅ 代码可维护性提升
   - **ROI：⭐⭐⭐⭐⭐**

2. **创建 Card 组件库**
   - 投入：2-3小时（创建组件 + 重构2-3个页面）
   - 产出：
     - ✅ 消除重复代码
     - ✅ 样式完全统一
     - ✅ 未来新页面开发速度加快
   - **ROI：⭐⭐⭐⭐⭐**

3. **创建 Tag 组件**
   - 投入：1小时
   - 产出：
     - ✅ 标签样式统一
     - ✅ 代码简洁（一行替代5-6个类）
   - **ROI：⭐⭐⭐⭐**

#### 中 ROI 改造项（第二批）

4. **颜色系统规范化**
   - 投入：2-3小时
   - 产出：
     - ✅ 主题切换能力（未来）
     - ✅ 设计规范严格执行
   - **ROI：⭐⭐⭐**

5. **Typography 组件**
   - 投入：2小时
   - 产出：
     - ✅ 排版统一
     - ✅ 代码语义化
   - **ROI：⭐⭐⭐**

---

### 6.3 风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 重构导致视觉回退 | 中 | 高 | 截图对比、视觉回归测试 |
| 组件抽象不合理 | 低 | 中 | 先小范围试点，验证后推广 |
| 开发周期延长 | 低 | 低 | 分阶段实施，不阻塞业务迭代 |
| 团队接受度低 | 中 | 中 | 提供清晰文档和示例，Code Review 强制规范 |

---

## 7. 成功标准

### 7.1 量化指标

- [ ] **字号种类**：从 8+ 种减少到 **6 种以内**
- [ ] **卡片样式定义方式**：从 5+ 种统一到 **组件化方式**
- [ ] **任意值使用**：`text-[Npx]`, `rounded-[Npx]` 使用次数 → **0**
- [ ] **组件复用率**：新页面开发中组件使用率 > **80%**

### 7.2 质量标准

- [ ] 所有页面通过视觉回归测试
- [ ] 无 Console 警告或错误
- [ ] Lighthouse Performance 评分 > 90
- [ ] 开发者文档完整且易懂

### 7.3 团队标准

- [ ] 新成员能在 30 分钟内理解 UI 规范
- [ ] Code Review 中能快速识别不规范代码
- [ ] 新功能开发时 UI 代码审查时间减少 50%

---

## 8. 附录

### 8.1 快速参考卡

#### 字号速查

```tsx
text-tag   // 11px - 标签、徽章
text-xs    // 12px - 时间戳、提示
text-sm    // 13px - 正文、按钮
text-base  // 14px - 标准正文
text-lg    // 16px - 标题
text-xl    // 18px - 小型KPI
text-2xl   // 24px - 大型KPI
```

#### 卡片速查

```tsx
<CardCompact>     // p-3 - 看板小卡片
<CardStandard>    // p-4 - 列表卡片
<CardAccent>      // 带色边 - 强调卡片
<CardStat>        // 统计卡片
```

#### 颜色速查

```tsx
text-text-primary    // #1A1D26 - 主文字
text-text-secondary  // #5E6278 - 次级文字
text-text-muted      // #9097A7 - 弱化文字
text-brand           // #3370FF - 品牌色
```

---

### 8.2 重构检查清单

在提交代码前，检查以下项：

**字体排版**
- [ ] 无 `text-[10px]`, `text-[11px]` 等任意值
- [ ] 文字颜色使用 `text-text-*` 或 `text-brand`
- [ ] 统计数值使用 `font-mono`

**卡片样式**
- [ ] 使用 `<Card*>` 组件而非手写样式
- [ ] 圆角统一使用 `rounded-lg` (卡片) 或 `rounded` (按钮)
- [ ] 无内联 `style={{ boxShadow: ... }}`

**标签样式**
- [ ] 使用 `<Tag>` 组件而非 Tailwind 组合
- [ ] 标签字号为 `text-tag`

**按钮样式**
- [ ] 使用 `.btn` 系列类
- [ ] AI 功能按钮使用 `.btn-ai`

**间距**
- [ ] 卡片内边距：看板 `p-3`，列表 `p-4`
- [ ] 页面内容间距：`space-y-4` 或 `space-y-6`

---

## 9. 下一步行动

### 立即可做（今天）

1. **创建 Design Token 文档**
   - 复制本文档第 3 节到项目 `docs/` 目录
   - 在团队会议中讨论并确认

2. **更新 Tailwind 配置**
   - 添加 `text-tag`, `text.*` 颜色, `shadow-card`
   - 验证配置生效

3. **创建第一个标准组件**
   - 优先创建 `Card.tsx`
   - 在一个小页面试点使用

### 本周完成

- [ ] 完成阶段 1（基础设施）
- [ ] 重构 1-2 个核心页面（visit, 首页）
- [ ] 编写开发者文档初稿

### 本月完成

- [ ] 完成所有页面重构
- [ ] 文档完善并培训团队
- [ ] 配置 ESLint 规则（可选）
- [ ] 视觉回归测试通过

---

## 📝 变更日志

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|---------|------|
| 2026-02-11 | v1.0 | 初始版本 | AI Assistant |

---

**文档维护者**：开发团队  
**审核周期**：每季度  
**反馈渠道**：项目 Issue / 团队会议
