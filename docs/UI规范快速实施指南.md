# UI 规范快速实施指南

> **快速上手**：5分钟了解如何开始统一UI规范  
> **配套文档**：《UI规范统一深度分析.md》

---

## 🚀 快速开始（30分钟）

### Step 1: 更新 Tailwind 配置（5分钟）

打开 `tailwind.config.js`，更新以下配置：

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // ✅ 新增：字体大小
      fontSize: {
        'xs': ['12px', '1.5'],
        'sm': ['13px', '1.5'],
        'base': ['14px', '1.5'],
        'lg': ['16px', '1.5'],
        'xl': ['18px', '1.4'],
        '2xl': ['24px', '1.3'],
        'tag': ['11px', '1.4'],  // 🆕 标签专用
      },
      
      // ✅ 新增：文字颜色
      colors: {
        text: {
          primary: '#1A1D26',
          secondary: '#5E6278',
          muted: '#9097A7',
        },
        brand: {
          DEFAULT: '#3370FF',
          hover: '#2860E1',
          active: '#1D4ED8',
          light: '#EBF2FF',
          muted: 'rgba(51, 112, 255, 0.08)',
        },
        // ... 保留原有 surface, data 配置
      },
      
      // ✅ 确认：圆角配置
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'DEFAULT': '8px',
        'lg': '10px',    // ← 卡片圆角
        'xl': '12px',
        'full': '9999px',
      },
      
      // ✅ 新增：卡片阴影
      boxShadow: {
        'card': '0 1px 2px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 1px 2px rgba(0, 0, 0, 0.03), 0 4px 8px rgba(0, 0, 0, 0.04)',
        // ... 保留原有配置
      },
    },
  },
  plugins: [],
};
```

---

### Step 2: 更新 CSS 变量（5分钟）

打开 `src/index.css`，在按钮样式后添加新按钮类型：

```css
/* 在 .btn-lg 后添加 */

/* ═══ 新增按钮类型 ═══ */

/* 图标按钮 */
.btn-icon {
  padding: 6px;
  border-radius: 6px;
}

/* 链接按钮 */
.btn-link {
  background: transparent;
  color: var(--brand);
  padding: 0;
  border: none;
  font-size: 13px;
  font-weight: 500;
  transition: opacity 0.15s;
}
.btn-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* AI 功能按钮 */
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
  cursor: pointer;
}
.btn-ai:hover {
  background: rgba(51, 112, 255, 0.1);
  border-color: rgba(51, 112, 255, 0.2);
}
```

---

### Step 3: 创建基础组件（15分钟）

#### 3.1 创建 `src/components/ui/Card.tsx`

<details>
<summary>点击展开完整代码</summary>

```tsx
/**
 * Card 组件库 - 统一卡片样式
 */

import { cn } from '@/lib/utils';
import { ReactNode, HTMLAttributes } from 'react';

// ── 基础卡片 ──
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  clickable?: boolean;
}

export function Card({ 
  children, 
  hover = false, 
  clickable = false, 
  className, 
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-lg shadow-card',
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
    <Card className={cn('p-4', className)} hover {...props}>
      {children}
    </Card>
  );
}

// ── 带强调边的卡片 ──
interface CardAccentProps extends CardProps {
  accentColor?: string;
}

export function CardAccent({ 
  children, 
  accentColor = '#3370FF', 
  className, 
  ...props 
}: CardAccentProps) {
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
```
</details>

#### 3.2 创建 `src/components/ui/Tag.tsx`

<details>
<summary>点击展开完整代码</summary>

```tsx
/**
 * Tag 组件 - 统一标签样式
 */

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type TagVariant = 
  | 'blue' | 'green' | 'emerald' | 'orange' | 'amber' 
  | 'red' | 'purple' | 'violet' | 'gray' | 'slate';

interface TagProps {
  children: ReactNode;
  variant?: TagVariant;
  className?: string;
  withBorder?: boolean;
}

const variantStyles: Record<TagVariant, string> = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  violet: 'bg-violet-50 text-violet-600 border-violet-100',
  gray: 'bg-slate-50 text-slate-600 border-slate-200',
  slate: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function Tag({ 
  children, 
  variant = 'gray', 
  withBorder = false, 
  className 
}: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-tag font-medium rounded-sm',
        variantStyles[variant],
        withBorder && 'border',
        className
      )}
    >
      {children}
    </span>
  );
}

// ── 语义化标签：政策等级 ──
export function TagPolicyGrade({ grade }: { grade: string }) {
  const variant = 
    grade === 'A' ? 'emerald' : 
    grade === 'B' ? 'blue' : 
    grade === 'C' ? 'amber' : 
    'gray';
  return <Tag variant={variant} withBorder>政策 {grade}级</Tag>;
}

// ── 语义化标签：状态 ──
export function TagStatus({ 
  status 
}: { 
  status: 'pending' | 'done' | 'warning' | 'info' 
}) {
  const config = {
    pending: { variant: 'orange' as TagVariant, label: '待处理' },
    done: { variant: 'emerald' as TagVariant, label: '已完成' },
    warning: { variant: 'red' as TagVariant, label: '预警' },
    info: { variant: 'blue' as TagVariant, label: '进行中' },
  };
  const { variant, label } = config[status];
  return <Tag variant={variant} withBorder>{label}</Tag>;
}
```
</details>

#### 3.3 更新 `src/components/ui/index.ts`

```ts
export * from './Card';
export * from './Tag';
export * from './Skeleton';
```

---

### Step 4: 试点重构一个页面（5分钟）

选择一个小页面进行试点，比如重构 `visit/page.tsx` 中的 Card 组件：

#### 原代码（❌ 不规范）

```tsx
function Card({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <div 
      className="bg-white border border-slate-200 rounded-[10px] p-3 hover:border-slate-300 transition-all cursor-pointer"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// 使用
<Card onClick={() => router.push(`/visit/${ent.id}`)}>
  <div className="text-sm font-semibold text-slate-900">
    {ent.short_name ?? ent.name}
  </div>
  <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
    {ent.industry}
  </span>
</Card>
```

#### 新代码（✅ 规范）

```tsx
// 1. 删除局部 Card 组件定义
// 2. 导入标准组件
import { CardCompact, Tag } from '@/components/ui';

// 3. 使用标准组件
<CardCompact onClick={() => router.push(`/visit/${ent.id}`)}>
  <div className="text-sm font-semibold text-text-primary">
    {ent.short_name ?? ent.name}
  </div>
  <Tag variant="blue">{ent.industry}</Tag>
</CardCompact>
```

**改进点**：
- ✅ 删除 24 行重复代码
- ✅ 卡片样式完全统一
- ✅ 使用规范字号 `text-tag`
- ✅ 使用规范颜色 `text-text-primary`
- ✅ 代码更简洁清晰

---

## 📋 批量替换检查清单

### 全局搜索替换（使用 VS Code）

#### 1. 字号规范化

```bash
# 搜索：text-\[10px\]
# 替换：text-tag

# 搜索：text-\[11px\]
# 替换：text-tag

# 搜索：text-\[13px\]
# 替换：text-sm
```

⚠️ **注意**：手动检查每处替换，确保语义正确

#### 2. 圆角规范化

```bash
# 搜索：rounded-\[10px\]
# 替换：rounded-lg
```

#### 3. 颜色规范化（需谨慎）

```bash
# 搜索：text-slate-900
# 替换：text-text-primary
# ⚠️ 仅替换主文字，标题等特殊场景需保留

# 搜索：text-slate-600
# 替换：text-text-secondary

# 搜索：text-slate-400
# 替换：text-text-muted
```

#### 4. 删除内联阴影

```bash
# 搜索：style=\{\{ boxShadow: '0 1px 2px.*?' \}\}
# 替换：（删除，改用 shadow-card）
```

---

## 🎯 快速参考

### 常用组件速查

```tsx
// ── 卡片 ──
<CardCompact onClick={...}>        // 看板小卡片 (p-3)
<CardStandard>                     // 列表卡片 (p-4)
<CardAccent accentColor="#3370FF"> // 带色边强调卡片

// ── 标签 ──
<Tag variant="blue">标签</Tag>
<Tag variant="emerald" withBorder>带边框</Tag>
<TagPolicyGrade grade="A" />       // 政策 A级
<TagStatus status="pending" />     // 待处理

// ── 按钮（CSS类）──
<button className="btn btn-primary btn-sm">主要操作</button>
<button className="btn btn-default btn-sm">次要操作</button>
<button className="btn-ai">✨ AI 生成</button>
<button className="btn-link">查看详情 →</button>
```

### 字号使用场景

| 类名 | 大小 | 使用场景 |
|------|------|---------|
| `text-tag` | 11px | 标签、徽章 |
| `text-xs` | 12px | 时间戳、辅助信息 |
| `text-sm` | 13px | 正文、按钮 |
| `text-base` | 14px | 标准正文 |
| `text-lg` | 16px | 页面标题 |
| `text-xl` | 18px | 小KPI |
| `text-2xl` | 24px | 大KPI |

### 颜色使用场景

| 类名 | 使用场景 |
|------|---------|
| `text-text-primary` | 主标题、正文 |
| `text-text-secondary` | 描述文字、辅助信息 |
| `text-text-muted` | 弱化文字、占位符 |
| `text-brand` | 品牌色文字、链接 |

---

## ✅ 自检清单（提交前）

在提交代码前，检查以下项：

**字体排版**
- [ ] 无 `text-[10px]`, `text-[11px]` 等任意值
- [ ] 标签使用 `text-tag`
- [ ] 正文使用 `text-sm`
- [ ] 标题使用 `text-lg`

**卡片样式**
- [ ] 使用 `<CardCompact>` 或 `<CardStandard>` 组件
- [ ] 圆角统一使用 `rounded-lg`（卡片）或 `rounded`（按钮）
- [ ] 无内联 `style={{ boxShadow: ... }}`

**标签样式**
- [ ] 使用 `<Tag>` 组件
- [ ] 标签字号为 `text-tag`（通过组件自动应用）

**按钮样式**
- [ ] 使用 `.btn` 系列类
- [ ] AI 按钮使用 `.btn-ai`
- [ ] 文字链接使用 `.btn-link`

**颜色使用**
- [ ] 主文字使用 `text-text-primary`
- [ ] 次级文字使用 `text-text-secondary`
- [ ] 品牌色使用 `text-brand`

---

## 🔥 常见问题

### Q1: 我的页面已经有很多自定义样式，需要全部重构吗？

**A**: 不需要！采用**渐进式重构**策略：
1. 新功能：必须使用新规范
2. 旧代码：修改时顺手重构
3. 核心页面：优先重构（首页、走访等）

### Q2: Card 组件不够灵活怎么办？

**A**: 所有 Card 组件都支持 `className` prop：

```tsx
<CardCompact className="bg-blue-50 border-blue-200">
  {/* 自定义样式 */}
</CardCompact>
```

如果确实需要完全自定义，可以直接写，但：
- 必须使用 `rounded-lg`
- 必须使用 `shadow-card`
- 建议封装为新的 Card 变体

### Q3: 标签颜色不够用怎么办？

**A**: 
1. 检查是否可以复用现有颜色（如 `emerald` 可代替 `green`）
2. 如果确实需要新颜色，在 `Tag.tsx` 中添加新变体
3. 避免为单一场景创建颜色变体

### Q4: 如何处理第三方组件库（如 Recharts）的样式？

**A**: 第三方组件不强制统一，但：
- 字号尽量对齐（用 `fontSize: 13` 而非 `fontSize: 14`）
- 颜色使用 `#3370FF` 等项目标准色

---

## 📚 相关资源

- **深度分析文档**: `docs/UI规范统一深度分析.md`
- **Design Tokens**: `tailwind.config.js` + `src/index.css`
- **组件源码**: `src/components/ui/`
- **示例页面**: `src/app/(portal)/visit/page.tsx`（待重构）

---

## 🎉 下一步

1. ✅ 完成 Step 1-3（配置 + 组件创建）
2. 🔄 重构 1-2 个页面试点
3. 📢 团队分享会：演示新组件使用
4. 📖 完善开发者文档
5. 🚀 全面推广

**预计完成时间**：1 周

---

**有问题？**  
在团队会议中提出，或在项目 Issue 中讨论。

**Happy Coding! 🎨**
