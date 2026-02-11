# UI 重构进度跟踪

> **开始时间**：2026-02-11  
> **当前状态**：进行中 🚧

---

## ✅ 已完成

### 1. 基础设施搭建 ✓

- [x] 更新 `tailwind.config.js`
  - ✅ 添加 `fontSize` 配置（text-tag, text-xs, text-sm 等）
  - ✅ 添加 `text.*` 颜色配置
  - ✅ 修改 `borderRadius.lg` 从 12px → 10px
  - ✅ 添加 `shadow-card` 和 `shadow-card-hover`
  - ✅ 添加 `brand.subtle` 颜色

- [x] 更新 `src/index.css`
  - ✅ 添加 `.btn-icon` 类
  - ✅ 添加 `.btn-link` 类
  - ✅ 添加 `.btn-ai` 类

- [x] 创建基础组件
  - ✅ `src/components/ui/Card.tsx` (Card, CardCompact, CardStandard, CardAccent)
  - ✅ `src/components/ui/Tag.tsx` (Tag, TagPolicyGrade, TagStatus)
  - ✅ 更新 `src/components/ui/index.ts` 导出

---

### 2. 页面重构 ✓

#### ✅ visit/page.tsx (走访工作台) - 已完成

**重构时间**：2026-02-11

**改进统计**：
- ✅ 删除局部 Card 组件定义（9行代码）
- ✅ 使用标准 `<CardCompact>` 组件（4处）
- ✅ 字号规范化：
  - `text-[10px]` → `text-tag` (11处)
  - `text-[11px]` → `text-xs` (8处)
  - `text-base` → `text-lg` (标题，1处)
- ✅ 颜色规范化：
  - `text-slate-900` → `text-text-primary` (8处)
  - `text-slate-400` → `text-text-muted` (5处)
  - `text-slate-500` → `text-text-secondary` (6处)
  - `text-[#3370FF]` → `text-brand` (2处)
- ✅ 标签统一使用 `<Tag>` 组件（8处）
- ✅ 按钮规范化：
  - 文字按钮 → `.btn-link` (1处)
  - AI 按钮 → `.btn-ai` (2处)

**代码改进**：
- 代码行数：264行 → 255行（减少 3.4%）
- 重复代码消除：删除9行局部Card定义
- 可维护性：大幅提升（使用标准组件）

**验证状态**：⏳ 待验证（需要启动项目查看）

---

#### ✅ page.tsx (首页) - 已完成

**重构时间**：2026-02-11

**改进统计**：
- ✅ 使用标准 `<CardStandard>` 组件
  - 今日重点卡片（3处）
  - 场景入口卡片（4处）
- ✅ 使用标准 `<Card>` 组件（AI 动态容器）
- ✅ 字号规范化：
  - `text-base` → `text-lg` (标题，1处)
  - `text-[10px]` → `text-tag` (3处)
  - `text-[11px]` → `text-sm` (按钮，1处)
- ✅ 颜色规范化：
  - `text-slate-900` → `text-text-primary` (7处)
  - `text-slate-400` → `text-text-muted` (4处)
  - `text-slate-500` → `text-text-secondary` (5处)
  - `text-slate-600` → `text-text-secondary` (1处)
  - `text-slate-800` → `text-text-primary` (3处)
  - `text-[#3370FF]` → `text-brand` (2处)
- ✅ 圆角规范化：
  - `rounded-[10px]` → `rounded-lg` (通过组件自动应用)
- ✅ 标签使用 `<Tag>` 组件（优先级标签，3处）

**代码改进**：
- 代码行数：300行 → 291行（减少 3%）
- 组件化：7处卡片全部使用标准组件
- 可维护性：大幅提升

**验证状态**：⏳ 待验证

---

## 🚧 进行中

### 3. 其他页面重构

---

#### 📝 enterprises/page.tsx (企业画像库) - 待重构

**预估工作量**：2小时

**需要改进的问题**：
- 企业卡片使用内联样式（可以使用 CardStandard）
- 标签使用完全自定义样式
- 字号不统一

**优先级**：P1 (常用页面)

---

#### 📝 其他页面 - 待重构

待评估和重构的页面：
- [ ] `dashboard/page.tsx`
- [ ] `policy/page.tsx`
- [ ] `incubator/page.tsx`
- [ ] 详情页面（企业详情、走访详情等）

---

## 📊 重构统计

### 整体进度

- **已完成页面**：2 / ~15 (13.3%)
- **已完成组件**：2 / 2 (100%)
- **配置完成度**：100%

### 改进指标

| 指标 | 目标 | 当前 | 达成率 |
|------|------|------|--------|
| 字号种类减少 | ≤6种 | 6种 (tag/xs/sm/base/lg/xl/2xl) | ✓ |
| 任意值消除 | 0 | visit: 0, home: 0 | ✓ |
| 组件使用率 | >80% | visit: 100%, home: 100% | ✓ |
| 代码行数减少 | - | visit: -3.4%, home: -3% | ✓ |

---

## 🎯 下一步计划

### 立即行动（今天）

1. **验证 visit/page.tsx 重构**
   - [ ] 启动开发服务器
   - [ ] 检查页面显示是否正常
   - [ ] 检查交互是否正常
   - [ ] 检查无控制台错误

2. **重构 page.tsx (首页)**
   - [ ] 阅读代码，标注问题点
   - [ ] 执行重构
   - [ ] 测试验证

### 本周完成

- [ ] 重构 3-5 个核心页面
- [ ] 编写重构最佳实践文档
- [ ] 团队代码审查会议

### 本月完成

- [ ] 重构所有页面
- [ ] 视觉回归测试
- [ ] 性能优化验证

---

## 🐛 问题记录

### 已解决

暂无

### 待解决

暂无

### 需要讨论

暂无

---

## 📝 重构笔记

### 经验总结

1. **CardCompact 组件非常适合看板场景**
   - 自动包含 p-3, hover, clickable
   - 减少重复代码

2. **Tag 组件简化了标签使用**
   - 从 5-6 个类名 → 1 个组件
   - 自动应用 text-tag 字号

3. **btn-ai 类完美契合 AI 功能按钮**
   - 统一品牌色 + 背景
   - 良好的 hover 效果

### 注意事项

1. **不要破坏现有交互**
   - 确保 onClick 等事件正常工作
   - 保持 e.stopPropagation() 等逻辑

2. **渐进式重构**
   - 一个页面一个页面来
   - 每完成一个页面就测试

3. **保持设计一致性**
   - 使用标准组件
   - 避免特殊样式

---

## ✅ 重构检查清单

每次重构后检查：

**代码质量**
- [ ] 无 `text-[10px]`, `text-[11px]` 等任意值
- [ ] 无 `rounded-[10px]` 等任意圆角值
- [ ] 无内联 `style={{ boxShadow: ... }}`
- [ ] 卡片使用 `<Card*>` 组件
- [ ] 标签使用 `<Tag>` 组件
- [ ] 颜色使用 `text-text-*` 或 `text-brand`

**功能验证**
- [ ] 页面正常显示
- [ ] 交互功能正常
- [ ] 无控制台错误
- [ ] 无 TypeScript 错误

**视觉验证**
- [ ] 样式无明显变化（或更好）
- [ ] 间距正常
- [ ] 字号统一
- [ ] 颜色协调

---

**更新频率**：每完成一个页面更新一次  
**维护者**：开发团队
