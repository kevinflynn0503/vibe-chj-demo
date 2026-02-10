# Phase 3：产品方案设计

> 输入：结构化需求 + 数据现状 + 平台能力
> 输出：产品功能架构、App/Agent/工具/工作空间/数据接入设计、产品需求池
> 时间：Day 5-7

## 核心原则

把业务需求翻译成平台语言。不是画线框图，而是设计一套可以在小北驾驶舱上实现的方案。

## 六维度设计

### 1. App 设计

每个场景 → 一个 north-app。使用模板 `templates/app-design-spec.md`。

关键约束（来自 `skills/north-app/SKILL.md`）：
- Next.js 14 + App Router
- @north/design + shadcn/ui + Tailwind
- TypeScript 严格模式
- SDK Context 框架

### 2. Agent 设计

使用模板 `templates/agent-design-spec.md`。
参考 `skills/agent-design/SKILL.md`。

### 3. 工具设计

- 复用小北哪些现有工具（supabase_tool, researcher_agent, feishu_agent...）
- 需要新增什么工具
- 参考 `references/platform-capabilities.md`

### 4. 工作空间设计

参考 `skills/workspace-design/SKILL.md`。

### 5. 数据接入设计

使用模板 `templates/data-integration-plan.md`。

### 6. 产品需求池

使用模板 `templates/product-requirement-pool.csv`。
从用户需求 → 产品功能点的映射。

## 输出

```
docs/03-产品设计/
├── 产品功能架构.md
├── 产品需求池.csv
├── App设计/
│   ├── [场景1]App.md
│   └── ...
├── Agent设计/
│   ├── [Agent1].md
│   └── ...
├── 工作空间设计/
│   └── 各场景工作空间.md
└── 数据接入方案.md
```

## HITL 交互

FDE 花半天审查所有产出 → 提修改 → AI 修改 → FDE 确认 → 进 Phase 4。
