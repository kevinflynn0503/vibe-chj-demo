# Context Engineering 技能 - 上下文工程最佳实践

## 概述

Context Engineering（上下文工程）是构建高质量 AI Agent 的核心能力，它关注的是如何在有限的上下文窗口中，提供最优的 token 配置来引导模型产生期望的行为。

> "Context engineering is the art and science of curating what will go into the limited context window from that constantly evolving universe of possible information." — Anthropic

---

## 一、核心理念

### 1.1 从 Prompt Engineering 到 Context Engineering

| 维度 | Prompt Engineering (v1) | Context Engineering (v2) |
|------|------------------------|-------------------------|
| 关注点 | 单次推理优化 | 多轮交互状态管理 |
| 核心 | 指令措辞 | 整体 token 配置 |
| Prompt | 静态 system prompt | 动态上下文刷新 |
| 任务 | 一次性任务 | 长时间跨度任务 |

### 1.2 上下文栈模型（Context Stack）

将 Agent 输入视为分层堆叠的模块：

```
┌─────────────────────────────────────────┐
│  Layer 6: Current Task（用户当前任务）    │
├─────────────────────────────────────────┤
│  Layer 5: Conversation History（对话历史）│
├─────────────────────────────────────────┤
│  Layer 4: Tool Definitions（工具定义）    │
├─────────────────────────────────────────┤
│  Layer 3: Retrieved Documents（检索文档） │
├─────────────────────────────────────────┤
│  Layer 2: Long-Term Memory（长期记忆）    │
├─────────────────────────────────────────┤
│  Layer 1: System Instructions（系统指令） │
└─────────────────────────────────────────┘
```

### 1.3 核心原则

| 原则 | 说明 | 实践方法 |
|------|------|----------|
| **相关性优先于时效性** | 只包含推理所需的信息 | 语义检索而非全量历史 |
| **动态上下文刷新** | 每个推理周期更新上下文 | Plan → Act → Reflect 循环 |
| **压缩与抽象** | 用摘要替代冗长日志 | 减少 token 负载，保留语义 |
| **上下文层次结构** | 组织为结构化层级 | Immediate/Working/Long-Term/External |

---

## 二、上下文收集策略

### 2.1 上下文来源分类

```yaml
context_sources:
  # 即时上下文 - 当前对话直接相关
  immediate:
    - user_current_message      # 用户当前消息
    - active_tool_results       # 活跃的工具调用结果
    - current_task_state        # 当前任务状态
  
  # 工作上下文 - 当前会话相关
  working:
    - conversation_history      # 对话历史（最近 N 轮）
    - session_context           # 会话级上下文变量
    - working_memory            # 工作记忆（笔记、TODO）
  
  # 长期上下文 - 跨会话持久化
  long_term:
    - user_preferences          # 用户偏好
    - user_memory               # 用户画像和历史
    - workspace_memory          # 工作空间知识
    - chat_history_summary      # 历史对话摘要
  
  # 外部上下文 - 实时检索
  external:
    - rag_documents             # RAG 检索结果
    - web_search_results        # 网络搜索结果
    - database_queries          # 数据库查询结果
    - mcp_resources             # MCP 资源
```

### 2.2 显式上下文收集

显式上下文是用户主动提供的信息：
- 上传的文件（BP、申请表、PPT 等）
- 提供的 URL 链接
- 对话中的明确指令
- 用户回答的问题

### 2.3 隐式上下文收集

隐式上下文是从用户行为和环境中推断的信息：
- 用户历史偏好
- 对话模式和风格
- 时间和场景信息
- 工作空间状态

---

## 三、上下文清洗与处理

### 3.1 清洗管道

```
Raw Context → 去重过滤 → 噪声过滤 → 格式标准化 → 相关性评分 → 优先级排序 → Clean Context
```

### 3.2 工具结果清洗

工具调用结果往往是上下文中最大的 token 消耗者。策略：
- 保留最近的工具结果完整
- 压缩历史工具结果为摘要
- 移除过时的工具调用记录

---

## 四、上下文压缩策略

### 4.1 压缩触发条件

```yaml
compaction_triggers:
  token_threshold:
    enabled: true
    threshold: 0.75  # 当使用量达到 75% 时触发
  round_threshold:
    enabled: true
    max_rounds: 10   # 每 10 轮对话触发一次检查
```

### 4.2 压缩策略

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| **滑动窗口** | 保留最近 N 轮，压缩更早历史 | 一般对话场景 |
| **工具结果压缩** | 保留元信息，压缩具体结果 | 工具密集型任务 |
| **智能摘要** | 使用 LLM 生成高质量摘要 | 长对话、复杂任务 |

### 4.3 NexAU 压缩配置

```yaml
middlewares:
  - import: nexau.archs.main_sub.execution.middleware.context_compaction:ContextCompactionMiddleware
    params:
      max_context_tokens: 200000
      auto_compact: true
      threshold: 0.75
      compaction_strategy: "sliding_window"
      window_size: 2
```

---

## 五、上下文注入模式

### 5.1 静态 vs 动态注入

| 模式 | 特点 | 示例 |
|------|------|------|
| **静态注入** | 预先加载所有相关数据 | CLAUDE.md 文件 |
| **动态注入** | 运行时按需检索 | glob/grep 检索 |
| **混合模式** | 静态核心 + 动态详情 | 推荐方案 |

### 5.2 Just-in-Time 检索

维护轻量级标识符（文件路径、查询、链接），运行时动态加载数据到上下文。

优势：
- 避免预加载所有数据
- 按需获取最新信息
- 减少上下文污染

---

## 六、长时任务管理

### 6.1 三文件模式

```
.claudedocs/
├── task_plan.md      # 任务计划与进度
├── notes.md          # 笔记与发现
└── deliverable.md    # 最终交付物
```

### 6.2 结构化笔记模板

```markdown
## 任务状态
- **当前阶段**: [阶段名称]
- **进度**: [X/Y 步骤完成]

## 关键决策
| 时间 | 决策 | 理由 |
|------|------|------|

## 待解决问题
- [ ] 问题1
- [ ] 问题2
```

### 6.3 子代理上下文隔离

```
Main Agent (协调者) ~10K tokens
├── Sub-Agent 1 (研究) ~50K → 返回 ~2K 摘要
├── Sub-Agent 2 (分析) ~30K → 返回 ~1K 结论
└── Sub-Agent 3 (执行) ~20K → 返回 ~1K 结果
```

---

## 七、System Prompt 工程

### 7.1 结构化模板

```markdown
## 1. 身份定义（Identity）
你是 [Agent名称]，专注于 [核心能力]。

## 2. 安全约束（Safety）
<safety>禁止响应的请求类型...</safety>

## 3. 工具使用规范（Tool Usage）
<tool_call>串行/并行调用规则...</tool_call>

## 4. 任务管理（Task Management）
<todo>任务规划规则...</todo>

## 5. 动态上下文（Context）
<context>
今天是 {{ date }}
<user_memory>{{ user_memory }}</user_memory>
</context>
```

### 7.2 高度校准原则

- ❌ **过于具体**：if-else 硬编码逻辑
- ✅ **适当高度**：具体指导 + 灵活启发式
- ❌ **过于模糊**：缺少具体指导，假设共享上下文

---

## 八、监控与优化

### 8.1 Token 使用监控

跟踪指标：
- system_tokens: 系统指令 token
- user_tokens: 用户消息 token
- tool_tokens: 工具结果 token
- utilization_rate: 利用率

### 8.2 优化建议

- 工具 token 占比 > 50%：启用工具结果压缩
- 利用率 > 80%：主动触发压缩
- 对话轮次 > 10：考虑滑动窗口

---

## 设计哲学

> "找到最小的高信号 token 集合，最大化期望结果的可能性。"

```
Good Context = Minimal × High-Signal × Right-Time
好的上下文   =  最小化  ×   高信号   ×   适时
```

---

## 版本历史

- **v1.0.0**（2026-01-28）：初始版本
  - 基于 Anthropic Context Engineering 最佳实践
  - 整合 NexAU 框架的 ContextCompactionMiddleware
  - 融入 workspace design 的上下文模式
