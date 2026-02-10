---
name: shadcn-implementation
description: "shadcn/ui深度应用指南 - 组件定制、主题系统、最佳实践，打造高端优雅的UI实现。"
version: 1.0.0
category: design
---

# shadcn/ui 深度应用指南

> shadcn/ui 不是组件库，而是可复制粘贴的组件集合 — 你拥有代码，你控制一切

---

## 一、shadcn/ui 设计哲学

### 核心理念

```yaml
所有权:
  - 组件代码直接复制到项目中
  - 你拥有完全的控制权
  - 可以自由修改和定制
  - 不受版本更新影响

组合性:
  - 基于Radix UI无样式原语
  - 通过Tailwind CSS实现样式
  - 遵循组合优于继承
  - 易于扩展和修改

可访问性:
  - 继承Radix UI的无障碍特性
  - 键盘导航开箱即用
  - ARIA标签自动处理
  - 焦点管理正确
```

### 为什么选择shadcn/ui

| 特性 | shadcn/ui | 传统组件库 |
|-----|-----------|----------|
| **代码所有权** | ✅ 完全拥有 | ❌ 依赖库 |
| **定制自由度** | ✅ 无限制 | ⚠️ 受限于API |
| **包体积** | ✅ 按需复制 | ⚠️ 全量引入 |
| **版本依赖** | ✅ 无依赖 | ❌ 版本锁定 |
| **学习成本** | ⚠️ 需理解内部 | ✅ 快速上手 |

---

## 二、项目集成

### 初始化配置

```bash
# 1. 安装shadcn-ui CLI
npx shadcn-ui@latest init

# 2. 配置选项
✔ Would you like to use TypeScript (recommended)? yes
✔ Which style would you like to use? Default
✔ Which color would you like to use as base color? Slate
✔ Where is your global CSS file? app/globals.css
✔ Do you want to use CSS variables for colors? yes
✔ Are you using a custom tailwind prefix? no
✔ Where is your tailwind.config.js located? tailwind.config.js
✔ Configure the import alias for components? @/components
✔ Configure the import alias for utils? @/lib/utils
```

### 目录结构

```
src/
├── components/
│   └── ui/                    # shadcn组件存放
│       ├── button.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── ...
├── lib/
│   └── utils.ts               # cn() 工具函数
└── app/
    └── globals.css            # 全局样式 + CSS变量
```

### 核心工具函数

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn() - 合并className的工具函数
 * 
 * 功能：
 * 1. 合并多个className
 * 2. 处理条件className
 * 3. 合并Tailwind类名冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 使用示例
cn("px-4 py-2", condition && "bg-blue-500", className)
// 输出: "px-4 py-2 bg-blue-500 ..." (合并后去重)
```

---

## 三、主题系统定制

### CSS变量架构

```css
/* globals.css - 高端优雅主题 */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* === 背景色 === */
    /* 使用微妙的暖调，避免纯白 */
    --background: 0 0% 99%;
    --foreground: 222 47% 11%;

    /* === 卡片 === */
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;

    /* === 弹出层 === */
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* === 主色 - 深邃优雅的蓝 === */
    --primary: 222 47% 31%;
    --primary-foreground: 210 40% 98%;

    /* === 次要色 - 温和的灰蓝 === */
    --secondary: 217 19% 96%;
    --secondary-foreground: 222 47% 11%;

    /* === 静音色 - 低调的辅助 === */
    --muted: 217 19% 96%;
    --muted-foreground: 215 16% 47%;

    /* === 强调色 - 活力点缀 === */
    --accent: 217 19% 96%;
    --accent-foreground: 222 47% 11%;

    /* === 危险色 - 克制的警示 === */
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;

    /* === 边框 - 若隐若现 === */
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 222 47% 31%;

    /* === 圆角 === */
    --radius: 0.5rem;
  }

  .dark {
    /* === 深色模式 - 深邃但不沉闷 === */
    --background: 224 20% 6%;
    --foreground: 213 31% 91%;

    --card: 224 20% 8%;
    --card-foreground: 213 31% 91%;

    --popover: 224 20% 8%;
    --popover-foreground: 213 31% 91%;

    --primary: 217 91% 60%;
    --primary-foreground: 224 20% 6%;

    --secondary: 224 20% 12%;
    --secondary-foreground: 213 31% 91%;

    --muted: 224 20% 12%;
    --muted-foreground: 215 20% 65%;

    --accent: 224 20% 12%;
    --accent-foreground: 213 31% 91%;

    --destructive: 0 63% 55%;
    --destructive-foreground: 210 40% 98%;

    --border: 224 20% 15%;
    --input: 224 20% 15%;
    --ring: 217 91% 60%;
  }
}

/* === 高级排版基础 === */
@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* 标题字体 */
  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold tracking-tight;
  }

  /* 聚焦环统一 */
  [data-focus-visible] {
    @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
  }
}
```

### Tailwind配置扩展

```javascript
// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // === 自定义颜色 ===
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      
      // === 自定义字体 ===
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        display: ["var(--font-display)", ...fontFamily.serif],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      
      // === 自定义动画 ===
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in-from-top 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      
      // === 圆角 ===
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 四、组件深度定制

### 定制层级

```yaml
L1 - CSS变量覆盖:
  范围: "全局颜色、圆角、间距"
  方式: "修改globals.css中的变量"
  影响: "所有组件"

L2 - 组件样式修改:
  范围: "特定组件的默认样式"
  方式: "修改组件文件中的className"
  影响: "单个组件"

L3 - 变体扩展:
  范围: "添加新的视觉变体"
  方式: "在CVA配置中添加新variant"
  影响: "组件的可选样式"

L4 - 功能扩展:
  范围: "添加新的Props和逻辑"
  方式: "修改组件代码"
  影响: "组件行为"
```

### 示例：定制Button组件

```tsx
// components/ui/button.tsx

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

/**
 * Button 组件 - 高端优雅定制版
 * 
 * 定制内容：
 * 1. 添加微妙的悬停提升效果
 * 2. 优化焦点环样式
 * 3. 添加loading状态支持
 * 4. 新增subtle变体
 */
const buttonVariants = cva(
  [
    // 基础样式
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md text-sm font-medium",
    // 过渡 - 使用更细腻的时间控制
    "transition-all duration-150 ease-out",
    // 焦点 - 清晰但不突兀
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-ring focus-visible:ring-offset-2",
    // 禁用
    "disabled:pointer-events-none disabled:opacity-50",
    // 🆕 微妙的悬停提升
    "hover:-translate-y-px hover:shadow-sm",
    "active:translate-y-0 active:shadow-none",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90",
        ],
        outline: [
          "border border-input bg-background",
          "hover:bg-accent hover:text-accent-foreground",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80",
        ],
        ghost: [
          "hover:bg-accent hover:text-accent-foreground",
        ],
        link: [
          "text-primary underline-offset-4 hover:underline",
          "hover:translate-y-0 hover:shadow-none", // 禁用链接的提升效果
        ],
        // 🆕 新增subtle变体 - 极度克制的视觉
        subtle: [
          "bg-transparent text-muted-foreground",
          "hover:bg-secondary/50 hover:text-foreground",
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // 🆕 新增xs尺寸
        xs: "h-7 rounded px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  // 🆕 loading状态
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* 🆕 加载状态 */}
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 示例：定制Card组件

```tsx
// components/ui/card.tsx

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Card 组件 - 高端优雅定制版
 * 
 * 定制内容：
 * 1. 使用多层阴影
 * 2. 添加hover提升效果
 * 3. 支持交互式和静态两种模式
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // 🆕 是否可交互
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // 基础样式
        "rounded-lg border bg-card text-card-foreground",
        // 🆕 多层阴影 - 更自然
        "shadow-sm",
        // 过渡
        "transition-all duration-200 ease-out",
        // 🆕 交互模式
        interactive && [
          "cursor-pointer",
          "hover:shadow-md hover:-translate-y-1",
          "hover:border-border/80",
          "active:translate-y-0 active:shadow-sm",
        ],
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

---

## 五、高端优雅实现技巧

### 微交互设计

```css
/* 高端的微交互 */

/* 1. 按钮悬停 - 微妙提升 */
.elegant-hover {
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;
}

.elegant-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 2. 卡片悬停 - 边框呼吸 */
.card-hover {
  border: 1px solid hsl(var(--border));
  transition: border-color 200ms ease-out;
}

.card-hover:hover {
  border-color: hsl(var(--border) / 0.5);
}

/* 3. 输入框聚焦 - 优雅扩展 */
.input-focus {
  transition: box-shadow 150ms ease-out, border-color 150ms ease-out;
}

.input-focus:focus {
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.1);
}

/* 4. 文字链接 - 下划线渐显 */
.link-underline {
  position: relative;
}

.link-underline::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 200ms ease-out;
}

.link-underline:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
```

### 加载状态设计

```tsx
// 骨架屏组件 - 优雅的加载占位

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}

// 使用示例
function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  )
}
```

### 空状态设计

```tsx
// 空状态组件 - 优雅的占位

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-4 rounded-full bg-muted p-3 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
```

---

## 六、静态页面最佳实践

### Vibe Coding场景下的应用

```yaml
静态页面特点:
  - 无需JavaScript运行时状态管理
  - 通过CSS类名控制样式
  - 使用data属性表示状态
  - 预编译组件为HTML

实现策略:
  1. 组件结构HTML化
  2. 交互状态通过CSS实现
  3. 复杂交互通过描述而非实现
  4. 利用CSS变量实现主题
```

### 静态组件示例

```html
<!-- 静态Button组件 -->
<button 
  class="inline-flex items-center justify-center gap-2 
         rounded-md bg-primary text-primary-foreground 
         h-10 px-4 text-sm font-medium
         hover:bg-primary/90 
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
         disabled:pointer-events-none disabled:opacity-50"
  type="button"
>
  Submit
</button>

<!-- 静态Card组件 -->
<div class="rounded-lg border bg-card text-card-foreground shadow-sm">
  <div class="p-6 space-y-1.5">
    <h3 class="text-lg font-semibold tracking-tight">Card Title</h3>
    <p class="text-sm text-muted-foreground">Card description goes here.</p>
  </div>
  <div class="p-6 pt-0">
    <p>Card content...</p>
  </div>
</div>

<!-- 带状态的静态组件（使用data属性）-->
<div 
  class="rounded-lg border p-4
         data-[state=selected]:border-primary
         data-[state=selected]:bg-primary/5"
  data-state="default"
>
  Selectable Card
</div>
```

---

## 七、质量检查清单

### 主题一致性
- [ ] 所有颜色使用CSS变量
- [ ] 深色模式测试通过
- [ ] 间距遵循设计令牌
- [ ] 圆角统一

### 组件质量
- [ ] 所有状态覆盖
- [ ] 无障碍支持完整
- [ ] 响应式适配
- [ ] 性能优化

### 视觉优雅
- [ ] 微交互自然流畅
- [ ] 阴影层次感
- [ ] 色彩饱和度适中
- [ ] 排版层级清晰

---

## 参考资源

- [shadcn/ui 官方文档](https://ui.shadcn.com)
- [Radix UI 原语文档](https://www.radix-ui.com)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [CVA (Class Variance Authority)](https://cva.style)
