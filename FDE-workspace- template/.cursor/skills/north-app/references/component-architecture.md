---
name: component-architecture
description: "组件架构设计 - 基于原子设计方法论的组件系统，涵盖组件分层、设计原则、状态设计、API规范等完整方法论。"
version: 1.0.0
category: design
---

# 组件架构设计

> 好的组件架构如同乐高积木 — 简单的元素通过组合创造无限可能

---

## 一、原子设计方法论

### 什么是原子设计

**原子设计（Atomic Design）** 由 Brad Frost 提出，将界面设计分解为五个层级：

```
┌─────────────────────────────────────────────────────────────────┐
│  L5: Pages（页面）                                              │
│  具体的页面实例，真实数据填充                                    │
├─────────────────────────────────────────────────────────────────┤
│  L4: Templates（模板）                                          │
│  页面骨架，定义内容布局结构                                      │
├─────────────────────────────────────────────────────────────────┤
│  L3: Organisms（有机体）                                        │
│  复杂UI模块，由分子和原子组成                                    │
├─────────────────────────────────────────────────────────────────┤
│  L2: Molecules（分子）                                          │
│  简单UI组合，由原子组成的功能单元                                │
├─────────────────────────────────────────────────────────────────┤
│  L1: Atoms（原子）                                              │
│  最小UI单元，不可再分的基础元素                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 实践中的四层简化

为了更好地落地，我们将原子设计简化为四层：

| 层级 | 名称 | 定义 | 示例 |
|-----|------|------|------|
| **L1** | 原子组件 | 最小可用UI单元 | Button, Input, Icon, Badge |
| **L2** | 分子组件 | 原子组合的功能单元 | SearchInput, FormField, MenuItem |
| **L3** | 有机组件 | 完整功能模块 | DataTable, FilterPanel, NavMenu |
| **L4** | 模板/布局 | 页面级结构组件 | DashboardLayout, AuthLayout |

---

## 二、组件分层详解

### L1：原子组件

**特征**：
- 最小化，不可再分
- 无业务逻辑
- 高度可定制
- 完全受控

**核心原子组件清单**：

```yaml
基础交互:
  - Button: 按钮（主要/次要/幽灵/危险）
  - Input: 输入框（文本/密码/数字）
  - Textarea: 多行输入
  - Select: 选择器
  - Checkbox: 复选框
  - Radio: 单选框
  - Switch: 开关
  - Slider: 滑块

信息展示:
  - Text: 文本
  - Heading: 标题
  - Label: 标签
  - Badge: 徽章
  - Tag: 标记
  - Avatar: 头像
  - Icon: 图标
  - Image: 图片

反馈:
  - Spinner: 加载指示器
  - Progress: 进度条
  - Skeleton: 骨架屏
```

**原子组件示例（Button）**：

```tsx
// components/atoms/Button/Button.tsx

import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Button 原子组件
 * 
 * 设计原则：
 * 1. 单一职责 - 只处理点击交互的视觉表现
 * 2. 完全受控 - 所有状态由外部传入
 * 3. 可组合 - 支持作为子组件的容器
 */
const buttonVariants = cva(
  // 基础样式
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-md',
    'transition-all duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      // 变体 - 不同视觉风格
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-transparent hover:bg-secondary',
        ghost: 'hover:bg-secondary',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      // 尺寸 - 不同大小
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
```

### L2：分子组件

**特征**：
- 由原子组合而成
- 实现单一功能
- 可包含简单逻辑
- 高复用性

**核心分子组件清单**：

```yaml
表单相关:
  - FormField: Label + Input + ErrorMessage
  - SearchInput: Input + Icon + ClearButton
  - PasswordInput: Input + ToggleVisibility
  - SelectField: Label + Select + Description

列表相关:
  - ListItem: Avatar + Text + Action
  - MenuItem: Icon + Text + Badge
  - NavItem: Icon + Text + Indicator

卡片相关:
  - StatCard: Icon + Value + Label + Trend
  - ActionCard: Title + Description + Button
  - MediaCard: Image + Title + Description
```

**分子组件示例（FormField）**：

```tsx
// components/molecules/FormField/FormField.tsx

import { Label } from '@/components/atoms/Label'
import { Input } from '@/components/atoms/Input'
import { cn } from '@/lib/utils'

/**
 * FormField 分子组件
 * 
 * 组合：Label + Input + ErrorMessage + Description
 * 职责：完整的表单字段，包含标签和错误提示
 */
interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  description?: string
  error?: string
  required?: boolean
  className?: string
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  description,
  error,
  required,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* 标签行 */}
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </div>
      
      {/* 输入框 */}
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
      />
      
      {/* 错误提示 */}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
```

### L3：有机组件

**特征**：
- 完整的功能模块
- 可包含业务逻辑
- 可管理内部状态
- 提供完整的用户体验

**核心有机组件清单**：

```yaml
数据展示:
  - DataTable: 完整的数据表格（排序/筛选/分页）
  - CardGrid: 卡片网格布局
  - Timeline: 时间线组件

导航:
  - NavigationMenu: 顶部导航菜单
  - Sidebar: 侧边栏导航
  - Breadcrumb: 面包屑导航
  - Pagination: 分页器

表单:
  - FilterPanel: 筛选面板
  - SearchPanel: 搜索面板
  - FormSection: 表单分组

交互:
  - Modal: 模态对话框
  - Drawer: 抽屉面板
  - CommandPalette: 命令面板
```

**有机组件示例（DataTable）**：

```tsx
// components/organisms/DataTable/DataTable.tsx

import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/atoms/Table'
import { Pagination } from '@/components/molecules/Pagination'
import { SortButton } from '@/components/molecules/SortButton'
import { Checkbox } from '@/components/atoms/Checkbox'

/**
 * DataTable 有机组件
 * 
 * 功能：完整的数据表格，支持排序、选择、分页
 * 组合：Table + Pagination + SortButton + Checkbox
 */
interface Column<T> {
  key: keyof T
  header: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  selectable?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onChange: (page: number) => void
  }
  sorting?: {
    column: string
    direction: 'asc' | 'desc'
    onChange: (column: string) => void
  }
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  selectable,
  pagination,
  sorting,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {/* 表格主体 */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableCell className="w-12">
                  <Checkbox />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={String(column.key)}>
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sorting && (
                      <SortButton
                        active={sorting.column === column.key}
                        direction={sorting.direction}
                        onClick={() => sorting.onChange(String(column.key))}
                      />
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                {selectable && (
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 分页器 */}
      {pagination && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={pagination.onChange}
        />
      )}
    </div>
  )
}
```

### L4：模板/布局组件

**特征**：
- 定义页面结构
- 组织有机组件
- 处理布局逻辑
- 提供统一的页面骨架

**核心布局组件清单**：

```yaml
应用布局:
  - AppLayout: 完整应用布局（Header + Sidebar + Main）
  - DashboardLayout: 仪表板布局
  - AuthLayout: 认证页面布局
  - MarketingLayout: 营销页面布局

内容布局:
  - PageContainer: 页面内容容器
  - SplitPane: 分栏布局
  - GridLayout: 网格布局
  - StackLayout: 堆叠布局
```

**布局组件示例（DashboardLayout）**：

```tsx
// components/templates/DashboardLayout/DashboardLayout.tsx

import { Sidebar } from '@/components/organisms/Sidebar'
import { Header } from '@/components/organisms/Header'
import { cn } from '@/lib/utils'

/**
 * DashboardLayout 模板组件
 * 
 * 结构：Header + Sidebar + Main Content
 * 职责：提供统一的仪表板页面骨架
 */
interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  className?: string
}

export function DashboardLayout({
  children,
  sidebar,
  header,
  className,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <Header className="fixed top-0 left-0 right-0 z-50 h-16 border-b">
        {header}
      </Header>

      <div className="flex pt-16">
        {/* 侧边栏 */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 border-r bg-background overflow-y-auto">
          {sidebar || <Sidebar />}
        </aside>

        {/* 主内容区 */}
        <main className={cn('flex-1 ml-64 p-8', className)}>
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## 三、组件设计原则

### 核心原则

```yaml
1. 单一职责原则:
  定义: "每个组件只解决一个问题"
  好处: "易于理解、测试和维护"
  示例:
    ✅ "Button 只处理点击交互的视觉"
    ❌ "Button 同时处理点击、加载状态管理、权限校验"

2. 开闭原则:
  定义: "对扩展开放，对修改关闭"
  好处: "新增功能不影响现有代码"
  示例:
    ✅ "通过 variant prop 扩展按钮样式"
    ❌ "修改 Button 源码添加新样式"

3. 组合优于继承:
  定义: "通过组合小组件构建大组件"
  好处: "灵活、松耦合"
  示例:
    ✅ "FormField = Label + Input + ErrorMessage"
    ❌ "FormField extends Input"

4. Props向下，Events向上:
  定义: "数据通过props传递，交互通过回调上报"
  好处: "单向数据流，易于追踪"
  示例:
    ✅ "<Select value={value} onChange={handleChange} />"
    ❌ "<Select ref={ref} /> // 然后通过ref.current.value获取"
```

### API设计规范

```typescript
/**
 * 组件Props设计最佳实践
 */

// 1. 使用明确的类型而非any
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost'  // ✅ 枚举类型
  // variant: string                           // ❌ 过于宽泛
}

// 2. 提供合理的默认值
interface InputProps {
  type?: 'text' | 'email' | 'password'  // 有默认值用可选
  value: string                          // 必须提供
}

// 3. 使用语义化的命名
interface DialogProps {
  open: boolean           // ✅ 语义清晰
  onOpenChange: (open: boolean) => void
  // isOpen: boolean      // ❌ 冗余的is前缀
  // setOpen: Function    // ❌ 不规范的命名
}

// 4. 支持className和style扩展
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // 继承HTML属性，支持className和style
}

// 5. 使用children而非复杂的render props
interface ModalProps {
  children: React.ReactNode  // ✅ 简单直接
  // renderContent: () => React.ReactNode  // ❌ 除非必要
}
```

---

## 四、状态设计

### 交互状态完整性

```yaml
必备状态:
  default: "默认状态 - 正常展示"
  hover: "悬停状态 - 鼠标进入"
  focus: "聚焦状态 - 键盘导航"
  active: "激活状态 - 点击中"
  disabled: "禁用状态 - 不可交互"

可选状态:
  loading: "加载状态 - 等待响应"
  error: "错误状态 - 验证失败"
  success: "成功状态 - 操作完成"
  selected: "选中状态 - 多选场景"
```

### 状态样式实现

```css
/* 高端优雅的状态设计 */

/* Default - 克制的基础 */
.btn {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
  transition: all 150ms ease-out;
}

/* Hover - 微妙的提升 */
.btn:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

/* Focus - 清晰的焦点环 */
.btn:focus-visible {
  outline: none;
  box-shadow: 
    var(--shadow-sm),
    0 0 0 2px var(--color-bg-surface),
    0 0 0 4px var(--color-border-focus);
}

/* Active - 即时的反馈 */
.btn:active:not(:disabled) {
  background: var(--color-bg-sunken);
  transform: translateY(0);
  box-shadow: none;
}

/* Disabled - 明确但不刺眼 */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading - 保持可见但不可交互 */
.btn[data-loading="true"] {
  pointer-events: none;
  position: relative;
}

.btn[data-loading="true"]::after {
  content: '';
  position: absolute;
  /* 加载动画... */
}
```

---

## 五、组件文档规范

### 组件文档结构

每个组件应包含以下文档：

```markdown
# ComponentName

组件的一句话描述。

## 何时使用

描述组件的使用场景和适用情况。

## 基础用法

最简单的使用示例。

## 变体

不同变体的展示和说明。

## 尺寸

不同尺寸的展示和说明。

## 状态

不同状态的展示和说明。

## API

### Props

| 属性名 | 类型 | 默认值 | 描述 |
|-------|------|--------|------|
| variant | string | 'primary' | 按钮变体 |

### Events

| 事件名 | 参数 | 描述 |
|-------|------|------|
| onClick | (event: MouseEvent) => void | 点击时触发 |

## 无障碍

相关的无障碍考虑和实现。

## 最佳实践

✅ 推荐做法
❌ 避免做法
```

---

## 六、组件质量检查清单

### 功能检查

- [ ] 所有Props都有类型定义
- [ ] 必要的Props有验证
- [ ] 提供合理的默认值
- [ ] 支持className扩展
- [ ] 支持ref转发

### 状态检查

- [ ] 覆盖所有交互状态
- [ ] 状态过渡平滑
- [ ] 禁用状态明确
- [ ] 加载状态可用

### 无障碍检查

- [ ] 语义化HTML结构
- [ ] 正确的ARIA标签
- [ ] 键盘导航支持
- [ ] 焦点管理正确
- [ ] 颜色对比度达标

### 性能检查

- [ ] 避免不必要的重渲染
- [ ] 大列表使用虚拟化
- [ ] 图片懒加载
- [ ] 动画使用GPU加速

---

## 参考资源

- Atomic Design by Brad Frost
- Component Driven User Interfaces
- Radix UI Design Principles
- shadcn/ui Architecture
