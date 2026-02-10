# Agent 设计方案 - [Agent名称]

## 概述

| 项目 | 说明 |
|------|------|
| Agent 名称 | |
| 所属场景 | |
| 核心能力 | |
| 触发方式 | App 中用户点击按钮 / 定时触发 / 事件驱动 |

## 输入 / 输出

### 输入
```
用户请求文本 + 上下文数据（通过 Prompt 注入）
```

### 输出
```
结构化结果（写入 Supabase 表 + 返回给 App）
```

## 工具调用

| 工具 | 用途 | 参数 |
|------|------|------|
| supabase_tool | 读写数据库 | table, operation, data |
| researcher_agent | 外部信息搜索 | query |
| feishu_agent | 飞书 API 操作 | action, params |

## Prompt 结构

```
<reference>
<!-- METADATA_JSON: {"agent_name": "[Agent名称]"} -->

【任务目标】
[一句话描述这个 Agent 要做什么]

【数据来源】
- 企业画像：通过 supabase_tool 查询 enterprises 表
- 外部动态：通过 researcher_agent 搜索

【supabase_tool 参数结构】
读取: {"table": "xxx", "operation": "select", "filters": {...}}
写入: {"table": "xxx", "operation": "insert", "data": {...}}

【执行步骤】
1. 查询相关数据
2. 分析处理
3. 生成结构化结果
4. 写入数据库
5. 返回结果摘要

【输出格式】
[结构化输出格式说明]
</reference>

[用户的具体请求]
```

## 工作空间配置

部署到 `workspaces/[场景名]/` 后，Agent 的行为由 AGENTS.md 控制。
业务技能放在 `workspaces/[场景名]/skills/` 下。

## 测试验证

| 测试场景 | 输入 | 预期输出 | 状态 |
|---------|------|---------|------|
