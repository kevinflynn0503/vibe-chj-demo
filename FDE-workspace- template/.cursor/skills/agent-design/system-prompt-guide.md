# System Prompt 设计指南

## 概述

System Prompt 是 Agent 的"大脑配置"——它定义了 Agent 的身份、能力、行为方式和工作流程。

---

## 结构模板

```markdown
# Agent 名称

## Core Identity and Mission

<identity>
你是谁，具备什么能力
</identity>

<mission>
你的核心任务是什么
工作流程概述
</mission>

## Behavioral Guidelines

### Tone and Style
- 沟通风格
- 回复长度
- 语言要求

### Proactiveness
- 主动程度
- 何时等待确认
- 何时自主执行

### Following Conventions
- 代码风格
- 命名规范
- 安全要求

## Task Management
- TODO 使用规则
- 进度追踪方式
- 状态更新时机

## Tool Usage Strategy
### 工具1
- 用途
- 使用时机
- 注意事项

### 工具2
...

## Context Variables
- {{date}}: 当前日期
- {{workspace}}: 工作目录
```

---

## 各部分详解

### 1. Identity（身份）

定义 Agent 的角色和基本能力。

**好的身份定义**：
```markdown
<identity>
You are an advanced deep research agent that transforms research 
queries into structured, executable research plans using 
epistemological frameworks.
</identity>
```

**避免**：
```markdown
<identity>
You are a helpful assistant.  # 太泛泛
</identity>
```

### 2. Mission（使命）

明确核心任务和工作流程。

**好的使命定义**：
```markdown
<mission>
PRIMARY WORKFLOW:
1. Receive user research task
2. Apply first-principles analysis
3. Conduct background verification
4. Execute OODA research cycles
5. Generate comprehensive findings

CORE PRINCIPLES:
- Language Consistency with user input
- Deep Reading Over Surface Scanning
- Adaptive Strategy based on uncertainty
</mission>
```

### 3. Tone and Style（语气风格）

控制回复的风格和长度。

**简洁型**（适合对话 Agent）：
```markdown
### Tone and Style
- Be concise, direct, and to the point
- Answer with fewer than 4 lines unless asked for detail
- Minimize output tokens while maintaining quality
- Do not add unnecessary preamble or postamble
```

**详细型**（适合研究 Agent）：
```markdown
### Tone and Style
- Provide comprehensive explanations
- Include evidence and citations
- Structure output with clear sections
- Use markdown for readability
```

### 4. Task Management（任务管理）

定义如何使用 TODO 工具。

```markdown
## Task Management

You have access to the TodoWrite tool. Use it:
- To plan complex tasks
- To track progress
- To break down large tasks

Rules:
- Mark todos as completed immediately after finishing
- Update status in real-time
- Keep only one task in_progress at a time
```

### 5. Tool Usage Strategy（工具使用）

关键是告诉 Agent 什么时候用什么工具。

```markdown
## Tool Usage Strategy

### Search vs DeepResearch
- `Search`: Quick single-fact queries (time, price, weather)
- `DeepResearchAgent`: Comprehensive research requiring analysis

### File Operations
- Always use `Finish` tool for file creation/modification
- Use `Read` before editing to understand context

### VisitPage
- MUST use after Search to read full content
- Never rely only on search snippets
```

---

## 高级技巧

### 1. 使用 XML 标签组织

```markdown
<task_reception>
When receiving a new task:
1. Analyze the query
2. Identify knowledge type
3. Plan research approach
</task_reception>

<validation>
Before completing:
1. Check evidence quality
2. Verify logical consistency
3. Ensure completeness
</validation>
```

### 2. 条件逻辑

```markdown
## Dynamic Instructions

- IF high uncertainty: Emphasize exploratory research
- IF time pressure: Focus on critical path only
- IF high complexity: Include systems modeling
- IF high stakes: Maximize verification depth
```

### 3. 示例驱动

```markdown
### Response Examples

<example>
user: 2 + 2
assistant: 4
</example>

<example>
user: what command to list files?
assistant: ls
</example>
```

### 4. 输出格式控制

```markdown
## Output Format

Always structure findings as:
```
## Executive Summary
[Key findings in 2-3 sentences]

## Detailed Analysis
[Structured analysis]

## Evidence
[Citations and sources]
```
```

---

## 常见模式

### 研究型 Prompt

```markdown
# Research Agent

## Identity
Advanced research agent with epistemological rigor.

## Workflow
1. Decompose problem
2. Verify background
3. Execute OODA cycles
4. Synthesize findings

## Quality Standards
- 80%+ citations from deep reading
- All claims classified by confidence
- Contradictions documented
```

### 执行型 Prompt

```markdown
# Execution Agent

## Identity
Task execution agent focused on efficiency.

## Behavior
- Execute immediately upon clear instructions
- Ask clarification only when ambiguous
- Report completion concisely

## Error Handling
- Log all errors to task file
- Attempt recovery before reporting
- Provide actionable error messages
```

### 对话型 Prompt

```markdown
# Conversational Agent

## Identity
Helpful assistant for user queries.

## Behavior
- Respond in user's language
- Keep answers concise
- Ask follow-up questions when needed

## Boundaries
- No code execution without permission
- No file modification without confirmation
```

---

## 检查清单

创建 System Prompt 前检查：

- [ ] 身份定义是否具体？
- [ ] 任务边界是否明确？
- [ ] 工具使用是否有指导？
- [ ] 输出格式是否有示例？
- [ ] 错误处理是否有说明？
- [ ] 语气风格是否匹配场景？
