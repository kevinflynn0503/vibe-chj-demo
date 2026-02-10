---
name: workspace-design
description: Agent 工作空间设计。指导如何为 Agent 设计文件系统结构，包括 CSV 数据库、任务管理、记忆系统。适用于创建新的 Agent 工作空间时。
---

# Workspace Design 技能

## 这是什么

这个技能指导你如何为 Agent 设计工作空间。工作空间是 Agent 的"外部大脑"——所有不在对话上下文里的东西，都应该存在这里。

---

## 核心思想

### 为什么需要工作空间？

Agent 的对话上下文是有限的、易失的。工作空间解决三个问题：

| 问题 | 工作空间的解决方案 |
|------|-------------------|
| **遗忘** | 把重要信息写入文件，需要时再读取 |
| **混乱** | 用目录结构组织不同类型的内容 |
| **中断** | 任务状态持久化，随时可以恢复 |

### 三个设计原则

1. **看名字就知道是什么** —— 目录和文件的命名要自解释
2. **用最简单的格式** —— CSV/Markdown/YAML，不用复杂数据库
3. **改变要留痕** —— 用检查点保存状态，便于恢复

---

## 工作空间结构

### 推荐的目录布局

```
/workspace/[项目名]/
│
├── README.md              # 这个空间是做什么的
├── memory/                # 📝 记忆（Agent 需要"记住"的东西）
│   ├── user.csv          # 用户偏好和画像
│   ├── knowledge.csv     # 积累的知识
│   └── history/          # 历史对话摘要
│
├── tasks/                 # ✅ 任务（当前和历史的工作）
│   ├── current.yaml      # 当前正在做的任务
│   ├── backlog.csv       # 待办任务列表
│   └── done/             # 完成的任务存档
│
├── data/                  # 📊 数据（业务相关的结构化数据）
│   ├── [业务]_db.csv     # 业务数据表
│   └── imports/          # 用户上传的原始文件
│
├── outputs/               # 📄 产出（Agent 生成的成果）
│   ├── reports/          # 报告
│   └── documents/        # 文档
│
└── .workspace/            # ⚙️ 系统（Agent 自己用的）
    ├── config.yaml       # 工作空间配置
    └── state.yaml        # 当前状态（可选）
```

### 目录用途速查

| 目录 | 存什么 | 什么时候用 |
|------|--------|-----------|
| `memory/` | 用户信息、积累的知识 | 每次对话都要看 |
| `tasks/` | 任务状态和进度 | 处理任务时 |
| `data/` | 业务数据表 | 需要查询数据时 |
| `outputs/` | 报告、文档等成果 | 任务完成时 |
| `.workspace/` | 配置和快照 | 恢复和配置时 |

---

## 用 CSV 存储数据

### 为什么用 CSV？

- Agent 可以直接读懂（不需要 SQL）
- 人也可以直接看和改（用 Excel 打开）
- Git 可以追踪每一行的变化

### CSV 表的基本规则

每个 CSV 表都应该有这几个字段：

```csv
id,created_at,updated_at,status,[其他业务字段...]
001,2026-01-28,2026-01-28,active,...
```

- `id` —— 唯一标识
- `created_at` —— 创建时间
- `updated_at` —— 最后修改时间
- `status` —— 状态（active/archived/deleted）

### 常用的表

**用户记忆表 `memory/user.csv`**
```csv
id,created_at,updated_at,status,key,value,confidence
001,2026-01-28,2026-01-28,active,language,中文,1.0
002,2026-01-28,2026-01-28,active,style,简洁,0.8
```

**知识库表 `memory/knowledge.csv`**
```csv
id,created_at,updated_at,status,subject,fact,source
001,2026-01-28,2026-01-28,active,XX公司,主营AI芯片,官网
002,2026-01-28,2026-01-28,active,XX公司,2020年成立,工商信息
```

**任务列表 `tasks/backlog.csv`**
```csv
id,created_at,updated_at,status,title,priority,due_date
001,2026-01-28,2026-01-28,pending,调研XX公司,P1,2026-01-30
002,2026-01-28,2026-01-28,active,整理政策,P2,2026-01-31
```

---

## 状态保存

### 核心思路

不需要复杂的版本管理。`tasks/current.yaml` 本身就记录了状态：
- 做到哪一步
- 相关文件
- 笔记

**保持任务文件更新，就能恢复。**

### 需要额外备份吗？

大多数情况不需要。

| 场景 | 做法 |
|------|------|
| 普通任务 | 更新 `tasks/current.yaml` 就够 |
| 长任务 | 可以保存 `.workspace/state.yaml` |

### 简单备份（可选）

```
.workspace/
├── state.yaml          # 当前状态
└── state_backup.yaml   # 上一个状态
```

只保留 2 个文件，更新前先备份。

```yaml
# .workspace/state.yaml
更新时间: 2026-01-28 14:30
当前任务: 调研XX公司
进度: 3/6 步
笔记: 做到技术分析了
```

### 恢复

```
1. 读 tasks/current.yaml
2. 如果丢了，读 .workspace/state.yaml
```

---

## 任务管理

### 当前任务文件 `tasks/current.yaml`

```yaml
# 当前正在执行的任务

任务: 调研XX公司
开始时间: 2026-01-28 09:00
优先级: P1

进度:
  当前步骤: 3
  总步骤: 6
  步骤列表:
    - ✅ 收集基本信息
    - ✅ 分析核心团队
    - 🔄 分析技术能力（进行中）
    - ⏳ 分析商业模式
    - ⏳ 撰写报告
    - ⏳ 最终检查

笔记: |
  - 发现公司刚完成B轮融资
  - 技术团队背景很强

相关文件:
  - data/enterprise_db.csv
  - outputs/reports/XX公司_草稿.md
```

### 任务流转

```
新任务 → tasks/backlog.csv（待办）
         ↓ 开始执行
正在做 → tasks/current.yaml（当前）
         ↓ 完成
已完成 → tasks/done/2026-01/task_001.yaml（归档）
```

---

## 检查点（Checkpoint）

### 什么时候保存检查点？

- 完成一个任务时
- 每工作 1-2 小时
- 遇到错误需要回滚前
- 用户要求暂停时

### 检查点文件 `.workspace/checkpoints/latest.yaml`

```yaml
时间: 2026-01-28 14:30
触发: 自动（2小时）

状态:
  当前任务: 调研XX公司
  当前步骤: 3/6
  待办任务: 2个

上下文摘要: |
  正在分析XX公司的技术能力，已完成基本信息和团队分析。
  下一步是分析商业模式。

恢复指令: |
  1. 读取 tasks/current.yaml 了解任务状态
  2. 读取 outputs/reports/XX公司_草稿.md 了解已写内容
  3. 从"分析技术能力"步骤继续
```

### 从检查点恢复

```
1. 读取 .workspace/checkpoints/latest.yaml
2. 告诉用户当前状态和上次做到哪里
3. 询问是继续还是重新开始
4. 按恢复指令继续工作
```

---

## 记忆管理

### 三种记忆

| 类型 | 存什么 | 文件 |
|------|--------|------|
| **用户记忆** | 偏好、习惯、背景 | `memory/user.csv` |
| **知识记忆** | 学到的事实 | `memory/knowledge.csv` |
| **对话记忆** | 历史对话摘要 | `memory/history/` |

### 什么时候写记忆？

- 用户明确告诉你他的偏好 → 写入 user.csv
- 从调研中发现的事实 → 写入 knowledge.csv
- 对话结束时 → 摘要写入 history/

### 什么时候读记忆？

- 开始新对话时：读 user.csv 了解用户
- 处理相关任务时：读 knowledge.csv 获取已知信息
- 用户提到"之前"时：读 history/ 找相关对话

---

## 实际例子

### 例1：企业研究工作空间

```
/workspace/企业研究/
├── README.md                    # "这是企业研究的工作空间"
├── memory/
│   ├── user.csv                # 用户是谁，喜欢什么风格
│   └── knowledge.csv           # 研究过的企业知识
├── tasks/
│   ├── current.yaml            # 正在调研哪家公司
│   ├── backlog.csv             # 还有哪些公司要调研
│   └── done/                   # 完成的调研
├── data/
│   ├── enterprise_db.csv       # 企业基本信息表
│   ├── policy_db.csv           # 相关政策表
│   └── imports/                # 用户上传的材料
├── outputs/
│   └── reports/                # 一企一策报告
└── .workspace/
    ├── config.yaml
    └── checkpoints/
```

### 例2：日常助理工作空间

```
/workspace/日常助理/
├── README.md
├── memory/
│   ├── user.csv                # 用户画像
│   └── history/                # 对话历史
├── tasks/
│   ├── current.yaml
│   └── backlog.csv             # 待办事项
├── data/
│   └── notes.csv               # 笔记和备忘
└── outputs/
    └── summaries/              # 生成的摘要
```

---

## 快速开始

### 创建新工作空间

```
1. 创建根目录和 README.md
2. 创建基础子目录（memory/, tasks/, data/, outputs/）
3. 初始化空的 CSV 表（只有表头）
4. git init 并提交
5. 创建 .workspace/config.yaml
```

### 每次开始工作

```
1. 读取 memory/user.csv 了解用户
2. 读取 tasks/current.yaml 看有没有进行中的任务
3. 如果有进行中的任务，从上次的步骤继续
4. 如果没有，从 backlog.csv 取下一个任务
```

### 每次结束工作

```
1. 更新 tasks/current.yaml 的进度
2. 如果有新发现，写入 memory/knowledge.csv
3. git commit 保存变更
4. 如果任务完成，移动到 tasks/done/
```

---

## 设计检查清单

设计新工作空间时，问自己这些问题：

- [ ] 目录结构够简单吗？（不超过3层）
- [ ] 命名够直观吗？（看名字就知道是什么）
- [ ] 用 CSV 还是 YAML？（表格用CSV，配置用YAML）
- [ ] 需要保存检查点吗？（长任务要定期保存）
- [ ] Agent 能直接读懂吗？（不需要特殊工具）
- [ ] 人能直接编辑吗？（不需要特殊软件）

---

## 总结

> **文件即记忆，目录即分类，检查点即快照**

- 用文件系统当 Agent 的外部大脑
- 用 CSV 存结构化数据
- 用 YAML 存配置和任务状态
- 用 Markdown 存文档和报告
- 用检查点保存状态，便于恢复

---

## 版本历史

- **v2.0.0**（2026-01-28）：重新设计
  - 简化为实践指南风格
  - 增加 Git 版本管理
  - 精简目录结构
  - 更多实际例子
