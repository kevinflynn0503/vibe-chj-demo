# Phase 6：数据接入 + Agent 联调

> 输入：App + 外部数据源
> 输出：完整可用的驾驶舱应用
> 时间：Day 17-20

## 执行步骤

### 1. 接入外部数据

- 企业数据库 → Supabase（批量导入 / API 同步）
- 飞书 API → 妙记、日历、任务
- CRM → 客户记录

### 2. 配置 Agent 工作空间

在 `workspaces/[场景名]/` 下创建：

```
workspaces/[场景名]/
├── AGENTS.md              # Agent 行为规则
├── MEMORY.md              # Agent 初始记忆
├── memory/
└── skills/                # 业务技能
    ├── [技能1]/SKILL.md
    └── [技能2]/SKILL.md
```

参考 `skills/workspace-design/SKILL.md` 设计工作空间。

### 3. 联调

- App 发消息 → Agent 处理 → supabase_tool 写数据 → Realtime 更新 App
- 端到端验证每个工作流

### 4. 配置定时任务

- 数据同步（每日/每周）
- 自动报告（走访周报、活跃企业报告）

## HITL 交互

FDE 做端到端测试。模拟真实用户操作，验证完整链路。
