# 小北 + Openclaw 本地执行后端 设计文档

> **版本**: v1.0  
> **日期**: 2026-02-03  
> **状态**: 设计阶段

---

## 1. 概述

### 1.1 背景

当前小北平台使用 E2B 云端沙箱作为代码执行环境，存在以下限制：
- ❌ 无法访问用户本地文件系统
- ❌ 无法连接本地数据库/服务
- ❌ 有网络延迟
- ❌ 需要付费

Openclaw 是一个可以在本地运行的 AI Agent 框架，拥有强大的本地执行能力。

### 1.2 目标

将 Openclaw 作为小北的**本地执行后端**，让用户可以：
- ✅ 在本地执行代码和命令
- ✅ 访问本地文件、数据库、服务
- ✅ 灵活选择「本地模式」或「沙箱模式」

### 1.3 一句话描述

> **小北负责 AI 思考和任务调度，Openclaw 负责本地执行，E2B 作为安全沙箱备选。**

---

## 2. 架构设计

### 2.1 新架构总览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        小北 + Openclaw 整合架构                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      用户入口层（任选其一）                           │   │
│  │                                                                      │   │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │   │ Vide FDE │  │   飞书   │  │ WhatsApp │  │ Telegram │  ...      │   │
│  │   │ (Web UI) │  │ (企业IM) │  │ (个人IM) │  │ (个人IM) │           │   │
│  │   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │   │
│  └────────┼─────────────┼─────────────┼─────────────┼──────────────────┘   │
│           │             │             │             │                      │
│           └─────────────┴──────┬──────┴─────────────┘                      │
│                                ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     小北 Core（AI 大脑）                              │   │
│  │                                                                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │ north-app-core  │  │  north-deer-flow │  │ northau-xiaobei │     │   │
│  │  │ (任务调度/API)  │  │  (深度研究引擎)  │  │  (Agent 逻辑)   │     │   │
│  │  │    Go + gRPC    │  │ Python+LangGraph │  │ Python+FastAPI  │     │   │
│  │  └────────┬────────┘  └─────────────────┘  └─────────────────┘     │   │
│  │           │                                                         │   │
│  │           ▼                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │              Workspace Router（工作空间路由器）               │   │   │
│  │  │                                                              │   │   │
│  │  │   配置: workspace_type = "local" | "sandbox" | "auto"        │   │   │
│  │  └──────────────────────────┬──────────────────────────────────┘   │   │
│  └─────────────────────────────┼───────────────────────────────────────┘   │
│                                │                                           │
│               ┌────────────────┴────────────────┐                         │
│               ▼                                 ▼                         │
│  ┌───────────────────────────┐   ┌───────────────────────────┐           │
│  │   🖥️ LOCAL (本地模式)      │   │   ☁️ SANDBOX (沙箱模式)    │           │
│  │                           │   │                           │           │
│  │  ┌─────────────────────┐  │   │  ┌─────────────────────┐  │           │
│  │  │  Openclaw Gateway   │  │   │  │       E2B API       │  │           │
│  │  │  ws://localhost:    │  │   │  │   api.e2b.dev       │  │           │
│  │  │       18789         │  │   │  └─────────────────────┘  │           │
│  │  └─────────────────────┘  │   │                           │           │
│  │                           │   │  特点:                    │           │
│  │  能力:                    │   │  ✅ 完全隔离              │           │
│  │  ✅ 本地文件读写          │   │  ✅ 安全执行              │           │
│  │  ✅ Shell 命令执行        │   │  ✅ 资源限制              │           │
│  │  ✅ 浏览器自动化          │   │  ❌ 无法访问本地          │           │
│  │  ✅ Git 操作              │   │  💰 按量付费              │           │
│  │  ✅ 零延迟                │   │                           │           │
│  │  ✅ 免费                  │   │  适用:                    │           │
│  │                           │   │  - 不信任的代码           │           │
│  │  适用:                    │   │  - 多租户环境             │           │
│  │  - 开发调试               │   │  - 生产隔离               │           │
│  │  - 本地项目操作           │   │                           │           │
│  │  - 个人 AI 助手           │   │                           │           │
│  └───────────────────────────┘   └───────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 核心组件

| 组件 | 职责 | 技术栈 |
|-----|------|-------|
| **小北 Core** | AI 思考、任务调度、API 网关 | Go + gRPC |
| **Workspace Router** | 根据配置选择执行后端 | Go |
| **Openclaw Adapter** | 连接 Openclaw Gateway | Go (WebSocket) |
| **Sandbox Adapter** | 连接 E2B API | Go (HTTP) |
| **Openclaw Gateway** | 本地执行引擎 | TypeScript (Node.js) |

### 2.3 数据流

```
用户请求: "帮我在 ~/projects/myapp 下执行 npm install"
                    │
                    ▼
            ┌───────────────┐
            │   小北 Core   │  解析意图，识别为代码执行任务
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │ Workspace     │  检查配置 → workspace_type = "local"
            │ Router        │
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │ Openclaw      │  通过 WebSocket 发送执行请求
            │ Adapter       │
            └───────┬───────┘
                    │ ws://localhost:18789
                    ▼
            ┌───────────────┐
            │ Openclaw      │  在用户本地机器执行 npm install
            │ Gateway       │
            └───────┬───────┘
                    │
                    ▼
            执行结果返回给用户
```

---

## 3. 详细设计

### 3.1 Workspace 配置

```yaml
# north-app-core/etc/core.yaml

Workspace:
  # 默认执行模式
  DefaultType: local  # local | sandbox | auto
  
  # 本地模式 (Openclaw)
  Local:
    Enabled: true
    URL: "ws://localhost:18789"
    Token: ""
    WorkDir: "/Users/xxx/workspace"
    AllowedPaths:
      - "/Users/xxx/projects"
      - "/tmp"
  
  # 沙箱模式 (E2B)
  Sandbox:
    Enabled: true
    Provider: "e2b"
    APIKey: "${E2B_API_KEY}"
    Timeout: 60
  
  # 自动选择策略
  Auto:
    Default: "local"
    UseSandboxWhen:
      - untrusted_code
      - external_source
```

### 3.2 统一执行器接口

```go
// internal/executor/interface.go

package executor

import "context"

// Executor 统一执行器接口
// 抽象本地执行和沙箱执行，调用方无需关心底层实现
type Executor interface {
    // 代码执行
    ExecuteCode(ctx context.Context, req *CodeRequest) (*CodeResult, error)
    
    // Shell 命令
    ExecuteShell(ctx context.Context, req *ShellRequest) (*ShellResult, error)
    
    // 文件操作
    ReadFile(ctx context.Context, path string) ([]byte, error)
    WriteFile(ctx context.Context, path string, content []byte) error
    EditFile(ctx context.Context, path, oldStr, newStr string) error
    ListDir(ctx context.Context, path string) ([]FileInfo, error)
    
    // 类型
    Type() WorkspaceType
    
    // 关闭
    Close() error
}

// CodeRequest 代码执行请求
type CodeRequest struct {
    Code     string
    Language string  // python | javascript | bash
    WorkDir  string
    Timeout  int
}

// CodeResult 代码执行结果
type CodeResult struct {
    Stdout   string
    Stderr   string
    ExitCode int
}
```

### 3.3 Openclaw Adapter 实现

```go
// internal/adapter/openclaw.go

package adapter

import (
    "context"
    "encoding/json"
    "github.com/gorilla/websocket"
)

// OpenclawAdapter 连接 Openclaw Gateway 执行本地操作
type OpenclawAdapter struct {
    url   string
    token string
    conn  *websocket.Conn
}

// NewOpenclawAdapter 创建适配器
func NewOpenclawAdapter(url, token string) *OpenclawAdapter {
    return &OpenclawAdapter{url: url, token: token}
}

// Connect 连接到 Openclaw Gateway
func (a *OpenclawAdapter) Connect(ctx context.Context) error {
    conn, _, err := websocket.DefaultDialer.DialContext(ctx, a.url, nil)
    if err != nil {
        return err
    }
    a.conn = conn
    return nil
}

// ExecuteShell 执行 Shell 命令
func (a *OpenclawAdapter) ExecuteShell(ctx context.Context, command, workDir string) (*ShellResult, error) {
    return a.invoke(ctx, "shell_exec", map[string]interface{}{
        "command":  command,
        "work_dir": workDir,
    })
}

// ReadFile 读取文件
func (a *OpenclawAdapter) ReadFile(ctx context.Context, path string) ([]byte, error) {
    result, err := a.invoke(ctx, "file_read", map[string]interface{}{
        "path": path,
    })
    if err != nil {
        return nil, err
    }
    return []byte(result.Content), nil
}

// WriteFile 写入文件
func (a *OpenclawAdapter) WriteFile(ctx context.Context, path string, content []byte) error {
    _, err := a.invoke(ctx, "file_write", map[string]interface{}{
        "path":    path,
        "content": string(content),
    })
    return err
}

// invoke 内部 RPC 调用
func (a *OpenclawAdapter) invoke(ctx context.Context, tool string, params map[string]interface{}) (*Result, error) {
    request := map[string]interface{}{
        "jsonrpc": "2.0",
        "method":  "tools.invoke",
        "params": map[string]interface{}{
            "tool":   tool,
            "params": params,
        },
        "id": time.Now().UnixNano(),
    }
    
    if err := a.conn.WriteJSON(request); err != nil {
        return nil, err
    }
    
    var response RPCResponse
    if err := a.conn.ReadJSON(&response); err != nil {
        return nil, err
    }
    
    if response.Error != nil {
        return nil, fmt.Errorf("openclaw error: %s", response.Error.Message)
    }
    
    return response.Result, nil
}

// Close 关闭连接
func (a *OpenclawAdapter) Close() error {
    if a.conn != nil {
        return a.conn.Close()
    }
    return nil
}
```

### 3.4 Workspace Router 实现

```go
// internal/executor/router.go

package executor

import "context"

// WorkspaceRouter 工作空间路由器
// 根据配置和任务类型选择合适的执行器
type WorkspaceRouter struct {
    config      *WorkspaceConfig
    localExec   Executor  // Openclaw
    sandboxExec Executor  // E2B
}

// NewWorkspaceRouter 创建路由器
func NewWorkspaceRouter(config *WorkspaceConfig) (*WorkspaceRouter, error) {
    router := &WorkspaceRouter{config: config}
    
    // 初始化本地执行器 (Openclaw)
    if config.Local.Enabled {
        adapter := adapter.NewOpenclawAdapter(config.Local.URL, config.Local.Token)
        if err := adapter.Connect(context.Background()); err != nil {
            return nil, fmt.Errorf("连接 Openclaw 失败: %w", err)
        }
        router.localExec = NewOpenclawExecutor(adapter, config.Local.WorkDir)
    }
    
    // 初始化沙箱执行器 (E2B)
    if config.Sandbox.Enabled {
        router.sandboxExec = NewSandboxExecutor(config.Sandbox)
    }
    
    return router, nil
}

// GetExecutor 获取执行器
func (r *WorkspaceRouter) GetExecutor(workspaceType WorkspaceType, taskContext *TaskContext) (Executor, error) {
    actualType := workspaceType
    
    // 自动模式：根据任务上下文决定
    if actualType == WorkspaceAuto {
        actualType = r.autoSelect(taskContext)
    }
    
    switch actualType {
    case WorkspaceLocal:
        if r.localExec == nil {
            return nil, fmt.Errorf("本地模式未启用")
        }
        return r.localExec, nil
        
    case WorkspaceSandbox:
        if r.sandboxExec == nil {
            return nil, fmt.Errorf("沙箱模式未启用")
        }
        return r.sandboxExec, nil
        
    default:
        return nil, fmt.Errorf("未知的工作空间类型: %s", actualType)
    }
}

// autoSelect 自动选择执行器
func (r *WorkspaceRouter) autoSelect(ctx *TaskContext) WorkspaceType {
    // 不信任的代码 → 沙箱
    if ctx.IsUntrustedCode {
        return WorkspaceSandbox
    }
    
    // 外部来源 → 沙箱
    if ctx.IsExternalSource {
        return WorkspaceSandbox
    }
    
    // 默认 → 本地
    return WorkspaceLocal
}
```

### 3.5 任务执行流程

```go
// internal/service/task_service.go

package service

// TaskService 任务服务
type TaskService struct {
    router *executor.WorkspaceRouter
}

// ExecuteTask 执行任务
func (s *TaskService) ExecuteTask(ctx context.Context, task *Task) (*TaskResult, error) {
    // 1. 获取用户配置的工作空间类型
    workspaceType := task.WorkspaceType
    if workspaceType == "" {
        workspaceType = s.config.DefaultWorkspaceType
    }
    
    // 2. 构建任务上下文
    taskContext := &executor.TaskContext{
        IsUntrustedCode:  task.IsUntrustedCode,
        IsExternalSource: task.Source == "external",
    }
    
    // 3. 获取执行器
    exec, err := s.router.GetExecutor(workspaceType, taskContext)
    if err != nil {
        return nil, err
    }
    
    // 4. 执行任务
    switch task.Type {
    case TaskTypeCode:
        result, err := exec.ExecuteCode(ctx, &executor.CodeRequest{
            Code:     task.Code,
            Language: task.Language,
            WorkDir:  task.WorkDir,
        })
        if err != nil {
            return nil, err
        }
        return &TaskResult{
            Output:   result.Stdout,
            Error:    result.Stderr,
            ExitCode: result.ExitCode,
        }, nil
        
    case TaskTypeShell:
        result, err := exec.ExecuteShell(ctx, &executor.ShellRequest{
            Command: task.Command,
            WorkDir: task.WorkDir,
        })
        if err != nil {
            return nil, err
        }
        return &TaskResult{
            Output:   result.Stdout,
            Error:    result.Stderr,
            ExitCode: result.ExitCode,
        }, nil
        
    case TaskTypeFileRead:
        content, err := exec.ReadFile(ctx, task.FilePath)
        if err != nil {
            return nil, err
        }
        return &TaskResult{Output: string(content)}, nil
        
    default:
        return nil, fmt.Errorf("未知的任务类型: %s", task.Type)
    }
}
```

---

## 4. Openclaw 配置

Openclaw 作为本地执行后端，需要在用户机器上运行。

### 4.1 安装 Openclaw

```bash
# 安装
npm install -g openclaw-cn@latest

# 验证安装
openclaw --version
```

### 4.2 配置文件

```json5
// ~/.openclaw/openclaw.json

{
  // Agent 配置（Openclaw 自己的 AI，可选）
  "agent": {
    "model": "anthropic/claude-sonnet-4"
  },
  
  // Gateway 配置（供小北连接）
  "gateway": {
    "port": 18789,
    "host": "127.0.0.1"  // 仅本地访问
  },
  
  // 安全配置
  "security": {
    "allowed_directories": [
      "/Users/xxx/projects",
      "/Users/xxx/workspace",
      "/tmp"
    ],
    "blocked_commands": [
      "rm -rf /",
      "sudo rm -rf",
      "mkfs"
    ]
  }
}
```

### 4.3 启动 Gateway

```bash
# 启动 Openclaw Gateway（供小北连接）
openclaw gateway

# 或后台运行
openclaw gateway &

# 检查状态
curl http://localhost:18789/health
```

---

## 5. 前端设计

### 5.1 工作空间设置页面

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚙️ 设置 > 工作空间                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  执行模式                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ● 本地模式                                               │   │
│  │   在你的电脑上执行，可访问本地文件                          │   │
│  │   ✅ 零延迟  ✅ 免费  ✅ 可访问本地                         │   │
│  │                                                          │   │
│  │ ○ 云端沙箱                                               │   │
│  │   在云端隔离环境执行，更安全                               │   │
│  │   ✅ 隔离安全  ⚠️ 有延迟  💰 付费                          │   │
│  │                                                          │   │
│  │ ○ 智能模式                                               │   │
│  │   自动选择（信任代码用本地，不信任用沙箱）                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  本地模式配置                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Openclaw 地址  [ws://localhost:18789    ]                │   │
│  │ 工作目录       [/Users/xxx/workspace    ] [📁]           │   │
│  │ 连接状态       ● 已连接                                   │   │
│  │               [🔄 测试连接]                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                        [取消]  [保存]           │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 API 接口

```typescript
// 获取工作空间配置
GET /api/v1/workspace/config
Response: {
  type: "local" | "sandbox" | "auto",
  local: {
    enabled: boolean,
    url: string,
    connected: boolean
  },
  sandbox: {
    enabled: boolean,
    provider: string
  }
}

// 更新工作空间配置
PATCH /api/v1/workspace/config
Body: {
  type: "local",
  local: {
    url: "ws://localhost:18789",
    workDir: "/Users/xxx/workspace"
  }
}

// 测试 Openclaw 连接
POST /api/v1/workspace/test-connection
Body: {
  url: "ws://localhost:18789"
}
Response: {
  success: boolean,
  version: "2026.2.3",
  error?: string
}
```

---

## 6. 实施计划

### 6.1 阶段一：核心连通（1周）

- [ ] 定义 `Executor` 统一接口
- [ ] 实现 `OpenclawAdapter`（WebSocket 通信）
- [ ] 实现 `WorkspaceRouter`
- [ ] 添加 `Workspace` 配置项
- [ ] 基础测试

### 6.2 阶段二：功能完善（1周）

- [ ] 实现所有文件操作（Read/Write/Edit/List）
- [ ] 实现 Shell 命令执行
- [ ] 实现代码执行（Python/JS/Bash）
- [ ] 添加安全限制（路径白名单、命令黑名单）
- [ ] 错误处理和重连机制

### 6.3 阶段三：前端集成（1周）

- [ ] 添加工作空间设置页面
- [ ] 实现配置 API
- [ ] 连接状态显示
- [ ] 用户引导流程

### 6.4 阶段四：测试优化（1周）

- [ ] 端到端测试
- [ ] 性能测试
- [ ] 安全审计
- [ ] 文档完善

---

## 7. 使用示例

### 7.1 场景：本地项目开发

```
用户: 帮我在 ~/projects/myapp 下执行 npm install，然后启动开发服务器

小北处理:
1. 检查配置 → workspace_type = "local"
2. 通过 Openclaw 执行:
   - shell_exec("npm install", "~/projects/myapp")
   - shell_exec("npm run dev", "~/projects/myapp")
3. 返回执行结果

结果: 
- 直接在用户本地执行
- 使用本地的 npm 缓存（更快）
- 服务启动在 localhost:3000
```

### 7.2 场景：读取本地文件

```
用户: 帮我读取 ~/projects/myapp/package.json 的内容

小北处理:
1. 检查配置 → workspace_type = "local"
2. 通过 Openclaw 执行:
   - file_read("~/projects/myapp/package.json")
3. 返回文件内容

结果: 直接读取用户本地文件
```

### 7.3 场景：执行不信任代码（自动切换沙箱）

```
用户: 帮我执行这段从网上复制的代码
[代码来源标记为外部]

小北处理:
1. 检查配置 → workspace_type = "auto"
2. 检测任务上下文 → 代码来源为外部/不信任
3. 自动选择 → sandbox 模式
4. 通过 E2B 执行代码

结果: 在云端隔离环境执行，保护本地系统安全
```

---

## 8. 安全考虑

### 8.1 本地模式安全措施

| 措施 | 说明 |
|-----|------|
| **路径白名单** | 只允许访问配置的目录 |
| **命令黑名单** | 禁止危险命令（rm -rf /、sudo等） |
| **确认机制** | 敏感操作前需用户确认 |
| **本地监听** | Gateway 仅监听 127.0.0.1 |

### 8.2 自动切换策略

以下情况自动使用沙箱模式：
- 代码来源为外部/不信任
- 用户明确要求隔离执行
- 多租户环境

---

## 9. 常见问题

**Q: Openclaw 需要一直运行吗？**  
A: 是的，需要保持 `openclaw gateway` 运行。可以设置为系统服务自动启动。

**Q: 本地模式和沙箱模式可以混用吗？**  
A: 可以。使用「智能模式」会根据任务类型自动选择。

**Q: 如果 Openclaw 连接断开怎么办？**  
A: 系统会自动尝试重连。如果失败，可以自动回退到沙箱模式。

**Q: 支持 Windows 吗？**  
A: Openclaw 支持 macOS/Linux/Windows，但部分功能在 Windows 上可能有差异。

---

## 10. 总结

### 10.1 核心价值

| 之前 | 之后 |
|-----|------|
| 只能用云端沙箱 | 可选本地或沙箱 |
| 无法访问本地文件 | ✅ 完全访问本地 |
| 有网络延迟 | ✅ 零延迟（本地） |
| E2B 付费 | ✅ 本地免费 |

### 10.2 架构总结

```
小北 = AI 大脑（思考、调度）
     + Openclaw（本地执行）  ← 新增
     + E2B（云端沙箱）       ← 保留
```

### 10.3 下一步

1. 确认设计方案
2. 开始阶段一开发
3. 持续迭代优化

---

*文档结束*
