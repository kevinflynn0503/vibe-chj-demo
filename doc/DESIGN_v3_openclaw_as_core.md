# 小北重构方案：Openclaw 作为唯一核心

> **版本**: v3.0  
> **日期**: 2026-02-03  
> **核心思想**: Openclaw 替代所有小北后端，成为唯一的 Agent 核心

---

## 1. 目标：极简架构

### 1.1 现有架构（复杂）

```
┌─────────────┐
│ 小北前端     │
│ (Vide FDE)  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                     小北后端（4个服务）                            │
│                                                                  │
│  ┌─────────────────┐   ┌─────────────────┐   ┌────────────────┐ │
│  │ north-app-core  │   │ north-deer-flow │   │northau-xiaobei │ │
│  │ (Go + gRPC)     │   │ (Python研究)    │   │ (Python Agent) │ │
│  │ 任务调度、API    │   │ 深度研究引擎    │   │ Agent 执行     │ │
│  └────────┬────────┘   └────────┬────────┘   └───────┬────────┘ │
│           │                     │                     │         │
│           └─────────────────────┼─────────────────────┘         │
│                                 │                               │
│                                 ▼                               │
│                          ┌─────────────┐                        │
│                          │    E2B      │                        │
│                          │  云端沙箱    │                        │
│                          └─────────────┘                        │
└──────────────────────────────────────────────────────────────────┘

问题：
- 4个服务，维护成本高
- Go + Python 混合，技术栈分散
- 依赖 E2B 云端沙箱，无法访问本地
- 复杂的服务间通信
```

### 1.2 新架构（极简）

```
┌─────────────┐
│ 小北前端     │
│ (Vide FDE)  │
└──────┬──────┘
       │
       │ HTTP/WebSocket
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Openclaw（唯一后端）                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Openclaw Gateway                         │ │
│  │                    (TypeScript + Node.js)                   │ │
│  │                                                             │ │
│  │  ┌─────────────────┐  ┌─────────────────┐                  │ │
│  │  │  小北 API 适配   │  │  Openclaw API   │                  │ │
│  │  │  /v1/chat_async │  │  WebSocket      │                  │ │
│  │  └─────────────────┘  └─────────────────┘                  │ │
│  └────────────────────────────┬───────────────────────────────┘ │
│                               │                                 │
│  ┌────────────────────────────▼───────────────────────────────┐ │
│  │                    Openclaw Agent Core                      │ │
│  │                    (AI 大脑)                                │ │
│  │                                                             │ │
│  │  - Claude / GPT / Gemini 模型调用                           │ │
│  │  - 多轮对话管理                                             │ │
│  │  - 工具调用协调                                             │ │
│  │  - 子 Agent 管理                                            │ │
│  └────────────────────────────┬───────────────────────────────┘ │
│                               │                                 │
│  ┌────────────────────────────▼───────────────────────────────┐ │
│  │                    统一工具系统                              │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │ │
│  │  │ Openclaw原生  │  │ 小北工具移植  │  │  深度研究    │      │ │
│  │  │              │  │              │  │              │      │ │
│  │  │ file_read    │  │ FeishuQuery  │  │ DeepResearch │      │ │
│  │  │ file_write   │  │ FeishuChat   │  │ WebSearch    │      │ │
│  │  │ shell_exec   │  │ FeishuBitable│  │ ArxivSearch  │      │ │
│  │  │ browser_*    │  │ ImageCaption │  │ DocReader    │      │ │
│  │  │ git_*        │  │ GenerateImage│  │ ReportWriter │      │ │
│  │  │ web_search   │  │ Supabase     │  │              │      │ │
│  │  │ web_fetch    │  │ TaskTrigger  │  │              │      │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                               │                                 │
│                               ▼                                 │
│                         本地执行能力                             │
│                    （文件/命令/浏览器/Git）                       │
└──────────────────────────────────────────────────────────────────┘

优势：
✅ 单一服务，维护简单
✅ 单一技术栈 (TypeScript)
✅ 本地执行，无需 E2B
✅ 前端直连，无服务间通信
```

### 1.3 精简对比

| 维度 | 现有架构 | 新架构 |
|-----|---------|-------|
| **服务数量** | 4个 (Go + Python) | 1个 (TypeScript) |
| **代码库** | 4个仓库 | 1个仓库 |
| **技术栈** | Go + Python + TypeScript | TypeScript |
| **部署复杂度** | 高（多服务编排） | 低（单服务） |
| **本地执行** | ❌ 依赖 E2B | ✅ 原生支持 |
| **维护成本** | 高 | 低 |

---

## 2. 需要移植的小北能力

### 2.1 从 northau-xiaobei 移植

| 工具 | 原实现 | 移植方案 |
|-----|-------|---------|
| **FeishuQuery** | Python + lark_oapi | TypeScript 重写 |
| **FeishuChatInteract** | Python | TypeScript 重写 |
| **FeishuBitable** | Python | TypeScript 重写 |
| **ImageCaption** | Python | 调用 Vision API |
| **GenerateImage** | Python | 调用 DALL-E/SD API |
| **Supabase** | Python | @supabase/supabase-js |
| **CreateTaskTrigger** | Python | 使用 Openclaw 的 cron 系统 |

### 2.2 从 north-deer-flow 移植

| 能力 | 原实现 | 移植方案 |
|-----|-------|---------|
| **深度研究** | LangGraph 工作流 | Openclaw 多 Agent 协作 |
| **网络搜索** | Tavily/Brave/DuckDuckGo | Openclaw web_search 增强 |
| **Arxiv 搜索** | Python arxiv 库 | TypeScript 重写 |
| **文档阅读** | Python | Openclaw 已有类似能力 |
| **报告生成** | Python | Agent 原生能力 |

### 2.3 从 north-app-core 简化

| 能力 | 处理方式 |
|-----|---------|
| **任务调度** | Openclaw Gateway 原生支持 |
| **用户认证** | 简化为 Token 认证 |
| **数据存储** | SQLite 或 PostgreSQL 直连 |
| **沙箱管理** | 不需要（本地执行） |

---

## 3. 详细设计

### 3.1 目录结构（在 Openclaw 中新增）

```
openclaw-cn/
├── src/
│   ├── agents/
│   │   └── tools/
│   │       ├── ... (现有工具)
│   │       │
│   │       │── xiaobei/                    # 小北工具（新增）
│   │       │   ├── feishu-query.ts         # 飞书查询
│   │       │   ├── feishu-chat.ts          # 飞书聊天
│   │       │   ├── feishu-bitable.ts       # 飞书多维表格
│   │       │   ├── image-caption.ts        # 图像识别
│   │       │   ├── generate-image.ts       # 图像生成
│   │       │   ├── supabase.ts             # Supabase 操作
│   │       │   └── index.ts                # 导出所有小北工具
│   │       │
│   │       └── research/                   # 深度研究（新增）
│   │           ├── deep-research.ts        # 深度研究入口
│   │           ├── web-search-enhanced.ts  # 增强搜索
│   │           ├── arxiv-search.ts         # 论文搜索
│   │           ├── doc-reader.ts           # 文档阅读
│   │           └── report-writer.ts        # 报告生成
│   │
│   ├── xiaobei-api/                        # 小北 API 兼容层（新增）
│   │   ├── index.ts                        # API 路由
│   │   ├── chat-handler.ts                 # 聊天处理
│   │   ├── event-stream.ts                 # 事件流
│   │   └── config-store.ts                 # 配置存储
│   │
│   └── gateway/
│       └── server.impl.ts                  # 修改：集成小北 API
│
└── skills/
    └── xiaobei/                            # 小北技能（新增）
        ├── deep-research/
        │   └── skill.md
        ├── enterprise-research/
        │   └── skill.md
        └── feishu-assistant/
            └── skill.md
```

### 3.2 飞书工具实现（示例）

```typescript
// src/agents/tools/xiaobei/feishu-query.ts

import * as lark from "@larksuiteoapi/node-sdk";
import { Type } from "@sinclair/typebox";
import type { AnyAgentTool } from "../common.js";
import { jsonResult } from "../common.js";

// 飞书查询工具
// 功能：查询飞书消息、文档、日历等
// 移植自：northau-xiaobei/artifacts/tools/feishu
// 依赖：@larksuiteoapi/node-sdk
// 作者：XiaoBei Integration
export function createFeishuQueryTool(config: FeishuConfig): AnyAgentTool {
  const client = new lark.Client({
    appId: config.appId,
    appSecret: config.appSecret,
  });

  return {
    name: "feishu_query",
    description: "查询飞书数据（消息、文档、日历、多维表格等）",
    parameters: Type.Object({
      query_type: Type.Union([
        Type.Literal("messages"),
        Type.Literal("docs"),
        Type.Literal("calendar"),
        Type.Literal("bitable"),
      ], { description: "查询类型" }),
      query: Type.String({ description: "查询内容或 ID" }),
      options: Type.Optional(Type.Object({
        page_size: Type.Optional(Type.Number()),
        page_token: Type.Optional(Type.String()),
      })),
    }),

    async execute(params: any) {
      const { query_type, query, options } = params;

      switch (query_type) {
        case "messages":
          return await queryMessages(client, query, options);
        case "docs":
          return await queryDocs(client, query, options);
        case "calendar":
          return await queryCalendar(client, query, options);
        case "bitable":
          return await queryBitable(client, query, options);
        default:
          throw new Error(`未知的查询类型: ${query_type}`);
      }
    },
  };
}

async function queryMessages(client: lark.Client, chatId: string, options?: any) {
  const resp = await client.im.message.list({
    path: { container_id: chatId },
    params: {
      container_id_type: "chat",
      page_size: options?.page_size || 20,
      page_token: options?.page_token,
    },
  });
  
  return jsonResult({
    messages: resp.data?.items || [],
    has_more: resp.data?.has_more,
    page_token: resp.data?.page_token,
  });
}

// ... 其他查询方法
```

### 3.3 深度研究工具实现（示例）

```typescript
// src/agents/tools/research/deep-research.ts

import { Type } from "@sinclair/typebox";
import type { AnyAgentTool, AgentContext } from "../common.js";
import { jsonResult } from "../common.js";

// 深度研究工具
// 功能：启动多步骤深度研究任务
// 移植自：north-deer-flow
// 流程：规划 → 搜索 → 分析 → 报告
// 作者：XiaoBei Integration
export function createDeepResearchTool(ctx: AgentContext): AnyAgentTool {
  return {
    name: "deep_research",
    description: "启动深度研究任务，自动搜索、分析、生成报告",
    parameters: Type.Object({
      topic: Type.String({ description: "研究主题" }),
      depth: Type.Union([
        Type.Literal("quick"),
        Type.Literal("medium"),
        Type.Literal("thorough"),
      ], { default: "medium", description: "研究深度" }),
      sources: Type.Optional(Type.Array(Type.Union([
        Type.Literal("web"),
        Type.Literal("arxiv"),
        Type.Literal("news"),
      ]))),
      output_format: Type.Union([
        Type.Literal("markdown"),
        Type.Literal("json"),
      ], { default: "markdown" }),
    }),

    async execute(params: any) {
      const { topic, depth, sources, output_format } = params;

      // 1. 规划研究步骤
      const plan = await planResearch(ctx, topic, depth);
      
      // 2. 并行执行搜索
      const searchResults = await executeSearches(ctx, plan, sources);
      
      // 3. 分析和整合
      const analysis = await analyzeResults(ctx, searchResults);
      
      // 4. 生成报告
      const report = await generateReport(ctx, topic, analysis, output_format);

      return jsonResult({
        topic,
        report,
        sources_used: searchResults.length,
        generated_at: new Date().toISOString(),
      });
    },
  };
}

// 规划研究
async function planResearch(ctx: AgentContext, topic: string, depth: string) {
  // 使用 Agent 能力进行规划
  const subTasks = [];
  
  if (depth === "quick") {
    subTasks.push({ type: "web_search", query: topic });
  } else if (depth === "medium") {
    subTasks.push(
      { type: "web_search", query: topic },
      { type: "web_search", query: `${topic} latest trends` },
      { type: "news_search", query: topic },
    );
  } else {
    subTasks.push(
      { type: "web_search", query: topic },
      { type: "web_search", query: `${topic} analysis` },
      { type: "web_search", query: `${topic} future` },
      { type: "arxiv_search", query: topic },
      { type: "news_search", query: topic },
    );
  }
  
  return subTasks;
}

// 执行搜索
async function executeSearches(ctx: AgentContext, plan: any[], sources?: string[]) {
  const results = [];
  
  for (const task of plan) {
    // 调用对应的搜索工具
    if (task.type === "web_search") {
      const result = await ctx.tools.web_search.execute({ query: task.query });
      results.push(result);
    } else if (task.type === "arxiv_search") {
      const result = await ctx.tools.arxiv_search.execute({ query: task.query });
      results.push(result);
    }
  }
  
  return results;
}

// 分析结果
async function analyzeResults(ctx: AgentContext, results: any[]) {
  // 使用 AI 分析和整合搜索结果
  // ...
  return { summary: "...", key_points: [], references: [] };
}

// 生成报告
async function generateReport(ctx: AgentContext, topic: string, analysis: any, format: string) {
  // 使用 AI 生成最终报告
  // ...
  return "# 研究报告\n...";
}
```

### 3.4 小北 API 兼容层

```typescript
// src/xiaobei-api/index.ts

import { Hono } from "hono";
import { cors } from "hono/cors";
import { ChatHandler } from "./chat-handler.js";
import { ConfigStore } from "./config-store.js";
import { EventStream } from "./event-stream.js";

// 小北 API 兼容层
// 功能：让 Openclaw 兼容小北前端的 API 协议
// 端点：/v1/config, /v1/chat_async, /v1/task/:id
// 作者：XiaoBei Integration
export function createXiaoBeiAPI(agentRunner: AgentRunner) {
  const app = new Hono();
  
  // CORS
  app.use("/*", cors());
  
  const configStore = new ConfigStore();
  const chatHandler = new ChatHandler(agentRunner, configStore);
  
  // ========== POST /v1/config ==========
  app.post("/v1/config", async (c) => {
    const body = await c.req.json();
    configStore.update(body.configs);
    return c.json({ success: true });
  });
  
  // ========== GET /v1/config ==========
  app.get("/v1/config", (c) => {
    return c.json(configStore.getAll());
  });
  
  // ========== POST /v1/chat_async ==========
  app.post("/v1/chat_async", async (c) => {
    const body = await c.req.json();
    const { task_id, message, context } = body;
    
    // 异步启动 Agent
    chatHandler.startAsync(task_id, message, context);
    
    return c.json({
      task_id,
      status: "accepted",
    });
  });
  
  // ========== GET /v1/task/:id ==========
  app.get("/v1/task/:id", (c) => {
    const taskId = c.req.param("id");
    const task = chatHandler.getTask(taskId);
    
    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }
    
    return c.json(task);
  });
  
  // ========== POST /v1/cancel_task ==========
  app.post("/v1/cancel_task", async (c) => {
    const body = await c.req.json();
    chatHandler.cancelTask(body.task_id);
    return c.json({ success: true });
  });
  
  // ========== GET /health ==========
  app.get("/health", (c) => {
    return c.json({ status: "ok", version: "openclaw-xiaobei" });
  });
  
  return app;
}
```

### 3.5 集成到 Openclaw Gateway

```typescript
// src/gateway/server.impl.ts（修改）

import { createXiaoBeiAPI } from "../xiaobei-api/index.js";
import { createXiaoBeiTools } from "../agents/tools/xiaobei/index.js";
import { createResearchTools } from "../agents/tools/research/index.js";

export async function startGatewayServer(options: GatewayOptions) {
  // ... 现有初始化 ...
  
  // 注册小北工具
  const xiaobeiTools = createXiaoBeiTools({
    feishu: options.feishu,
    supabase: options.supabase,
  });
  agentRunner.registerTools(xiaobeiTools);
  
  // 注册研究工具
  const researchTools = createResearchTools();
  agentRunner.registerTools(researchTools);
  
  // 添加小北 API 路由
  const xiaobeiAPI = createXiaoBeiAPI(agentRunner);
  app.route("/", xiaobeiAPI);
  
  console.log("✅ Openclaw + 小北整合版已启动");
  console.log("   - 小北 API: /v1/chat_async, /v1/config");
  console.log("   - 小北工具: feishu_query, feishu_chat, deep_research...");
  console.log("   - 本地执行: file_*, shell_exec, browser_*...");
  
  // 启动服务器
  return serve({
    fetch: app.fetch,
    port: options.port || 18789,
  });
}
```

---

## 4. 前端适配

### 4.1 前端只需改一个配置

```typescript
// Vide FDE 前端配置

// 原来连接小北后端
const API_BASE = "http://xiaobei-backend:8080";

// 现在连接 Openclaw
const API_BASE = "http://localhost:18789";

// API 协议完全兼容，无需其他改动！
```

### 4.2 前端调用示例

```typescript
// 注入配置
await fetch(`${API_BASE}/v1/config`, {
  method: "POST",
  body: JSON.stringify({
    configs: {
      MAIN_AGENT: {
        model: "claude-sonnet-4",
        api_key: "sk-xxx",
      },
      workspace_dir: "/Users/xxx/workspace",
      event_stream: {
        url: "https://your-event-server/stream",
        api_key: "xxx",
      },
    },
  }),
});

// 发送消息
await fetch(`${API_BASE}/v1/chat_async`, {
  method: "POST",
  body: JSON.stringify({
    task_id: "task-123",
    message: "帮我在本地项目执行 npm install",
  }),
});

// 事件流会推送：
// - MESSAGE_RUNNING: 流式文本
// - TOOL_START/TOOL_END: 工具调用（file_read, shell_exec 等）
// - RUN_END: 完成
```

---

## 5. 配置文件

```json5
// ~/.openclaw/openclaw.json

{
  // Agent 配置
  "agent": {
    "model": "anthropic/claude-sonnet-4"
  },
  
  // Gateway 配置
  "gateway": {
    "port": 18789,
    "host": "0.0.0.0"
  },
  
  // 小北功能配置
  "xiaobei": {
    "enabled": true,
    
    // 飞书配置
    "feishu": {
      "app_id": "${FEISHU_APP_ID}",
      "app_secret": "${FEISHU_APP_SECRET}"
    },
    
    // Supabase 配置
    "supabase": {
      "url": "${SUPABASE_URL}",
      "key": "${SUPABASE_KEY}"
    },
    
    // 深度研究配置
    "research": {
      "web_search_provider": "tavily",  // tavily | brave | duckduckgo
      "tavily_api_key": "${TAVILY_API_KEY}"
    }
  },
  
  // 安全配置
  "security": {
    "allowed_directories": [
      "/Users/xxx/projects",
      "/Users/xxx/workspace"
    ]
  }
}
```

---

## 6. 实施计划

### 6.1 阶段划分

```
阶段 1: 小北 API 兼容层 (1周)
├── 实现 /v1/config API
├── 实现 /v1/chat_async API
├── 实现 Event Stream 推送
└── 测试前端连接

阶段 2: 小北工具移植 (2周)
├── 移植飞书工具 (FeishuQuery, FeishuChat, FeishuBitable)
├── 移植图像工具 (ImageCaption, GenerateImage)
├── 移植 Supabase 工具
└── 移植 TaskTrigger 工具

阶段 3: 深度研究移植 (1周)
├── 实现 deep_research 工具
├── 增强 web_search (多源搜索)
├── 实现 arxiv_search
└── 实现报告生成

阶段 4: 测试和优化 (1周)
├── 端到端测试
├── 性能优化
├── 文档编写
└── 前端完整测试
```

### 6.2 详细任务清单

| 阶段 | 任务 | 预计工时 |
|-----|------|---------|
| **1.1** | 创建 xiaobei-api 目录结构 | 2h |
| **1.2** | 实现 ConfigStore | 2h |
| **1.3** | 实现 /v1/config API | 2h |
| **1.4** | 实现 ChatHandler | 4h |
| **1.5** | 实现 /v1/chat_async API | 4h |
| **1.6** | 实现 EventStream 推送 | 4h |
| **1.7** | 测试前端连接 | 4h |
| | **阶段 1 小计** | **~22h (3天)** |
| **2.1** | 移植 feishu_query 工具 | 8h |
| **2.2** | 移植 feishu_chat 工具 | 4h |
| **2.3** | 移植 feishu_bitable 工具 | 8h |
| **2.4** | 移植 image_caption 工具 | 4h |
| **2.5** | 移植 generate_image 工具 | 4h |
| **2.6** | 移植 supabase 工具 | 4h |
| **2.7** | 移植 task_trigger 工具 | 4h |
| | **阶段 2 小计** | **~36h (5天)** |
| **3.1** | 实现 deep_research 工具 | 8h |
| **3.2** | 增强 web_search | 4h |
| **3.3** | 实现 arxiv_search | 4h |
| **3.4** | 实现报告生成 | 4h |
| | **阶段 3 小计** | **~20h (3天)** |
| **4.x** | 测试和优化 | **~16h (2天)** |
| | **总计** | **~13天** |

---

## 7. 迁移后对比

### 7.1 服务对比

| 原来 | 现在 |
|-----|------|
| north-app-core (Go) | ❌ 不需要 |
| north-deer-flow (Python) | ❌ 不需要（能力移植到 Openclaw） |
| northau-xiaobei (Python) | ❌ 不需要（能力移植到 Openclaw） |
| E2B 云端沙箱 | ❌ 不需要（本地执行） |
| **Openclaw (TypeScript)** | ✅ **唯一后端** |

### 7.2 部署对比

```bash
# 原来（需要启动多个服务）
$ docker-compose up -d  # 启动 4 个容器
# - north-app-core
# - north-deer-flow  
# - northau-xiaobei
# - postgres/redis/...

# 现在（只需一个命令）
$ openclaw gateway

# 或者 Docker
$ docker run -p 18789:18789 openclaw-xiaobei
```

### 7.3 能力对比

| 能力 | 原来 | 现在 |
|-----|------|------|
| 本地文件操作 | ❌ | ✅ |
| 本地命令执行 | ❌ | ✅ |
| 浏览器自动化 | ❌ | ✅ |
| Git 操作 | ❌ | ✅ |
| 飞书集成 | ✅ | ✅ (移植) |
| 深度研究 | ✅ | ✅ (移植) |
| 多渠道消息 | ❌ | ✅ (Openclaw原生) |

---

## 8. 架构总结

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      最终架构（极简）                            │
│                                                                 │
│   ┌─────────────┐                                              │
│   │ 小北前端     │                                              │
│   │ (Vide FDE)  │                                              │
│   └──────┬──────┘                                              │
│          │                                                      │
│          │ HTTP (小北 API 协议)                                 │
│          ▼                                                      │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    Openclaw 整合版                       │  │
│   │                                                          │  │
│   │   小北 API 兼容 ─────► Agent Core ─────► 工具系统        │  │
│   │                                          │               │  │
│   │                                   ┌──────┴──────┐        │  │
│   │                                   ▼             ▼        │  │
│   │                              本地工具      小北工具       │  │
│   │                              file_*       feishu_*      │  │
│   │                              shell_exec   deep_research │  │
│   │                              browser_*    image_*       │  │
│   │                              git_*        supabase      │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   不再需要:                                                     │
│   ❌ north-app-core                                            │
│   ❌ north-deer-flow                                           │
│   ❌ northau-xiaobei                                           │
│   ❌ E2B 云端沙箱                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. 下一步

1. **确认方案**：这个方向是否符合您的预期？
2. **开始实施**：从阶段 1（API 兼容层）开始
3. **渐进迁移**：可以先让两套系统并行，逐步切换

---

*文档结束*
