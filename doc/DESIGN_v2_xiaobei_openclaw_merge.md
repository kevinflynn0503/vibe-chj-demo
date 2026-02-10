# 小北 + Openclaw 深度整合设计文档 v2

> **版本**: v2.0  
> **日期**: 2026-02-03  
> **核心思想**: 直接整合 northau-xiaobei 和 Openclaw，无需中间层

---

## 1. 目标

### 1.1 整合前（现状）

```
┌─────────────┐     ┌─────────────────────┐
│ 小北前端     │────►│ northau-xiaobei     │───► E2B 云端沙箱（无法访问本地）
│ (Vide FDE)  │     │ (Python Agent)      │
└─────────────┘     └─────────────────────┘

┌─────────────┐     ┌─────────────────────┐
│ 其他客户端   │────►│ Openclaw            │───► 本地执行（文件/命令/浏览器）
│             │     │ (TypeScript Agent)  │
└─────────────┘     └─────────────────────┘
```

两个独立系统，各自为战。

### 1.2 整合后（目标）

```
┌─────────────┐
│ 小北前端     │
│ (Vide FDE)  │
└──────┬──────┘
       │ 小北 API 协议
       ▼
┌─────────────────────────────────────────────────────┐
│          整合后的系统（二选一方案）                    │
│                                                      │
│  方案A: Openclaw 兼容小北 API                        │
│         Openclaw Gateway + 小北 API 适配层           │
│                                                      │
│  方案B: 小北使用 Openclaw 作为执行层                  │
│         northau-xiaobei + Openclaw MCP Server       │
│                                                      │
└─────────────────────────────────────────────────────┘
       │
       ▼
    本地执行（文件/命令/浏览器/Git）
```

---

## 2. 整合方案对比

| 方案 | 描述 | 优点 | 缺点 |
|-----|------|-----|------|
| **A: Openclaw 兼容小北 API** | 在 Openclaw 上实现小北的 API | 前端无需改动 | 需要开发 API 适配层 |
| **B: 小北 + Openclaw MCP** | 小北通过 MCP 调用 Openclaw | 松耦合，各自演进 | 需要实现 MCP Server |
| **C: 工具移植** | 把 Openclaw 工具移植到小北 | 单一代码库 | 工作量大，重复造轮子 |

**推荐方案 A**：让 Openclaw 兼容小北的 API 协议，小北前端直接连接 Openclaw。

---

## 3. 方案 A 详细设计：Openclaw 兼容小北 API

### 3.1 架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    整合架构：Openclaw + 小北 API 兼容层                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         小北前端 (Vide FDE)                           │  │
│  │                                                                       │  │
│  │   发送请求: POST /v1/chat_async                                       │  │
│  │   接收事件: Event Stream (MESSAGE_RUNNING, TOOL_START, etc.)          │  │
│  │                                                                       │  │
│  └────────────────────────────────┬─────────────────────────────────────┘  │
│                                   │                                        │
│                                   │ HTTP (小北 API 协议)                   │
│                                   ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Openclaw Gateway + 小北 API 适配层                 │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │  小北 API 适配器 (新增)                                          │ │  │
│  │  │                                                                  │ │  │
│  │  │  POST /v1/config      → 配置注入                                 │ │  │
│  │  │  POST /v1/chat_async  → 触发 Agent 运行                          │ │  │
│  │  │  GET  /v1/task/{id}   → 查询任务状态                             │ │  │
│  │  │  POST /v1/cancel_task → 取消任务                                 │ │  │
│  │  │                                                                  │ │  │
│  │  │  Event Stream 推送:                                              │ │  │
│  │  │  - MESSAGE_RUNNING (流式文本)                                    │ │  │
│  │  │  - TOOL_START / TOOL_END (工具调用)                              │ │  │
│  │  │  - AGENT_START / AGENT_END                                      │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │                                   │                                   │  │
│  │                                   ▼                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │  Openclaw Agent Core (现有)                                     │ │  │
│  │  │                                                                  │ │  │
│  │  │  - AI 模型调用 (Claude/GPT/Gemini)                              │ │  │
│  │  │  - 工具系统 (57+ 工具)                                          │ │  │
│  │  │  - 会话管理                                                     │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │                                   │                                   │  │
│  │                                   ▼                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │  本地执行能力 (Openclaw 核心优势)                                │ │  │
│  │  │                                                                  │ │  │
│  │  │  ✅ file_read / file_write / file_edit                          │ │  │
│  │  │  ✅ shell_exec / script_run                                     │ │  │
│  │  │  ✅ browser_* (Playwright)                                      │ │  │
│  │  │  ✅ git_* 操作                                                  │ │  │
│  │  │  ✅ process_spawn / process_kill                                │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 小北 API 协议（需要在 Openclaw 中实现）

#### 3.2.1 配置注入 API

```typescript
// POST /v1/config
// 小北前端在启动时调用，注入配置

interface ConfigRequest {
  configs: {
    BASE_INFO: {
      tenant_id: string;
      user_id: string;
      user_name: string;
      session_id: string;
    };
    MAIN_AGENT: {
      base_url: string;
      api_key: string;
      model: string;
    };
    event_stream: {
      url: string;
      api_key_header: string;
      api_key: string;
    };
    workspace_dir: string;
    working_dir: string;
    thread_id: string;
  };
}

// 响应
interface ConfigResponse {
  success: boolean;
}
```

#### 3.2.2 异步聊天 API

```typescript
// POST /v1/chat_async
// 核心聊天接口

interface ChatAsyncRequest {
  task_id: string;          // 任务 ID
  message: string;          // 用户消息
  context?: {
    thread_id?: string;
    block_id?: string;
  };
  agent_yaml_config?: string; // 可选的 Agent 配置覆盖
}

// 立即响应
interface ChatAsyncResponse {
  task_id: string;
  status: "accepted";
}

// 后续通过 Event Stream 推送事件
```

#### 3.2.3 Event Stream 事件格式

```typescript
// 小北前端期望的事件格式

interface XiaoBeiEvent {
  type: EventType;
  event_id: string;
  run_id: string;
  thread_id: string;
  block_id: string;
  timestamp: number;
  data: EventData;
}

type EventType = 
  | "RUN_START" | "RUN_END" | "RUN_ERROR"
  | "AGENT_START" | "AGENT_RUNNING" | "AGENT_END"
  | "MESSAGE_START" | "MESSAGE_RUNNING" | "MESSAGE_END"
  | "TOOL_START" | "TOOL_RUNNING" | "TOOL_END" | "TOOL_ERROR";

// MESSAGE_RUNNING 事件（流式文本）
interface MessageRunningData {
  content: string;  // 增量文本
}

// TOOL_START 事件
interface ToolStartData {
  tool_name: string;
  tool_input: object;
}

// TOOL_END 事件
interface ToolEndData {
  tool_name: string;
  tool_output: object;
}
```

### 3.3 实现代码（TypeScript）

#### 3.3.1 小北 API 适配器

```typescript
// src/xiaobei-adapter/index.ts
// 在 Openclaw 中新增的小北 API 兼容层

import { Hono } from "hono";
import { AgentRunner } from "../agents/pi-embedded-runner";
import { EventStreamClient } from "./event-stream-client";

// 小北 API 适配器
// 功能：将小北 API 协议转换为 Openclaw 内部调用
// 端点：/v1/config, /v1/chat_async, /v1/task/:id, /v1/cancel_task
// 作者：Openclaw-XiaoBei Integration
export function createXiaoBeiAdapter(agentRunner: AgentRunner) {
  const app = new Hono();
  
  // 全局配置存储
  let globalConfig: any = {};
  
  // 任务状态存储
  const tasks = new Map<string, TaskState>();
  
  // ========== POST /v1/config ==========
  app.post("/v1/config", async (c) => {
    const body = await c.req.json();
    globalConfig = body.configs;
    
    // 应用配置到 Openclaw
    if (globalConfig.MAIN_AGENT) {
      agentRunner.setModelConfig({
        provider: "anthropic",
        model: globalConfig.MAIN_AGENT.model,
        apiKey: globalConfig.MAIN_AGENT.api_key,
        baseUrl: globalConfig.MAIN_AGENT.base_url,
      });
    }
    
    return c.json({ success: true });
  });
  
  // ========== GET /v1/config ==========
  app.get("/v1/config", (c) => {
    return c.json(globalConfig);
  });
  
  // ========== POST /v1/chat_async ==========
  app.post("/v1/chat_async", async (c) => {
    const body = await c.req.json();
    const { task_id, message, context } = body;
    
    // 创建任务状态
    tasks.set(task_id, {
      status: "running",
      startedAt: Date.now(),
    });
    
    // 创建事件流客户端
    const eventStream = new EventStreamClient(globalConfig.event_stream);
    
    // 异步执行 Agent
    runAgentAsync(agentRunner, {
      taskId: task_id,
      message,
      threadId: context?.thread_id || task_id,
      eventStream,
      tasks,
      workspaceDir: globalConfig.workspace_dir,
    });
    
    // 立即返回
    return c.json({
      task_id,
      status: "accepted",
    });
  });
  
  // ========== GET /v1/task/:id ==========
  app.get("/v1/task/:id", (c) => {
    const taskId = c.req.param("id");
    const task = tasks.get(taskId);
    
    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }
    
    return c.json({
      task_id: taskId,
      status: task.status,
      result: task.result,
      error: task.error,
    });
  });
  
  // ========== POST /v1/cancel_task ==========
  app.post("/v1/cancel_task", async (c) => {
    const body = await c.req.json();
    const { task_id } = body;
    
    const task = tasks.get(task_id);
    if (task && task.abortController) {
      task.abortController.abort();
      task.status = "cancelled";
    }
    
    return c.json({ success: true });
  });
  
  // ========== GET /health ==========
  app.get("/health", (c) => {
    return c.json({ status: "ok" });
  });
  
  return app;
}

// 异步执行 Agent
async function runAgentAsync(
  agentRunner: AgentRunner,
  options: RunOptions
) {
  const { taskId, message, threadId, eventStream, tasks, workspaceDir } = options;
  
  const task = tasks.get(taskId)!;
  task.abortController = new AbortController();
  
  try {
    // 发送 RUN_START 事件
    await eventStream.send({
      type: "RUN_START",
      run_id: taskId,
      thread_id: threadId,
      timestamp: Date.now(),
      data: {},
    });
    
    // 运行 Agent
    const result = await agentRunner.run({
      message,
      signal: task.abortController.signal,
      workDir: workspaceDir,
      
      // 流式回调
      onTextChunk: async (chunk) => {
        await eventStream.send({
          type: "MESSAGE_RUNNING",
          run_id: taskId,
          thread_id: threadId,
          timestamp: Date.now(),
          data: { content: chunk },
        });
      },
      
      // 工具调用回调
      onToolStart: async (toolName, toolInput) => {
        await eventStream.send({
          type: "TOOL_START",
          run_id: taskId,
          thread_id: threadId,
          timestamp: Date.now(),
          data: { tool_name: toolName, tool_input: toolInput },
        });
      },
      
      onToolEnd: async (toolName, toolOutput) => {
        await eventStream.send({
          type: "TOOL_END",
          run_id: taskId,
          thread_id: threadId,
          timestamp: Date.now(),
          data: { tool_name: toolName, tool_output: toolOutput },
        });
      },
    });
    
    // 发送 RUN_END 事件
    await eventStream.send({
      type: "RUN_END",
      run_id: taskId,
      thread_id: threadId,
      timestamp: Date.now(),
      data: { result },
    });
    
    task.status = "completed";
    task.result = result;
    
  } catch (error) {
    // 发送 RUN_ERROR 事件
    await eventStream.send({
      type: "RUN_ERROR",
      run_id: taskId,
      thread_id: threadId,
      timestamp: Date.now(),
      data: { error: String(error) },
    });
    
    task.status = "failed";
    task.error = String(error);
  }
}
```

#### 3.3.2 Event Stream 客户端

```typescript
// src/xiaobei-adapter/event-stream-client.ts
// 向小北前端推送事件

// Event Stream 客户端
// 功能：将 Openclaw 的事件转换为小北格式，推送到前端
// 协议：HTTP POST 到配置的 event_stream.url
// 作者：Openclaw-XiaoBei Integration
export class EventStreamClient {
  private url: string;
  private apiKey: string;
  private apiKeyHeader: string;
  
  constructor(config: EventStreamConfig) {
    this.url = config.url;
    this.apiKey = config.api_key;
    this.apiKeyHeader = config.api_key_header || "X-API-Key";
  }
  
  async send(event: XiaoBeiEvent): Promise<void> {
    try {
      await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [this.apiKeyHeader]: this.apiKey,
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error("Failed to send event:", error);
    }
  }
}
```

#### 3.3.3 工具名称映射

```typescript
// src/xiaobei-adapter/tool-mapping.ts
// Openclaw 工具名 → 小北工具名 映射

// 工具名称映射表
// Openclaw 使用 snake_case，小北使用 PascalCase
// 需要双向映射以保持兼容
const TOOL_NAME_MAP: Record<string, string> = {
  // Openclaw → 小北
  "file_read": "Read",
  "file_write": "Write",
  "file_edit": "Edit",
  "directory_list": "ls",
  "shell_exec": "RunCode",
  "web_search": "Search",
  "browser_navigate": "BrowserNavigate",
  "browser_screenshot": "BrowserScreenshot",
};

// 反向映射
const REVERSE_MAP: Record<string, string> = {};
for (const [k, v] of Object.entries(TOOL_NAME_MAP)) {
  REVERSE_MAP[v] = k;
}

// 转换工具名（Openclaw → 小北）
export function toXiaoBeiToolName(openclawName: string): string {
  return TOOL_NAME_MAP[openclawName] || openclawName;
}

// 转换工具名（小北 → Openclaw）
export function toOpenclawToolName(xiaobeiName: string): string {
  return REVERSE_MAP[xiaobeiName] || xiaobeiName;
}
```

### 3.4 集成到 Openclaw Gateway

```typescript
// src/gateway/server.impl.ts
// 修改 Openclaw Gateway，添加小北 API 支持

import { createXiaoBeiAdapter } from "../xiaobei-adapter";

export async function startGatewayServer(options: GatewayOptions) {
  const app = new Hono();
  
  // ... 现有的 Openclaw 路由 ...
  
  // 添加小北 API 兼容层
  if (options.enableXiaoBeiAPI) {
    const xiaobeiAdapter = createXiaoBeiAdapter(agentRunner);
    app.route("/", xiaobeiAdapter);
    
    console.log("✅ 小北 API 兼容层已启用");
    console.log("   POST /v1/config");
    console.log("   POST /v1/chat_async");
    console.log("   GET  /v1/task/:id");
  }
  
  // 启动服务器
  const server = serve({
    fetch: app.fetch,
    port: options.port || 18789,
  });
  
  return server;
}
```

### 3.5 配置文件

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
    "host": "0.0.0.0",
    
    // 启用小北 API 兼容
    "enableXiaoBeiAPI": true
  },
  
  // 工具配置
  "tools": {
    "exec": {
      "security": "allow"  // 允许命令执行
    },
    "browser": {
      "enabled": true
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

## 4. 方案 B 详细设计：小北 + Openclaw MCP Server

### 4.1 架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    整合架构：小北 + Openclaw MCP                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                      小北前端 (Vide FDE)                            │    │
│  └─────────────────────────────┬──────────────────────────────────────┘    │
│                                │                                           │
│                                │ 小北 API                                  │
│                                ▼                                           │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    northau-xiaobei (保持不变)                       │    │
│  │                                                                     │    │
│  │  - Agent 逻辑                                                       │    │
│  │  - 现有工具 (飞书、搜索、图像等)                                     │    │
│  │  - MCP 支持 ←──────────────────────────────────────────────┐       │    │
│  └─────────────────────────────┬──────────────────────────────┼───────┘    │
│                                │                               │            │
│                                │ 标准 MCP 协议                 │ MCP        │
│                                ▼                               │            │
│  ┌────────────────────────────────────────────────────────────┴───────┐    │
│  │                    Openclaw MCP Server (新增)                       │    │
│  │                                                                     │    │
│  │  提供 MCP 工具:                                                     │    │
│  │  - local/read_file                                                 │    │
│  │  - local/write_file                                                │    │
│  │  - local/edit_file                                                 │    │
│  │  - local/list_dir                                                  │    │
│  │  - local/exec_shell                                                │    │
│  │  - local/browser_*                                                 │    │
│  │  - local/git_*                                                     │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                │                                           │
│                                ▼                                           │
│                          本地文件系统 / 命令执行                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 MCP Server 实现

```typescript
// openclaw-mcp-server/index.ts
// Openclaw 作为 MCP Server，提供本地执行能力

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Openclaw MCP Server
// 功能：将 Openclaw 的本地执行能力暴露为 MCP 工具
// 协议：MCP (Model Context Protocol)
// 适配：供 northau-xiaobei 调用
// 作者：Openclaw-XiaoBei Integration
const server = new Server(
  {
    name: "openclaw-local",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ========== 注册工具 ==========

// 读取文件
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case "local/read_file":
      return await readFile(args.path);
      
    case "local/write_file":
      return await writeFile(args.path, args.content);
      
    case "local/edit_file":
      return await editFile(args.path, args.old_string, args.new_string);
      
    case "local/list_dir":
      return await listDir(args.path);
      
    case "local/exec_shell":
      return await execShell(args.command, args.work_dir);
      
    case "local/browser_navigate":
      return await browserNavigate(args.url);
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// 列出可用工具
server.setRequestHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "local/read_file",
        description: "读取本地文件内容",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "文件路径" }
          },
          required: ["path"]
        }
      },
      {
        name: "local/write_file",
        description: "写入本地文件",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "文件路径" },
            content: { type: "string", description: "文件内容" }
          },
          required: ["path", "content"]
        }
      },
      {
        name: "local/exec_shell",
        description: "执行本地 Shell 命令",
        inputSchema: {
          type: "object",
          properties: {
            command: { type: "string", description: "命令" },
            work_dir: { type: "string", description: "工作目录" }
          },
          required: ["command"]
        }
      },
      // ... 更多工具
    ]
  };
});

// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 4.3 小北配置 MCP Server

```yaml
# northau-xiaobei Agent YAML 配置
# 添加 Openclaw MCP Server

name: main_agent
# ... 其他配置 ...

mcp_servers:
  - name: openclaw-local
    command: "node"
    args: ["/path/to/openclaw-mcp-server/index.js"]
    # 或者通过网络连接
    # url: "http://localhost:18790/mcp"
```

---

## 5. 方案对比与推荐

### 5.1 详细对比

| 维度 | 方案 A (API 兼容) | 方案 B (MCP) |
|-----|-----------------|-------------|
| **小北前端** | 直接连接 Openclaw | 连接 northau-xiaobei |
| **Agent 逻辑** | 使用 Openclaw Agent | 使用 northau-xiaobei Agent |
| **本地执行** | Openclaw 原生 | 通过 MCP 调用 Openclaw |
| **改动范围** | 在 Openclaw 新增 API | 在 Openclaw 新增 MCP Server |
| **前端改动** | 无需改动 | 无需改动 |
| **耦合度** | 紧耦合 | 松耦合 |
| **维护成本** | 需要同步两边协议 | 各自独立演进 |

### 5.2 推荐

**如果你想要**：
- 完全用 Openclaw 替代 northau-xiaobei → **方案 A**
- 保留 northau-xiaobei，只补充本地执行能力 → **方案 B**

**我的推荐**：

- **短期**：选择 **方案 B (MCP)**，风险低，改动小
- **长期**：考虑 **方案 A (API 兼容)**，更彻底的整合

---

## 6. 实施步骤

### 6.1 方案 A 实施步骤

| 阶段 | 任务 | 工作量 |
|-----|------|-------|
| 1 | 在 Openclaw 中创建 `xiaobei-adapter` 目录 | 1天 |
| 2 | 实现 `/v1/config` API | 1天 |
| 3 | 实现 `/v1/chat_async` API | 2天 |
| 4 | 实现 Event Stream 客户端 | 1天 |
| 5 | 工具名称映射 | 1天 |
| 6 | 测试与小北前端对接 | 2天 |
| **总计** | | **~8天** |

### 6.2 方案 B 实施步骤

| 阶段 | 任务 | 工作量 |
|-----|------|-------|
| 1 | 创建 `openclaw-mcp-server` 项目 | 1天 |
| 2 | 实现 MCP Server 基础框架 | 1天 |
| 3 | 实现文件操作工具 | 1天 |
| 4 | 实现命令执行工具 | 1天 |
| 5 | 在 northau-xiaobei 中配置 MCP | 0.5天 |
| 6 | 测试 | 1天 |
| **总计** | | **~5.5天** |

---

## 7. 使用示例

### 7.1 方案 A：小北前端直连 Openclaw

```
启动:
$ openclaw gateway --enable-xiaobei-api

小北前端配置:
  API 地址: http://localhost:18789

用户: "帮我在 ~/projects/myapp 下执行 npm install"

处理流程:
1. 小北前端 POST /v1/chat_async
2. Openclaw 接收请求，启动 Agent
3. Agent 调用 shell_exec 工具
4. 本地执行 npm install
5. 通过 Event Stream 推送结果
6. 小北前端显示结果
```

### 7.2 方案 B：小北通过 MCP 调用 Openclaw

```
启动:
$ node openclaw-mcp-server/index.js  # MCP Server
$ python northau-xiaobei/server.py   # 小北

小北 Agent 配置:
  mcp_servers:
    - name: openclaw-local
      command: node
      args: [openclaw-mcp-server/index.js]

用户: "帮我读取 ~/projects/myapp/package.json"

处理流程:
1. 小北前端调用 northau-xiaobei
2. northau-xiaobei Agent 决定调用 local/read_file 工具
3. 通过 MCP 协议调用 Openclaw MCP Server
4. Openclaw 读取本地文件
5. 返回文件内容
6. 小北前端显示结果
```

---

## 8. 总结

### 8.1 核心价值

无论选择哪个方案，整合后都能实现：

- ✅ **小北前端保持不变**，用户体验一致
- ✅ **获得本地执行能力**，可以操作本地文件、执行命令
- ✅ **灵活选择**，本地执行 or 云端沙箱
- ✅ **零额外费用**，本地执行不需要 E2B

### 8.2 推荐路径

```
阶段 1: 实现方案 B (MCP)
       - 风险低，改动小
       - 快速获得本地执行能力

阶段 2: 评估是否需要方案 A
       - 如果 northau-xiaobei 的 Agent 逻辑不够好
       - 可以切换到 Openclaw Agent
```

---

*文档结束*
