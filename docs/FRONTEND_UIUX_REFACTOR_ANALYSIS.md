# vibe-chj-demo 前端 UI/UX 重构深度分析

> 核心问题：视觉表现力不够高级，与 deer-flow 存在明显质感差距。
> 分析维度：视觉质感、功能层级、视觉动线、内容布局、视觉一致性。
> 约束条件：不能有 AI 感，不能与 deer-flow 设计语言冲突。

---

## 一、deer-flow 设计 DNA（对齐基准）

在谈 vibe-chj-demo 的问题之前，先提取 deer-flow 的视觉 DNA，作为对齐基准。

### 1.1 deer-flow 的视觉特征

| 维度 | deer-flow 做法 | 效果 |
|------|---------------|------|
| **背景** | 主背景 `#f4f5f7`（暖灰），内容区白色卡片 | 卡片自然「浮」在灰底上，层次分明 |
| **圆角** | 4 级体系：4px/6px/8px/12px，卡片统一 12px | 圆润但不幼稚，精密感 |
| **阴影** | `0px 8px 24px rgba(0,0,0,0.08)` 为主力阴影 | 柔和但有存在感，卡片有「悬浮」质感 |
| **边框** | `#e8e8e8` 单色，极少使用 | 用阴影代替边框建立层次 |
| **色彩** | 中性灰为主，蓝色 `#0068d9` 仅做强调 | 克制、专业、不花哨 |
| **字体** | SF Pro Display 为首选，PingFang SC 中文 | 系统原生感，清晰锐利 |
| **排版** | 5 级层次（H0-H4），body 3 级，行高宽松 | 信息层级清晰，阅读舒适 |
| **间距** | 4px 基准（4/8/12/16/20），Figma 对齐 | 精密、有节奏 |
| **动效** | Framer Motion 做复杂交互，tw-animate 做进出场 | 流畅但不花哨 |
| **高级效果** | 仅浮层用 `backdrop-blur-sm`，极少渐变 | 克制使用，不滥用 |
| **组件** | Radix 原语 + CVA 变体，shadcn/ui 体系 | 一致性强，API 规范 |

### 1.2 deer-flow 的设计哲学

```
1. 用阴影建立层次，而非边框和颜色
2. 背景灰 > 卡片白 > 品牌色点缀 — 三层视觉层级
3. 圆角有体系（4/6/8/12），不是随意 rounded-lg
4. 色彩极度克制 — 灰 + 蓝，语义色仅在状态指示时出现
5. 间距精密 — 4px 基准，不出现 3px/5px/7px 等非标值
6. 排版驱动信息层级 — 字重 + 字号 + 颜色三维度区分
```

---

## 二、vibe-chj-demo 与 deer-flow 的差距诊断

### 2.1 差距总览

| 维度 | deer-flow | vibe-chj-demo | 差距 |
|------|-----------|---------------|------|
| 背景 | `#f4f5f7` 暖灰 | `#FFFFFF` 纯白 | 卡片与背景无对比，层次塌陷 |
| 阴影 | `8px 24px rgba(0,0,0,0.08)` | `1px 2px rgba(0,0,0,0.03)` | 阴影过轻，卡片贴在页面上 |
| 边框 | 极少，用阴影替代 | 大量 `border border-line` | 边框感重，显得「网页」而非「产品」|
| 圆角 | 4/6/8/12 四级 | 4/6/8/10/12 + 随意 rounded-full | 缺乏统一规则 |
| 色彩 | 灰 + 蓝，极度克制 | 蓝/绿/紫/橙/红 多色并存 | 彩虹感，缺乏克制 |
| 排版 | 5 级标题 + 3 级正文 | 层级模糊，主次不分 | 信息层级不清晰 |
| 间距 | 4px 基准 | 混用 gap-3(12px)/gap-4(16px) | 节奏不稳定 |
| 动效 | Framer Motion + tw-animate | 仅 `transition-all 150ms` | 界面「死板」 |
| 组件 | shadcn/ui + CVA | 自研 + 硬编码 | 质量和一致性差距大 |

### 2.2 核心问题深度剖析

#### 问题一：视觉层次塌陷 — 「一切都在同一个平面上」

这是最根本的问题。deer-flow 通过 **灰底 + 白卡 + 阴影** 建立了清晰的 Z 轴层次：

```
deer-flow:
  [灰色背景 #f4f5f7]
    └── [白色卡片 + shadow-2] ← 明显浮起
          └── [内容]

vibe-chj-demo:
  [白色背景 #FFFFFF]
    └── [白色卡片 + shadow-card(0.03)] ← 几乎看不出
          └── [内容]
```

**结果**：vibe-chj-demo 的页面看起来像一张平铺的表格，而不是一个有层次的界面。卡片、背景、内容区在视觉上混为一体。

**具体表现**：

```css
/* vibe-chj-demo 的卡片阴影 */
--shadow-card: 0 1px 2px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.02);
/* opacity 0.03 + 0.02，几乎不可见 */

/* deer-flow 的阴影 */
--shadow-2: 0px 8px 24px rgba(0, 0, 0, 0.08);
/* 8px 扩散 + 0.08 透明度，明显可见 */
```

#### 问题二：色彩失控 — 「彩虹驾驶舱」

首页场景入口使用了 4 种强调色，每种都以高饱和度出现：

```tsx
// page.tsx L163-190
accentColor: '#3370FF',  // 蓝
accentColor: '#10B981',  // 绿
accentColor: '#8B5CF6',  // 紫
accentColor: '#F59E0B',  // 橙
```

这些颜色不仅出现在图标上，还通过 `style={{ color: s.accentColor }}` 渲染到数字上，形成 4 个色块并排的「彩虹效果」。

**对比 deer-flow**：整个应用只用蓝色 `#0068d9` 做强调，其余全是灰度。

**更严重的是**：统计卡片又用了另一套颜色：

```tsx
// page.tsx L196-199
{ color: 'text-brand', bg: 'bg-blue-50/80' },
{ color: 'text-emerald-600', bg: 'bg-emerald-50/80' },
{ color: 'text-amber-600', bg: 'bg-amber-50/80' },
{ color: 'text-violet-600', bg: 'bg-violet-50/80' },
```

同一个首页，8 个色块（4 统计卡 + 4 场景入口），每个都是不同颜色。这违反了 frontend-design skill 的核心原则：**「一个主色 + 一个强调色 + 一个中性系统，避免均衡分布的调色板」**。

#### 问题三：功能层级混乱 — 「什么都重要 = 什么都不重要」

首页从上到下的视觉权重：

```
[头部问候]      text-lg font-bold     ← 应该最重要，但字号不够大
[统计卡片×4]    text-xl font-bold     ← 4 个彩色数字抢视线
[今日重点×3]    text-sm font-semibold ← 本应最重要的行动项，却最小
[场景入口×4]    text-xl font-bold     ← 又是 4 个大数字
[AI 动态列表]   text-sm               ← 合理的次要权重
```

**问题**：统计卡片和场景入口的数字（`text-xl font-bold`）比「今日重点」的标题（`text-sm font-semibold`）视觉权重大得多。用户的视线会被数字吸引，而不是被真正需要行动的任务吸引。

**deer-flow 的做法**：主操作区（聊天输入）占据视觉中心，侧边信息用更小字号和更淡颜色退居二线。

#### 问题四：视觉一致性崩坏 — 「三个页面三种风格」

**Tab 组件**：

| 页面 | Tab 形态 | 激活态 |
|------|---------|--------|
| Dashboard | Pill 式（圆角实心背景） | `bg-brand text-white` |
| 企业详情 | 下划线式 | `text-brand border-brand` |
| 政策筛选 | 又一种变体 | 不同的颜色和间距 |

**统计卡片**：

| 页面 | 组件 | 风格 |
|------|------|------|
| 首页 | `StatCard variant="filled"` | 彩色背景 + 图标 |
| Dashboard | `CardCompact` | 白底描边 + 灰色图标 |
| 企业详情 | 自定义 div | 又一种样式 |

**deer-flow 的做法**：全局统一的 Tab 组件（Radix Tabs + CVA），统一的 Card 组件，不同页面不会出现风格漂移。

#### 问题五：内容布局缺乏节奏 — 「等距堆砌」

```tsx
// 首页布局
<div className="page-container space-y-4">
  [统计卡片 grid-cols-4 gap-3]
  [今日重点 grid-cols-3 gap-3]
  [场景入口 grid-cols-4 gap-3]
  [AI 动态 divide-y]
</div>
```

全程 `space-y-4`（16px）+ `gap-3`（12px），没有节奏变化。

**对比 deer-flow**：
- 主内容区 `my-3 mr-3`（12px 边距）
- 内部区块之间有不同的间距层级
- 重要区域前后留白更大，次要区域更紧凑

**缺失的节奏感**：
- 没有「呼吸感」— 重要区块前后应有更大留白
- 没有「分组感」— 相关内容应紧凑，不相关内容应拉开
- 没有「收束感」— 页面底部草草收尾 `<div className="h-4" />`

#### 问题六：细节粗糙 — 「廉价感」来源

| 问题 | 代码 | 为什么显得廉价 |
|------|------|---------------|
| 内联 style 拼接 hex | `style={{ background: \`${s.accentColor}12\` }}` | 颜色不受 Token 控制，无法统一调整 |
| 字号突破 Token | `text-[10px]`（企业详情） | 破坏排版系统，显得随意 |
| 生硬渐变 | `bg-gradient-to-r from-blue-50 to-white` | 过渡不自然，像 PPT 背景 |
| 2px 小圆点做状态指示 | `w-2 h-2 rounded-full bg-red-500` | 太小，信息传达力弱 |
| 企业 Logo 纯色块 | `bg-blue-600 text-white text-2xl font-bold` | 无过渡、无质感，像占位符 |
| 进度条硬编码色 | `backgroundColor: dim.score >= 80 ? '#10b981' : ...` | 三元运算 + hex，不可维护 |
| 混用 Tailwind 原生色 | `text-slate-500` 与 `text-text-secondary` 并存 | 两套色彩系统打架 |

---

## 三、重构方案（结合 Skills 方法论）

### 3.1 设计方向校准（frontend-design skill）

**当前 DFII 评分**：

| 维度 | 得分 | 说明 |
|------|------|------|
| Aesthetic Impact | 2/5 | 无记忆点，截图去 logo 无法辨认 |
| Context Fit | 4/5 | 克制风格适合 ToG |
| Implementation Feasibility | 4/5 | 技术栈支撑 |
| Performance Safety | 4/5 | 无重型效果 |
| Consistency Risk | 2/5 | 执行严重不一致 |

**DFII = (2+4+4+4) − 2 = 12**，但 Aesthetic Impact 和 Consistency Risk 是致命短板。

**重构后目标**：

```
美学定位：Precision Utilitarian（精密实用主义）
与 deer-flow 的关系：共享同一套视觉语言的「数据密集型」变体
差异化锚点：信息密度 + 数据仪表感 — 像精密仪表盘，而非聊天界面

记忆点：
- deer-flow 是「对话驱动」— 大面积留白，聚焦输入
- vibe-chj-demo 是「数据驱动」— 紧凑布局，聚焦指标和行动
- 两者共享色彩、圆角、阴影、字体等基础 DNA
```

### 3.2 视觉基础对齐 deer-flow（visual-design-foundations + design-system-patterns skill）

#### 3.2.1 背景与层次重建

```
当前：白底 + 白卡 + 极轻阴影 = 平面
目标：灰底 + 白卡 + 中等阴影 = 层次

修改：
  --color-bg-primary:    #FFFFFF → #F4F5F7（对齐 deer-flow 的 app-background）
  --color-bg-card:       #FFFFFF（保持，白卡在灰底上自然浮起）
  --shadow-card:         → 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)
  --shadow-card-hover:   → 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)
```

这一个改动就能让整个应用的层次感跳升一个台阶。

#### 3.2.2 色彩收敛

```
当前：蓝/绿/紫/橙/红/琥珀 6+ 种强调色
目标：蓝 + 灰 为主，语义色仅用于状态

规则：
  ✅ 品牌蓝 #3370FF — 主操作、链接、选中态
  ✅ 中性灰阶 — 所有非操作性信息
  ✅ 语义色（绿/黄/红）— 仅用于成功/警告/错误状态指示
  ❌ 不再为不同模块分配不同强调色
  ❌ 不再用彩色背景做统计卡片
  ❌ 不再用 hex 拼接 alpha

场景入口改造：
  当前：4 个模块 4 种颜色
  目标：统一使用品牌蓝做图标色，用内容（文字+数字）区分模块

统计卡片改造：
  当前：4 种彩色背景
  目标：白底 + 品牌蓝数字 + 灰色图标（对齐 deer-flow 的克制风格）
```

#### 3.2.3 圆角对齐

```
对齐 deer-flow 的 4 级体系：
  --radius-sm:  4px   （标签、小按钮）
  --radius:     6px   （输入框、普通按钮）
  --radius-md:  8px   （大按钮、弹层按钮）
  --radius-lg:  12px  （卡片、弹层、面板）

删除：
  --radius-xs: 4px（与 sm 重复）
  --radius-xl: 12px（与 lg 合并）
  
规则：
  卡片 → rounded-lg (12px)
  按钮 → rounded-md (8px)
  标签 → rounded-sm (4px)
  输入框 → rounded (6px)
  头像 → rounded-full
```

#### 3.2.4 排版层级强化

```
对齐 deer-flow 的排版体系：

页面标题（H0）：20px / 28px / semibold  ← 当前 text-lg(18px) 太小
区块标题（H1）：16px / 24px / medium
卡片标题（H2）：14px / 20px / medium
正文（Body1）：  14px / 22px / regular
辅助（Body2）：  12px / 18px / regular
标注（Body3）：  11px / 16px / regular   ← 最小字号，不再出现 10px

关键修改：
  首页问候 text-lg → text-xl（20px），拉开与下方内容的层级
  「今日重点」标题 text-sm → text-base（16px），提升行动项权重
  场景入口数字 text-xl → text-lg（18px），降低数字的视觉抢占
```

#### 3.2.5 间距节奏化

```
当前：全程 space-y-4 + gap-3，无变化
目标：按内容关系建立间距层级

区块间距（不相关内容之间）：24px（space-y-6）
组内间距（相关内容之间）：  12px（gap-3）
元素间距（同一组件内部）：  8px（gap-2）

首页布局改造：
  [头部问候]                    ← mb-6（与下方拉开）
  [统计卡片]                    ← mb-6
  [今日重点]                    ← mb-6（重要区块前后大留白）
  [场景入口 + AI 动态]          ← gap-3（相关内容紧凑）
```

### 3.3 功能层级重建

#### 3.3.1 首页视觉动线重设计

```
理想动线：
  ① 问候语 + 今日概览（我是谁，今天什么情况）
  ② 今日重点（我现在应该做什么）
  ③ 场景入口（我要去哪里做）
  ④ AI 动态（系统帮我做了什么）

实现手段：
  ① 问候区：字号最大（20px），独占一行，下方紧跟概览数字
  ② 今日重点：视觉权重第二高，卡片用品牌蓝左边框强调
  ③ 场景入口：中等权重，图标 + 文字为主，数字退为辅助
  ④ AI 动态：最低权重，紧凑列表，灰色调
```

#### 3.3.2 Dashboard 层级优化（kpi-dashboard-design skill）

```
当前问题：
  - 4 个 Tab 各 4-8 个指标，无主次
  - KPI 数字和漏斗数字同级，信息过载

目标：
  每个 Tab 的视觉层级：
  ① Headline KPI（2-3 个）：大字号 + 趋势箭头，占据视觉中心
  ② 趋势图表：中等权重，辅助理解趋势
  ③ 明细数据：小字号，紧凑排列，按需展开

  Tab 本身统一为一种形态（对齐 deer-flow 的 Tabs 组件）
```

#### 3.3.3 企业详情层级优化

```
当前问题：
  - 头部 Logo 区粗糙（纯色块 + 首字）
  - 核心指标区 4 列均等，无焦点
  - 8 个 Tab 在视觉上无主次

目标：
  ① 头部：企业名称最大，Logo 用渐变或更精致的处理
  ② 核心指标：突出 1 个关键分数（如综合评分），其余退为辅助
  ③ Tab：前 3 个为主要 Tab（AI 分析、基本信息、财务），后 5 个为次要
```

### 3.4 视觉一致性统一

#### 3.4.1 Tab 组件统一

```
全局统一为一种 Tab 形态（对齐 deer-flow）：

形态：下划线式（最克制、最专业）
激活态：text-brand + 2px 底部线
未激活：text-text-secondary + 无底线
hover：text-text-primary

所有页面（Dashboard、企业详情、政策筛选等）统一使用。
引入 shadcn/ui 的 Tabs 组件，通过 CVA 管理变体。
```

#### 3.4.2 统计卡片统一

```
全局统一为一种 StatCard：

形态：白底 + 轻边框 + 品牌蓝数字
图标：灰色（text-text-muted），不用彩色
数字：text-2xl font-bold text-text-primary（不用彩色）
标签：text-xs text-text-secondary
趋势：绿色上箭头 / 红色下箭头（仅此处用语义色）

所有页面（首页、Dashboard、企业详情）统一使用。
```

#### 3.4.3 颜色使用规则

```
强制规则（消除混用）：

✅ 使用 Token 类：text-text-primary, text-text-secondary, text-text-muted
❌ 禁用 Tailwind 原生色：text-slate-500, text-gray-600, bg-slate-50

✅ 使用 Token 类：bg-surface-card, bg-surface-secondary, border-line
❌ 禁用 Tailwind 原生色：bg-white, bg-slate-50, border-slate-100

✅ 语义色仅用于状态：text-success, text-warning, text-error
❌ 禁用语义色做装饰：bg-emerald-50/80, text-violet-600
```

### 3.5 动效体系建立（interaction-design skill）

不追求花哨，追求**「有意义的反馈」**，与 deer-flow 保持同一克制水平。

```
Layer 0: CSS Transitions（所有交互元素的基础）
  hover 状态：150ms ease
  active 状态：scale(0.98) 100ms
  卡片浮起：translateY(-1px) + shadow 加深 200ms

Layer 1: 入场动画（首次渲染时）
  页面内容：opacity 0→1 + translateY(8px→0)，300ms
  列表项：stagger 入场，每项延迟 30ms
  数字：从 0 滚动到目标值，600ms

Layer 2: 状态切换（用户操作后）
  Tab 内容：opacity 切换，200ms
  筛选结果：fade + slide，250ms

不做：
  ❌ 页面路由过渡（Next.js App Router 不好做，且 deer-flow 也没做）
  ❌ 复杂编排动画（不是营销页）
  ❌ 持续循环动画（除 skeleton 外）
```

### 3.6 与 deer-flow 不冲突的差异化

```
共享 DNA（必须对齐）：
  ├── 色彩：蓝 + 灰，克制
  ├── 圆角：4/6/8/12 四级
  ├── 阴影：柔和、有层次
  ├── 字体：SF Pro / PingFang SC 系统
  ├── 间距：4px 基准
  └── 组件：shadcn/ui 体系

允许的差异（数据密集型场景特有）：
  ├── 信息密度更高（deer-flow 是对话型，留白多；驾驶舱是数据型，紧凑）
  ├── 表格和数据网格更多
  ├── 图表占比更大
  ├── 统计卡片是核心元素（deer-flow 没有）
  └── 导航是底部 Tab（deer-flow 是侧边栏）

绝对不做（避免 AI 感）：
  ├── 紫蓝渐变背景
  ├── 发光效果（glow）
  ├── 漂浮装饰元素
  ├── 过度的 glassmorphism
  ├── 彩虹色图标
  └── 「AI 推荐」「智能分析」等花哨标签样式
```

---

## 四、具体改造清单

### Phase 1：视觉基础重建（1.5 天）

**效果：从「原型」升级到「产品」**

| # | 改造项 | 具体操作 | 影响范围 |
|---|--------|---------|---------|
| 1 | 页面背景改灰 | `--color-bg-primary: #FFFFFF` → `#F4F5F7` | 全局 |
| 2 | 卡片阴影加重 | `--shadow-card` 升级为 `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)` | 全局 |
| 3 | 消除硬编码颜色 | 全局搜索 `#3370FF`/`#10B981`/`slate-` 等，替换为 Token | ~40 处 |
| 4 | 色彩收敛 | 统计卡片、场景入口去掉多色，统一品牌蓝 + 灰 | 首页 |
| 5 | 圆角对齐 | 收敛为 4/6/8/12 四级，删除 xs/xl | 全局 |
| 6 | 排版层级 | 页面标题 → 20px，区块标题 → 16px，禁用 10px | 全局 |
| 7 | 间距节奏化 | 区块间 24px，组内 12px，元素内 8px | 全局 |

### Phase 2：组件一致性统一（1.5 天）

**效果：从「拼凑」升级到「体系」**

| # | 改造项 | 具体操作 |
|---|--------|---------|
| 1 | Tab 统一 | 引入 shadcn/ui Tabs，全局统一为下划线式 |
| 2 | 统计卡片统一 | 重构 StatCard，白底 + 蓝数字 + 灰图标，全局使用 |
| 3 | 返回头部统一 | 新建 BackHeader 组件，替代 15+ 处重复代码 |
| 4 | 进度条组件化 | 新建 ProgressBar，替代所有内联 style width |
| 5 | 渐变去除 | `from-blue-50 to-white` 改为纯色 `bg-surface-secondary` |
| 6 | 企业 Logo 优化 | 纯色块 → 带微渐变的圆角方块 + 更精致的字体处理 |
| 7 | 状态指示优化 | 2px 小圆点 → Tag 组件或更大的状态标记 |

### Phase 3：功能层级与动线优化（1 天）

**效果：从「堆砌」升级到「引导」**

| # | 改造项 | 具体操作 |
|---|--------|---------|
| 1 | 首页动线重排 | 问候区放大 → 今日重点提权 → 场景入口降权 → AI 动态压缩 |
| 2 | Dashboard 层级 | 每 Tab 突出 2-3 个 Headline KPI，其余退为辅助 |
| 3 | 企业详情焦点 | 头部突出综合评分，核心指标区打破均等分割 |
| 4 | 巨型组件拆分 | enterprises/[id] 866行 → 8 个 Tab 文件；dashboard 577行 → 4 个 Tab 文件 |
| 5 | 内容节奏 | 重要区块前后加大留白，相关内容紧凑，不相关拉开 |

### Phase 4：动效与质感打磨（1 天）

**效果：从「死板」升级到「灵动」**

| # | 改造项 | 具体操作 |
|---|--------|---------|
| 1 | 卡片 hover | `translateY(-1px)` + shadow 加深 + 200ms |
| 2 | 按钮反馈 | `active:scale-[0.98]` + 100ms |
| 3 | 列表入场 | stagger fadeIn，每项 30ms 延迟 |
| 4 | 数字滚动 | 统计数字从 0 滚动到目标值 |
| 5 | Tab 切换 | 内容区 fade 过渡 200ms |
| 6 | 图表统一 | ChartWrapper 统一 tooltip/legend/配色 |
| 7 | 空状态 | EmptyState 加入精致 SVG 插图 |

---

## 五、改造前后对比预期

### 5.1 首页

```
改造前：
  白底 → 白卡（无层次）
  4 色统计卡 + 4 色场景入口（彩虹）
  全程 space-y-4（无节奏）
  无动效（死板）

改造后：
  灰底 → 白卡 + 阴影（层次分明）
  品牌蓝 + 灰（克制专业）
  区块间 24px / 组内 12px（有节奏）
  卡片 hover 浮起 + 数字滚动（灵动）
```

### 5.2 Dashboard

```
改造前：
  Pill Tab + CardCompact（与首页不统一）
  KPI 和漏斗同级（信息过载）
  进度条硬编码色（不可维护）

改造后：
  统一下划线 Tab
  Headline KPI 突出 + 辅助指标退后
  ProgressBar 组件 + Token 色（一致性）
```

### 5.3 企业详情

```
改造前：
  纯色块 Logo（粗糙）
  4 列均等指标（无焦点）
  下划线 Tab 与 Dashboard Pill Tab 不统一
  866 行单文件（不可维护）

改造后：
  精致 Logo 处理（微渐变 + 阴影）
  综合评分突出 + 辅助指标退后
  统一 Tab 形态
  8 个独立 Tab 文件
```

---

## 六、Skill 使用指南（执行时参考）

| 我在做什么 | 读哪个 Skill | 用它做什么 |
|-----------|-------------|-----------|
| 调整背景/阴影/色彩基础 | **visual-design-foundations** | 色彩对比度、间距网格、排版阶梯 |
| 重构 Token 体系 | **design-system-patterns** | 三层 Token 架构、CVA variant、主题切换 |
| 统一组件风格 | **web-component-design** | 组件 API 设计、Compound Component、forwardRef |
| 加动效 | **interaction-design** | 时间规范、Framer Motion 代码模式、easing 函数 |
| 优化 Dashboard | **kpi-dashboard-design** | 指标层级、图表选择、布局模式 |
| 校验设计方向 | **frontend-design** | DFII 评分、差异化锚点、反模式检查 |
| 做暗色主题（未来） | **frontend-ui-dark-ts** | 暗色 Token、glassmorphism、滚动条 |
| 移动端适配 | **responsive-design** | Container Queries、流式排版、触摸目标 |

**Skill 协作链路**：

```
frontend-design        → 定方向（精密实用主义，反 AI 味）
       ↓
visual-design-foundations → 定基础（背景灰、阴影重、色彩收敛）
       ↓
design-system-patterns    → 定体系（Token 对齐 deer-flow、CVA）
       ↓
web-component-design      → 定组件（Tab/StatCard/BackHeader 统一）
       ↓
interaction-design        → 定动效（hover/enter/number 三层）
       ↓
kpi-dashboard-design      → 定看板（层级、图表、布局）
```

---

## 七、工作量与优先级

| 阶段 | 工作量 | 视觉提升 | 是否必做 |
|------|--------|---------|---------|
| Phase 1: 视觉基础 | 1.5 天 | **50%** | 必做 — 这是最大的杠杆点 |
| Phase 2: 组件统一 | 1.5 天 | **25%** | 必做 — 消除「拼凑感」 |
| Phase 3: 层级优化 | 1 天 | **15%** | 建议做 — 提升专业感 |
| Phase 4: 动效打磨 | 1 天 | **10%** | 可选 — 锦上添花 |
| **合计** | **5 天** | **100%** | |

**如果只有 3 天**：做 Phase 1 + Phase 2，获得 75% 的提升。

**Phase 1 中最关键的一步**：把 `--color-bg-primary` 从 `#FFFFFF` 改成 `#F4F5F7`。这一行 CSS 改动就能让整个应用的层次感跳升一个档次。

---

*分析日期：2026-03-04*
*适用项目：vibe-chj-demo（漕河泾智能驾驶舱）*
*对齐基准：north-deer-flow 设计语言*
*分析依据：deer-flow 代码审计 × vibe-chj-demo 全量审计 × 9 个 .cursor/skills*
