---
name: vibe-fde
description: AI 辅助 ToG 项目交付技能库。一个 FDE + AI，20 天交付驾驶舱项目。提供产品经理、平台开发、Agent 设计、工作空间管理等方法论技能。
---

# Vibe FDE 技能库（7 个技能）

## 产品与交付

| 技能 | 路径 | 定位 | Phase 覆盖 |
|------|------|------|-----------|
| **Product** | [skills/product/](product/SKILL.md) | AI 产品经理：六阶段 ToG 工作流 | Phase 1-3 主导，4-6 协同 |
| **North App** | [skills/north-app/](north-app/SKILL.md) | 平台开发（含 development + design） | Phase 4-6 主导 |

## Agent 与工作空间

| 技能 | 路径 | 定位 | Phase 覆盖 |
|------|------|------|-----------|
| **Workspace Design** | [skills/workspace-design/](workspace-design/SKILL.md) | 三件套工作空间设计方法论 | Phase 3 + 6 |
| **Agent Design** | [skills/agent-design/](agent-design/SKILL.md) | Agent / Tool / SubAgent / MCP 设计 | Phase 3 + 6 |

## 流程与调度

| 技能 | 路径 | 定位 | Phase 覆盖 |
|------|------|------|-----------|
| **Workflow Context** | [skills/workflow-context/](workflow-context/SKILL.md) | 工作流状态机 + 上下文持久化 | 贯穿全流程 |
| **Skill Creation** | [skills/skill-creation/](skill-creation/SKILL.md) | 如何写好 SKILL.md | 按需 |
| **Parallel Dispatch** | [skills/parallel-dispatch/](parallel-dispatch/SKILL.md) | 多任务并行调度 | 按需 |

---

## Skill 和 Phase 的对应

```
Phase 1-2       Phase 3           Phase 4          Phase 5-6
需求分析         产品设计           Demo             App+数据+Agent
┌──────────┐   ┌────────────┐    ┌──────────┐     ┌──────────────┐
│ product  │   │ product    │    │ product  │     │ north-app    │
│          │   │ +agent-    │    │ +north-  │     │ +workspace-  │
│          │   │  design    │    │  app     │     │  design      │
│          │   │ +workspace │    │          │     │ +agent-      │
│          │   │  -design   │    │          │     │  design      │
└──────────┘   └────────────┘    └──────────┘     └──────────────┘
```

## 两类 Skill

| 类别 | 位置 | 使用者 |
|------|------|--------|
| **方法论技能** | 本目录 `skills/` | FDE 的 AI 助手（Cursor / Claude Code） |
| **业务技能** | `projects/xxx/workspaces/yyy/skills/` | 客户的 Agent（小北平台） |

方法论技能是工作空间自带的，所有项目共享。
业务技能是项目推进中创建的——Phase 3 设计、Phase 6 实现，放在项目的 `workspaces/` 中。

---

## 版本历史

- **v3.0.0**（2026-02-09）
  - Skills 从 13 个精简至 7 个（development + design + langfuse 合入 north-app）
  - product Skill 完全重写为 ToG 六阶段工作流
  - Skills 从全局共享改为项目内自包含
  - 新增两类 Skill 概念：方法论 vs 业务
