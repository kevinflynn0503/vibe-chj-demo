# Vibe FDE 工作空间

> 一个 FDE + AI = 一支队伍，20 个工作日交付一个 ToG 驾驶舱项目

## 快速开始

```bash
# 1. 打开工作空间
cursor .
# 或
claude

# 2. 新建项目
cp -r projects/_template projects/漕河泾-驾驶舱

# 3. 告诉 AI
# "初始化漕河泾项目，客户是漕河泾开发区管委会"
```

## 工作空间结构

```
FDE-workspace/
├── AGENTS.md              # FDE 工作空间总规则
├── CLAUDE.md              # Claude Code 适配
├── MEMORY.md              # FDE 个人记忆（跨项目）
├── memory/                # FDE 日记（跨项目）
│
├── skills/                # ★ 共享方法论（所有项目通用）
│   ├── product/           # AI 产品经理
│   ├── north-app/         # 平台开发
│   │   └── app-template/  # App 脚手架模板
│   ├── workspace-design/  # 工作空间设计
│   ├── agent-design/      # Agent 组件设计
│   ├── workflow-context/  # 工作流状态机
│   ├── skill-creation/    # Skill 创建
│   └── parallel-dispatch/ # 并行调度
│
├── projects/              # ★ 所有客户项目
│   ├── _template/         # 项目模板
│   │   ├── AGENTS.md      # 项目级规则
│   │   ├── MEMORY.md      # 项目级记忆
│   │   ├── memory/        # 项目日记
│   │   ├── docs/          # 产品文档
│   │   │   ├── 01-客户资料/
│   │   │   ├── 02-需求分析/
│   │   │   ├── 03-产品设计/
│   │   │   └── 04-进度/
│   │   ├── apps/          # App 代码
│   │   └── workspaces/    # Agent 工作空间
│   │
│   ├── 漕河泾-驾驶舱/     # 项目实例 A
│   └── 张江-驾驶舱/       # 项目实例 B
│
└── .cursor/rules/         # Cursor IDE 条件激活规则
    ├── project-context.mdc    # alwaysApply
    ├── phase-skills.mdc       # projects/*/docs/** 触发
    ├── app-development.mdc    # projects/*/apps/** 触发
    └── agent-workspace.mdc    # projects/*/workspaces/** 触发
```

## 核心概念

### 两层结构

| 层级 | 说明 | 例子 |
|------|------|------|
| **FDE 层** | 跨项目的方法论和个人记忆 | skills/, 根 MEMORY.md |
| **项目层** | 单个客户的所有数据 | projects/xxx/ 下的 docs/, apps/, workspaces/ |

### skills/ 是共享的，projects/ 是隔离的

- `skills/` 包含方法论，所有项目通用，不要在项目中修改
- `projects/[项目名]/` 包含该客户的全部数据，项目间互不干扰

### 新建项目

```bash
cp -r projects/_template projects/[客户名]-驾驶舱
# AI 初始化：替换 [客户名] 占位符
```

### 新建 App

```bash
cp -r skills/north-app/app-template projects/[项目名]/apps/[app-name]
# 修改 basePath、appId、表名等占位符
```

## 六阶段工作流

| Phase | 名称 | 天数 | 主要技能 |
|-------|------|------|---------|
| 1 | 需求分析 | Day 1-2 | product |
| 2 | 需求结构化 | Day 3-4 | product |
| 3 | 产品设计 | Day 5-7 | product + agent-design + workspace-design |
| 4 | 静态 Demo | Day 8-10 | product + north-app |
| 5 | App 开发 | Day 11-16 | north-app |
| 6 | 数据+Agent | Day 17-20 | north-app + workspace-design + agent-design |

## 工具兼容性

| 工具 | 加载方式 |
|------|---------|
| Cursor | 读 AGENTS.md + `.cursor/rules/*.mdc` 条件激活 |
| Claude Code | 读 CLAUDE.md → 引用 AGENTS.md |
| GitHub Copilot | 直接读 AGENTS.md |
