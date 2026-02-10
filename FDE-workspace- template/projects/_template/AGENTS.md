# [客户名] 驾驶舱项目

你正在帮 FDE 交付 [客户名] 的智能驾驶舱系统。

## 每次会话

1. 读本项目的 `MEMORY.md` — 项目在什么阶段、做到哪了
2. 读 `memory/` 里最近的日记 — 昨天和今天做了什么
3. 看 MEMORY.md 里的"当前阶段"，从那里继续

## 项目阶段

| Phase | 名称 | 输入 | 输出 | 天数 | 主要技能 |
|-------|------|------|------|------|---------|
| 1 | 需求分析 | `docs/01-客户资料/` | `docs/02-需求分析/` | Day 1-2 | product |
| 2 | 需求结构化 | 澄清结果 | 需求池终版 + 场景分析 | Day 3-4 | product |
| 3 | 产品设计 | 结构化需求 | `docs/03-产品设计/` | Day 5-7 | product + agent-design + workspace-design |
| 4 | 静态 Demo | App 设计方案 | `apps/`（mock 数据） | Day 8-10 | product + north-app |
| 5 | App 开发 | 确认的 Demo | `apps/`（真实数据） | Day 11-16 | north-app |
| 6 | 数据+Agent | App + 数据源 | `workspaces/` + 完整应用 | Day 17-20 | north-app + workspace-design + agent-design |

## 核心规则

### 你不直接面对客户

- 你的输出经过 FDE 审查后才给客户
- 需要客户确认的事 → 生成问题清单（带选择项），让 FDE 去问

### 阶段门控

- 每个 Phase 完成后："Phase X 完成，产出在 xxx，请确认"
- FDE 说"确认"→ 进下一个
- FDE 说"改"→ 修改，不进下一个
- **不要自行进入下一阶段**

### 不确定时主动标出

- 主动列出你不确定的 3-5 个点
- 让 FDE 重点审查这几个，降低审查成本

### Demo 是 App 的骨架

- 新建 App 必须从 `../../skills/north-app/app-template/` 复制
- Demo 和 App 完全相同架构（Next.js + @north/design + Tailwind + TypeScript）
- Mock 数据结构和 Supabase schema 一致
- 技术约束参考 `../../skills/north-app/SKILL.md`

### 文件规范

| 内容 | 放在哪里 |
|------|---------|
| 客户资料、会议纪要 | `docs/01-客户资料/` |
| 需求分析、需求池 | `docs/02-需求分析/` |
| 产品设计、App/Agent 方案 | `docs/03-产品设计/` |
| App 代码 | `apps/` |
| Agent 工作空间 | `workspaces/` |

## 写下来

每次完成重要工作 → `memory/YYYY-MM-DD.md`
阶段变化、重要决策、客户反馈 → `MEMORY.md`
文件就是你的记忆，不写就会忘。
