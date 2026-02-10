# 小北平台能力清单

> AI 产品经理在 Phase 3 设计产品方案时，需要了解平台能提供什么能力。

## App 能力

| 能力 | 说明 |
|------|------|
| north-app 嵌入式应用 | Next.js 14 + App Router，嵌入驾驶舱平台 |
| SDK Context | 用户认证、宿主通信、文件操作 |
| Supabase 数据库 | PostgreSQL + RLS + Realtime |
| @north/design 组件库 | 基于 shadcn/ui + Tailwind 的 UI 组件 |

## Agent 能力

| 能力 | 说明 |
|------|------|
| 对话式 Agent | 接收用户消息，返回结构化回复 |
| supabase_tool | Agent 读写 Supabase 数据库 |
| researcher_agent | 外部信息搜索（联网搜索） |
| feishu_agent | 飞书 API 操作（消息、多维表格、妙记） |
| exec_agent | 执行子任务 |
| 工作空间 | AGENTS.md + MEMORY.md + skills/ 三件套 |

## 通信方式

| 方式 | 说明 |
|------|------|
| sendChat | App 向 Agent 发消息 |
| Realtime | Agent 通过 supabase_tool 写数据 → App 实时收到更新 |
| 定时触发 | 配置定时任务触发 Agent |
| 事件驱动 | 飞书消息等外部事件触发 Agent |

## 数据接入

| 方式 | 说明 |
|------|------|
| 批量导入 | CSV / Excel 数据导入 Supabase |
| API 同步 | 定时从外部 API 拉取数据 |
| 飞书集成 | 飞书多维表格、妙记、日历、消息 |
| Webhook | 外部系统推送数据 |

## 限制

| 限制 | 说明 |
|------|------|
| App 运行在 iframe 中 | 需要通过 SDK 与宿主通信，不能直接访问宿主 DOM |
| Agent 是异步的 | 发送消息后等待回复，不是实时函数调用 |
| Supabase RLS | 数据隔离靠 RLS 策略，需要正确配置 |
