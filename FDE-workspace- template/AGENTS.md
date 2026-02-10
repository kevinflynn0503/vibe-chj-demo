# FDE 工作空间

你是 FDE 的 AI 搭档。我们一起使用 Vibe FDE 方法论为 ToG 客户交付智能驾驶舱系统。

## 每次会话

1. 读 `MEMORY.md` — FDE 当前在做哪些项目
2. 确认要操作哪个项目 → 进入 `projects/[项目名]/`
3. 读项目的 `AGENTS.md` 和 `MEMORY.md` — 项目在什么阶段
4. 读项目的 `memory/` 里最近的日记 — 昨天做了什么
5. 从那里继续

## 工作空间结构

```
FDE-workspace/
├── AGENTS.md              # ← 你在这里（FDE 级别）
├── MEMORY.md              # FDE 个人记忆（跨项目）
├── memory/                # FDE 日记（跨项目）
│
├── skills/                # ★ 共享方法论（所有项目通用）
│   ├── product/           # AI 产品经理（六阶段 ToG 工作流）
│   ├── north-app/         # 平台开发（含 app-template/ 脚手架）
│   ├── workspace-design/  # 工作空间设计（三件套）
│   ├── agent-design/      # Agent 组件设计
│   ├── workflow-context/  # 工作流状态机
│   ├── skill-creation/    # Skill 创建
│   └── parallel-dispatch/ # 并行调度
│
├── projects/              # ★ 所有客户项目
│   ├── _template/         # 新项目模板（cp 到新项目）
│   ├── 漕河泾-驾驶舱/     # 项目实例
│   │   ├── AGENTS.md      # 项目级 AI 规则
│   │   ├── MEMORY.md      # 项目级记忆
│   │   ├── memory/        # 项目日记
│   │   ├── docs/          # 产品文档
│   │   ├── apps/          # App 代码
│   │   └── workspaces/    # Agent 工作空间
│   └── 张江-驾驶舱/       # 另一个项目
│
└── .cursor/rules/         # Cursor IDE 规则
```

## 技能

方法论在 `skills/` 目录。按需读取，不要一次性全部加载。

| 技能 | 路径 | 什么时候用 |
|------|------|----------|
| AI 产品经理 | `skills/product/SKILL.md` | Phase 1-3 需求分析、产品设计 |
| 平台开发 | `skills/north-app/SKILL.md` | Phase 4-6 Demo 搭建、App 开发 |
| 工作空间设计 | `skills/workspace-design/SKILL.md` | Phase 3 + 6 设计 Agent 工作空间 |
| Agent 设计 | `skills/agent-design/SKILL.md` | Phase 3 + 6 设计 Agent 组件 |
| 工作流管理 | `skills/workflow-context/SKILL.md` | 阶段管理和上下文持久化 |

## 新建项目

```bash
cp -r projects/_template projects/[客户名]-驾驶舱
```

然后告诉 AI："初始化 [客户名] 项目"，AI 会替换占位符。

## 新建 App

在项目内新建 App 时，从 `skills/north-app/app-template/` 复制脚手架：

```bash
cp -r skills/north-app/app-template projects/[项目名]/apps/[app-name]
```

## 核心规则

- 不直接面对客户，输出经 FDE 审查后才给客户
- 阶段切换必须 FDE 显式确认
- 不确定的点主动标出
- 问题清单必须带选择项（不是开放性问题）
- 项目数据严格隔离在 `projects/[项目名]/` 中
- skills/ 是共享方法论，不要在项目中修改

## 写下来

跨项目的重要事项 → 根 `MEMORY.md`
项目特定的内容 → `projects/[项目名]/MEMORY.md`
每日工作 → 对应的 `memory/YYYY-MM-DD.md`
