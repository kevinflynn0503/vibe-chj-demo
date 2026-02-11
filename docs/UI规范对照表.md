# UI 规范对照表

> **快速查询**：旧写法 vs 新写法对照

---

## 字体大小

| ❌ 旧写法（禁用） | ✅ 新写法 | 大小 | 使用场景 |
|----------------|---------|------|---------|
| `text-[10px]` | `text-tag` | 11px | 标签、徽章 |
| `text-[11px]` | `text-tag` | 11px | 标签、徽章 |
| `text-[13px]` | `text-sm` | 13px | 正文、按钮 |
| - | `text-xs` | 12px | 时间戳、辅助信息 |
| - | `text-base` | 14px | 标准正文、表格 |
| - | `text-lg` | 16px | 页面标题、卡片标题 |
| - | `text-xl` | 18px | 小型KPI统计 |
| - | `text-2xl` | 24px | 大型KPI统计 |

---

## 文字颜色

| ❌ 旧写法 | ✅ 新写法 | 颜色值 | 使用场景 |
|---------|---------|--------|---------|
| `text-slate-900` | `text-text-primary` | #1A1D26 | 主标题、正文 |
| `text-slate-600` | `text-text-secondary` | #5E6278 | 描述文字、辅助信息 |
| `text-slate-400` | `text-text-muted` | #9097A7 | 弱化文字、占位符 |
| `text-[#3370FF]` | `text-brand` | #3370FF | 品牌色文字、链接 |
| `style={{ color: '#3370FF' }}` | `text-brand` | #3370FF | 品牌色文字 |

---

## 圆角

| ❌ 旧写法 | ✅ 新写法 | 大小 | 使用场景 |
|---------|---------|------|---------|
| `rounded-[10px]` | `rounded-lg` | 10px | 卡片 |
| `rounded-[5px]` | `rounded-sm` | 6px | 标签、徽章 |
| `rounded-[8px]` | `rounded` | 8px | 按钮、输入框 |
| `rounded-md` | `rounded` | 8px | 按钮、输入框 |

---

## 卡片样式

### ❌ 旧写法（不规范）

```tsx
// 方式1：局部组件定义
function Card({ onClick, children }) {
  return (
    <div 
      className="bg-white border border-slate-200 rounded-[10px] p-3 hover:border-slate-300"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// 方式2：直接写Tailwind
<div className="bg-white border border-slate-200 rounded-[10px] p-4"
  style={{ boxShadow: '...' }}>
  ...
</div>

// 方式3：使用CSS类（使用率低）
<div className="card p-4">...</div>
```

### ✅ 新写法（标准组件）

```tsx
import { CardCompact, CardStandard, CardAccent } from '@/components/ui';

// 看板小卡片（p-3）
<CardCompact onClick={...}>
  {children}
</CardCompact>

// 列表标准卡片（p-4）
<CardStandard>
  {children}
</CardStandard>

// 带强调边的卡片
<CardAccent accentColor="#3370FF">
  {children}
</CardAccent>
```

---

## 标签样式

### ❌ 旧写法

```tsx
// 方式1：完全自定义
<span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
  {ent.industry}
</span>

// 方式2：CSS类（使用率低）
<span className="tag tag-blue">{ent.industry}</span>

// 方式3：混合样式
<span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border-emerald-100 rounded border">
  政策 A级
</span>
```

### ✅ 新写法

```tsx
import { Tag, TagPolicyGrade, TagStatus } from '@/components/ui';

// 基础标签
<Tag variant="blue">{ent.industry}</Tag>

// 带边框标签
<Tag variant="emerald" withBorder>在孵企业</Tag>

// 语义化标签
<TagPolicyGrade grade="A" />      // → 政策 A级
<TagStatus status="pending" />     // → 待处理
<TagStatus status="done" />        // → 已完成
```

**颜色变体**：
- `blue`, `green`, `emerald`, `orange`, `amber`
- `red`, `purple`, `violet`, `gray`, `slate`

---

## 按钮样式

### ❌ 旧写法（不规范的部分）

```tsx
// AI功能按钮（完全自定义）
<button className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium text-[#3370FF] bg-blue-50 hover:bg-blue-100 rounded border border-blue-100">
  <Sparkles className="h-3 w-3" />
  一键 AI 生成
</button>

// 文字按钮（完全自定义）
<button className="text-[10px] text-[#3370FF] font-medium hover:underline">
  查看准备 →
</button>
```

### ✅ 新写法

```tsx
// 主要操作按钮（已规范）
<button className="btn btn-primary btn-sm">
  <Plus className="h-3.5 w-3.5" /> 新增走访
</button>

// 次要操作按钮（已规范）
<button className="btn btn-default btn-sm">
  <FileText className="h-3.5 w-3.5" /> 走访记录
</button>

// AI功能按钮（新增）
<button className="btn-ai">
  <Sparkles className="h-3 w-3" />
  一键 AI 生成
</button>

// 文字链接按钮（新增）
<button className="btn-link">
  查看准备 →
</button>

// 图标按钮（新增）
<button className="btn-icon btn-ghost">
  <Settings className="h-4 w-4" />
</button>
```

---

## 阴影

### ❌ 旧写法

```tsx
// 内联style
<div style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}>
  ...
</div>

// 或无阴影
<div className="bg-white border border-slate-200 rounded-lg">
  ...
</div>
```

### ✅ 新写法

```tsx
// 使用 Tailwind 类
<div className="bg-white border border-slate-200 rounded-lg shadow-card">
  ...
</div>

// hover 状态
<div className="shadow-card hover:shadow-card-hover transition-all">
  ...
</div>

// 或使用 Card 组件（自动包含阴影）
<CardStandard>...</CardStandard>
```

---

## 间距

### 卡片内边距

| ❌ 不一致 | ✅ 统一规范 | 使用场景 |
|---------|-----------|---------|
| `p-3` / `p-4` / `p-3.5` 混用 | `p-3` | 看板小卡片 |
| - | `p-4` | 列表卡片、详情卡片 |
| - | `p-6` | 页面级大容器 |

### 元素间距

| 间距类 | 大小 | 使用场景 |
|--------|------|---------|
| `gap-2` | 8px | 图标 + 文字 |
| `gap-3` | 12px | 按钮组、标签组 |
| `space-y-4` | 16px | 页面内容块（标准） |
| `space-y-6` | 24px | 二级页面区块（宽松） |

---

## 完整示例对比

### ❌ 旧代码（visit/page.tsx）

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

// 使用
<Card onClick={() => router.push(`/visit/${ent.id}`)}>
  <div className="flex items-start justify-between mb-2">
    <div className="text-sm font-semibold text-slate-900 leading-snug">
      {ent.short_name ?? ent.name}
    </div>
    <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0 ml-2 bg-violet-50 text-violet-600">
      {(ent.short_name ?? ent.name).charAt(0)}
    </div>
  </div>
  <div className="flex flex-wrap gap-1 mb-2">
    {ent.industry && 
      <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
        {ent.industry}
      </span>
    }
    {ent.development_stage && 
      <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded">
        {ent.development_stage}
      </span>
    }
  </div>
  <div className="space-y-1 text-[11px] text-slate-500">
    {ent.employee_count && 
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        {ent.employee_count.toLocaleString()} 人
      </div>
    }
  </div>
  
  <div className="mt-2.5 pt-2 border-t border-slate-100">
    {hasReport ? (
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] text-emerald-600">
          <CheckCircle2 className="h-3 w-3" />
          <Bot className="h-3 w-3" />
          AI 已生成背调+清单
        </span>
        <button
          className="text-[10px] text-[#3370FF] font-medium hover:underline"
          onClick={(e) => { e.stopPropagation(); router.push(`/visit/${ent.id}`); }}
        >
          查看准备 →
        </button>
      </div>
    ) : (
      <button
        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium text-[#3370FF] bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 transition-colors"
        onClick={(e) => { e.stopPropagation(); generateReport(ent.short_name ?? ent.name); }}
      >
        <Sparkles className="h-3 w-3" />
        一键 AI 生成走访准备
      </button>
    )}
  </div>
</Card>
```

### ✅ 新代码

```tsx
import { CardCompact, Tag, TagStatus } from '@/components/ui';
import { cn } from '@/lib/utils';

// 删除局部 Card 组件定义

// 使用标准组件
<CardCompact onClick={() => router.push(`/visit/${ent.id}`)}>
  <div className="flex items-start justify-between mb-2">
    <div className="text-sm font-semibold text-text-primary leading-snug">
      {ent.short_name ?? ent.name}
    </div>
    <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0 ml-2 bg-violet-50 text-violet-600">
      {(ent.short_name ?? ent.name).charAt(0)}
    </div>
  </div>
  
  <div className="flex flex-wrap gap-1 mb-2">
    {ent.industry && <Tag variant="blue">{ent.industry}</Tag>}
    {ent.development_stage && <Tag variant="gray">{ent.development_stage}</Tag>}
  </div>
  
  <div className="space-y-1 text-xs text-text-muted">
    {ent.employee_count && 
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        {ent.employee_count.toLocaleString()} 人
      </div>
    }
  </div>
  
  <div className="mt-2.5 pt-2 border-t border-slate-100">
    {hasReport ? (
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-tag text-emerald-600">
          <CheckCircle2 className="h-3 w-3" />
          <Bot className="h-3 w-3" />
          AI 已生成背调+清单
        </span>
        <button
          className="btn-link"
          onClick={(e) => { e.stopPropagation(); router.push(`/visit/${ent.id}`); }}
        >
          查看准备 →
        </button>
      </div>
    ) : (
      <button
        className="btn-ai w-full"
        onClick={(e) => { e.stopPropagation(); generateReport(ent.short_name ?? ent.name); }}
      >
        <Sparkles className="h-3 w-3" />
        一键 AI 生成走访准备
      </button>
    )}
  </div>
</CardCompact>
```

**改进统计**：
- ✅ 删除 24 行局部 Card 定义
- ✅ 7 处字号规范化（`text-[10px]` → `text-tag`, `text-[11px]` → `text-xs`）
- ✅ 3 处颜色规范化（`text-slate-900` → `text-text-primary`）
- ✅ 2 处圆角规范化（`rounded-[10px]` → `rounded-lg`）
- ✅ 删除 1 处内联 `style`
- ✅ 标签统一使用 `<Tag>` 组件
- ✅ 按钮统一使用 `.btn-ai` 和 `.btn-link` 类

**代码行数**：85 行 → 61 行（减少 28%）

---

## 🎯 记忆口诀

### 字号
```
tag最小11px，标签专用莫要慌
xs是12px，时间戳辅助信息藏
sm是13px，正文按钮它最棒
base是14px，标准正文表格扛
lg是16px，标题醒目不张扬
xl和2xl，统计数值亮堂堂
```

### 卡片
```
CardCompact看板用，p-3紧凑不拥挤
CardStandard列表选，p-4标准最适宜
CardAccent强调边，重要信息看得清
```

### 颜色
```
primary是主文字，标题正文它打底
secondary次级文，描述辅助有层次
muted是弱化色，占位提示不扰人
brand是品牌蓝，链接强调用处神
```

---

**打印此表，贴在显示器旁，规范永不忘！🎨**
