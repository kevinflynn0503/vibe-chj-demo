---
name: workflow-context
description: 工作流状态机与上下文管理。管理多阶段项目的检查点、状态恢复、三文件持久化、上下文传递。适用于完整产品开发、需要阶段确认的项目、长时间跨会话任务时。
---

# 工作流与上下文管理

管理多阶段项目的工作流状态和跨会话上下文。

---

## 快速导航

| 指南 | 说明 |
|------|------|
| [状态持久化](guides/state-persistence.md) | 三文件模式详解 |
| [阶段转换](guides/phase-transition.md) | 阶段定义与转换规则 |
| [错误恢复](guides/error-recovery.md) | 中断恢复与错误处理 |
| [上下文工程](guides/context-engineering.md) | 上下文栈、压缩、JIT 检索 |

---

## 一、三文件状态管理

每个项目通过三个文件实现跨会话持久化：

```
.claudedocs/
├── task_plan.md      # 任务计划与进度
├── notes.md          # 笔记与发现
└── deliverable.md    # 最终交付物索引
```

### task_plan.md - 任务计划

跟踪阶段和进度。每个阶段完成后更新。

```markdown
# 任务计划

## Workflow 配置
- 执行模式: automatic | interactive
- 状态: running | paused | completed | failed

## 用户需求
{USER_INPUT}

## 当前阶段
{CURRENT_PHASE}

## 阶段进度
- [ ] Phase 0: 需求探索（brainstorming）
- [ ] Phase 1: 需求澄清（product）
- [ ] Phase 2: 产品设计（design）
- [ ] Phase 3: 架构设计（development）
- [ ] Phase 4: 开发实现
- [ ] Phase 5: 测试验证
- [ ] Phase 6: 交付部署

## 已做决策
- {决策}: {理由}

## 遇到的错误
- {错误}: {解决方案}
```

### notes.md - 项目笔记

存储研究发现和中间产出。研究过程中更新。

### deliverable.md - 交付物索引

记录最终交付物。工作流完成时更新。

---

## 二、工作流阶段

### 阶段结构

```
Phase 0: 需求探索 (brainstorming)
    |
Phase 1: 需求澄清 (product)
    | [检查点: PRD 确认]
Phase 2: 产品设计 (design)
    |
Phase 3: 架构设计 (development)
    | [检查点: 架构确认]
Phase 4: 开发实现
    |
Phase 5: 测试验证
    |
Phase 6: 交付部署
    | [检查点: 最终确认]
完成
```

### 每个阶段的输入输出

| 阶段 | 使用技能 | 输入 | 输出 |
|------|---------|------|------|
| 0 | Product | 用户需求 | phase0-design.md |
| 1 | Product | phase0-design.md | product-result.md (PRD) |
| 2 | Design | PRD | design-result.md |
| 3 | Development | PRD + 设计稿 | architecture.md |
| 4 | Development | 所有前期文档 | 源代码 |
| 5 | Development | 源代码 | 测试报告 |
| 6 | Development | 所有产出 | 部署文档 |

---

## 三、执行模式

### 自动模式

```yaml
mode: automatic
skipCheckpoints: true
autoApprove: true
pauseOnError: true
```

跳过所有确认，自动批准。适合快速原型。

### 交互模式

```yaml
mode: interactive
skipCheckpoints: false
autoApprove: false
pauseOnError: true
```

在检查点暂停等待确认。适合重要项目。

---

## 四、检查点机制

检查点是阶段间的确认门。交互模式下必须通过。

```
确认提示: 请确认 {阶段产出}

选项:
  - 批准: 进入下一阶段
  - 修改: 根据反馈调整后重新确认
  - 重做: 返回上一阶段
  - 终止: 停止工作流
```

默认检查点位置: Phase 1（PRD）、Phase 3（架构）、Phase 6（最终）。

---

## 五、恢复机制

### 检测现有工作流

每次新会话开始时：

```
如果 task_plan.md 存在:
  1. 读取当前阶段和进度
  2. 跳转到下一未完成阶段
  3. 显示恢复消息

如果 task_plan.md 不存在:
  1. 创建新的任务计划
  2. 从 Phase 0 开始
```

### 错误恢复选项

```
遇到错误时:
  - 重试当前阶段
  - 跳过当前阶段
  - 返回上一阶段
  - 终止工作流
```

详见 [guides/error-recovery.md](guides/error-recovery.md)

---

## 六、上下文传递规则

### 阶段间上下文

每个阶段开始前，必须读取所有前期输出：

```
Phase 1 读取: phase0-design.md
Phase 2 读取: phase0-design.md + product-result.md
Phase 3 读取: 所有前期文档
Phase 4 读取: 所有前期文档 + task_plan.md
```

### 核心操作规则

| 时机 | 操作 |
|------|------|
| 每次重要操作前 | 读取 task_plan.md（刷新目标） |
| 每个阶段完成后 | 更新 task_plan.md（标记 [x]） |
| 存储大量信息时 | 写入 notes.md（不塞满上下文） |
| 决策时 | 先阅读计划文件，确保一致性 |

### 反模式

| 不要 | 应该 |
|------|------|
| 用内存做持久化 | 创建 task_plan.md |
| 目标说一次就忘 | 每次决策前重读计划 |
| 隐藏错误重试 | 记录错误到计划文件 |
| 所有内容塞上下文 | 大内容存文件 |
| 跳过前期文档 | 始终读取前期输出 |

---

## 何时使用

**使用本技能**:
- 多步骤任务（3 步以上）
- 研究型任务
- 构建/创建类任务
- 跨多个工具调用的任务
- 需要阶段确认的项目

**跳过**:
- 简单问题
- 单文件编辑
- 快速查询

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 2.0.0 | 2026-02-09 | 合并 workflow-engine + context 为统一技能 |
| 1.0.0 | 2026-01-27 | 初始版本（分离的两个技能） |
