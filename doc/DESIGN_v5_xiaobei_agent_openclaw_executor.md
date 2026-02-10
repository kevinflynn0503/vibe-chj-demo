# 小北本地客户端设计方案 v5

> **版本**: v5.0  
> **日期**: 2026-02-03  
> **核心思想**: northau-xiaobei 作为 Agent 框架 + Openclaw 作为本地执行层

---

## 1. 核心架构

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         本地客户端架构                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       用户交互层                                     │   │
│  │                                                                      │   │
│  │   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐       │   │
│  │   │   CLI 客户端  │     │   VSCode     │     │ 桌面 App     │       │   │
│  │   │  (Python)    │     │  (文件编辑)  │     │  (后续)      │       │   │
│  │   └──────┬───────┘     └──────────────┘     └──────────────┘       │   │
│  └──────────┼──────────────────────────────────────────────────────────┘   │
│             │                                                              │
│             │ 本地调用                                                     │
│             ▼                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │            northau-xiaobei（Agent 框架，保留）                        │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  Agent Core (nexau 框架)                                     │   │   │
│  │  │  - AI 模型调用 (Claude/GPT/Gemini)                          │   │   │
│  │  │  - 多轮对话管理                                              │   │   │
│  │  │  - 工具调用协调                                              │   │   │
│  │  │  - Sub-Agent 管理                                           │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                │                                    │   │
│  │  ┌─────────────────────────────▼─────────────────────────────────┐ │   │
│  │  │                        工具系统                                │ │   │
│  │  │                                                               │ │   │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │ │   │
│  │  │  │  小北原有工具    │  │  本地执行工具    │  │  研究工具    │  │ │   │
│  │  │  │  (Python)       │  │  (调用 Openclaw) │  │  (Python)   │  │ │   │
│  │  │  │                 │  │                  │  │              │  │ │   │
│  │  │  │  FeishuQuery    │  │  LocalRead ──────┼──┼─► Openclaw   │  │ │   │
│  │  │  │  FeishuChat     │  │  LocalWrite ─────┼──┼─► Openclaw   │  │ │   │
│  │  │  │  FeishuBitable  │  │  LocalExec ──────┼──┼─► Openclaw   │  │ │   │
│  │  │  │  ImageCaption   │  │  LocalBrowser ───┼──┼─► Openclaw   │  │ │   │
│  │  │  │  GenerateImage  │  │  LocalGit ───────┼──┼─► Openclaw   │  │ │   │
│  │  │  │  Search         │  │  OpenVSCode ─────┼──┼─► Openclaw   │  │ │   │
│  │  │  │  Supabase       │  │                  │  │              │  │ │   │
│  │  │  └─────────────────┘  └─────────────────┬┘  └──────────────┘  │ │   │
│  │  └──────────────────────────────────────────┼────────────────────┘ │   │
│  └─────────────────────────────────────────────┼──────────────────────┘   │
│                                                │                          │
│                                                │ WebSocket/HTTP           │
│                                                ▼                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                 Openclaw Gateway（本地执行引擎）                      │   │
│  │                 (TypeScript + Node.js)                               │   │
│  │                                                                      │   │
│  │  提供能力:                                                           │   │
│  │  ✅ file_read / file_write / file_edit                              │   │
│  │  ✅ shell_exec / script_run                                         │   │
│  │  ✅ browser_navigate / browser_screenshot                           │   │
│  │  ✅ git_clone / git_commit / git_push                               │   │
│  │  ✅ 打开 VSCode                                                     │   │
│  │                                                                      │   │
│  │  运行方式: 后台服务 ws://localhost:18789                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 核心组件

| 组件 | 技术栈 | 职责 |
|-----|-------|------|
| **northau-xiaobei** | Python + nexau | Agent 框架、AI 调用、工具协调 |
| **Openclaw Gateway** | TypeScript + Node.js | 本地执行（文件、命令、浏览器、Git） |
| **CLI 客户端** | Python | 用户交互入口 |
| **本地存储** | SQLite | Thread/Block 存储 |

### 1.3 数据流

```
用户输入: "帮我读取 ~/projects/myapp/package.json"
                    │
                    ▼
            ┌───────────────────┐
            │  northau-xiaobei  │  Agent 解析意图
            │  (Agent 框架)     │  决定调用 LocalRead 工具
            └─────────┬─────────┘
                      │
                      ▼
            ┌───────────────────┐
            │  LocalRead 工具   │  Python 工具，调用 Openclaw
            │  (Python)         │
            └─────────┬─────────┘
                      │ WebSocket
                      ▼
            ┌───────────────────┐
            │  Openclaw Gateway │  执行 file_read
            │  (本地执行引擎)   │  返回文件内容
            └─────────┬─────────┘
                      │
                      ▼
            返回文件内容给用户
```

---

## 2. 详细设计

### 2.1 Openclaw 客户端（Python）

在 northau-xiaobei 中添加 Openclaw 连接客户端：

```python
# northau-xiaobei/src/utils/openclaw_client.py

import asyncio
import json
from typing import Any, Optional
import websockets

class OpenclawClient:
    """
    Openclaw Gateway 客户端
    功能：连接本地 Openclaw Gateway，执行本地操作
    通信：WebSocket (JSON-RPC 2.0)
    作者：XiaoBei Integration
    """
    
    def __init__(self, url: str = "ws://localhost:18789", token: str = None):
        self.url = url
        self.token = token
        self.ws = None
        self._request_id = 0
    
    async def connect(self):
        """连接到 Openclaw Gateway"""
        headers = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        self.ws = await websockets.connect(self.url, extra_headers=headers)
    
    async def disconnect(self):
        """断开连接"""
        if self.ws:
            await self.ws.close()
    
    async def invoke_tool(self, tool_name: str, params: dict) -> Any:
        """
        调用 Openclaw 工具
        
        Args:
            tool_name: 工具名称 (file_read, shell_exec, etc.)
            params: 工具参数
        
        Returns:
            工具执行结果
        """
        self._request_id += 1
        
        request = {
            "jsonrpc": "2.0",
            "method": "tools.invoke",
            "params": {
                "tool": tool_name,
                "params": params,
            },
            "id": self._request_id,
        }
        
        await self.ws.send(json.dumps(request))
        response = await self.ws.recv()
        result = json.loads(response)
        
        if "error" in result:
            raise Exception(f"Openclaw error: {result['error']['message']}")
        
        return result.get("result")
    
    # ========== 便捷方法 ==========
    
    async def read_file(self, path: str) -> str:
        """读取文件"""
        result = await self.invoke_tool("file_read", {"path": path})
        return result.get("content", "")
    
    async def write_file(self, path: str, content: str) -> bool:
        """写入文件"""
        await self.invoke_tool("file_write", {"path": path, "content": content})
        return True
    
    async def edit_file(self, path: str, old_string: str, new_string: str) -> bool:
        """编辑文件"""
        await self.invoke_tool("file_edit", {
            "path": path,
            "old_string": old_string,
            "new_string": new_string,
        })
        return True
    
    async def list_dir(self, path: str) -> list:
        """列出目录"""
        result = await self.invoke_tool("directory_list", {"path": path})
        return result.get("entries", [])
    
    async def exec_shell(self, command: str, work_dir: str = None) -> dict:
        """执行 Shell 命令"""
        params = {"command": command}
        if work_dir:
            params["work_dir"] = work_dir
        result = await self.invoke_tool("shell_exec", params)
        return {
            "stdout": result.get("stdout", ""),
            "stderr": result.get("stderr", ""),
            "exit_code": result.get("exit_code", 0),
        }
    
    async def open_vscode(self, path: str, goto_line: int = None) -> bool:
        """用 VSCode 打开文件"""
        cmd = f'code "{path}"' if not goto_line else f'code --goto "{path}:{goto_line}"'
        await self.exec_shell(cmd)
        return True
    
    async def git_status(self, repo_path: str) -> str:
        """Git status"""
        result = await self.exec_shell("git status", repo_path)
        return result["stdout"]
    
    async def browser_navigate(self, url: str) -> bool:
        """浏览器导航"""
        await self.invoke_tool("browser_navigate", {"url": url})
        return True
    
    async def browser_screenshot(self) -> bytes:
        """浏览器截图"""
        result = await self.invoke_tool("browser_screenshot", {})
        import base64
        return base64.b64decode(result.get("data", ""))


# 全局客户端实例
_openclaw_client: Optional[OpenclawClient] = None

async def get_openclaw_client() -> OpenclawClient:
    """获取 Openclaw 客户端单例"""
    global _openclaw_client
    if _openclaw_client is None:
        _openclaw_client = OpenclawClient()
        await _openclaw_client.connect()
    return _openclaw_client
```

### 2.2 本地执行工具（添加到 northau-xiaobei）

```python
# northau-xiaobei/artifacts/tools/local_exec/src/local_read.py

"""
本地文件读取工具
功能：通过 Openclaw 读取本地文件
依赖：Openclaw Gateway 运行中
作者：XiaoBei Integration
"""

import asyncio
from typing import Any
from xiaobei_common.utils.openclaw_client import get_openclaw_client

async def local_read(path: str, **kwargs) -> dict:
    """
    读取本地文件
    
    Args:
        path: 文件路径
    
    Returns:
        {"content": "文件内容", "path": "文件路径"}
    """
    client = await get_openclaw_client()
    content = await client.read_file(path)
    
    return {
        "content": content,
        "path": path,
    }
```

```python
# northau-xiaobei/artifacts/tools/local_exec/src/local_write.py

"""
本地文件写入工具
功能：通过 Openclaw 写入本地文件
依赖：Openclaw Gateway 运行中
作者：XiaoBei Integration
"""

import asyncio
from typing import Any
from xiaobei_common.utils.openclaw_client import get_openclaw_client

async def local_write(path: str, content: str, **kwargs) -> dict:
    """
    写入本地文件
    
    Args:
        path: 文件路径
        content: 文件内容
    
    Returns:
        {"success": True, "path": "文件路径"}
    """
    client = await get_openclaw_client()
    await client.write_file(path, content)
    
    return {
        "success": True,
        "path": path,
    }
```

```python
# northau-xiaobei/artifacts/tools/local_exec/src/local_exec.py

"""
本地命令执行工具
功能：通过 Openclaw 在本地执行 Shell 命令
依赖：Openclaw Gateway 运行中
作者：XiaoBei Integration
"""

import asyncio
from typing import Any, Optional
from xiaobei_common.utils.openclaw_client import get_openclaw_client

async def local_exec(
    command: str, 
    work_dir: Optional[str] = None,
    **kwargs
) -> dict:
    """
    执行本地 Shell 命令
    
    Args:
        command: 要执行的命令
        work_dir: 工作目录（可选）
    
    Returns:
        {"stdout": "...", "stderr": "...", "exit_code": 0}
    """
    client = await get_openclaw_client()
    result = await client.exec_shell(command, work_dir)
    
    return result
```

```python
# northau-xiaobei/artifacts/tools/local_exec/src/open_vscode.py

"""
打开 VSCode 工具
功能：用 VSCode 打开文件或目录
依赖：Openclaw Gateway 运行中
作者：XiaoBei Integration
"""

import asyncio
from typing import Any, Optional
from xiaobei_common.utils.openclaw_client import get_openclaw_client

async def open_vscode(
    path: str, 
    goto_line: Optional[int] = None,
    **kwargs
) -> dict:
    """
    用 VSCode 打开文件
    
    Args:
        path: 文件或目录路径
        goto_line: 跳转到指定行（可选）
    
    Returns:
        {"success": True, "message": "已打开"}
    """
    client = await get_openclaw_client()
    await client.open_vscode(path, goto_line)
    
    return {
        "success": True,
        "message": f"已用 VSCode 打开: {path}",
    }
```

### 2.3 工具 YAML 配置

```yaml
# northau-xiaobei/artifacts/tools/local_exec/tool.yaml

name: LocalRead
description: |
  读取本地文件内容。
  通过 Openclaw 在本地机器上读取文件。
parameters:
  type: object
  properties:
    path:
      type: string
      description: 文件路径（绝对路径或相对于工作目录的路径）
  required:
    - path

---

name: LocalWrite
description: |
  写入本地文件。
  通过 Openclaw 在本地机器上写入文件。
parameters:
  type: object
  properties:
    path:
      type: string
      description: 文件路径
    content:
      type: string
      description: 文件内容
  required:
    - path
    - content

---

name: LocalExec
description: |
  在本地执行 Shell 命令。
  通过 Openclaw 在本地机器上执行命令。
parameters:
  type: object
  properties:
    command:
      type: string
      description: 要执行的 Shell 命令
    work_dir:
      type: string
      description: 工作目录（可选）
  required:
    - command

---

name: OpenVSCode
description: |
  用 VSCode 打开文件或目录。
  让用户可以直接在 VSCode 中编辑文件。
parameters:
  type: object
  properties:
    path:
      type: string
      description: 文件或目录路径
    goto_line:
      type: integer
      description: 跳转到指定行（可选）
  required:
    - path
```

### 2.4 Agent YAML 配置更新

```yaml
# northau-xiaobei/artifacts/agents/main/src/xiaobei_agent_main/main_agent.yaml

name: main_agent
variables:
  max_tokens: 200000
max_iterations: 100000
max_context_tokens: 600000
system_prompt: main_agent.md
system_prompt_type: jinja
max_running_subagents: 10

llm_config:
  temperature: 0.6
  max_tokens: 35000
  stream: true
  timeout: 600

tools:
  # 小北原有工具
  - name: FeishuQuery
    yaml_path: xiaobei_tool_feishu:feishu_query/tool.yaml
    binding: xiaobei_tool_feishu:feishu_query_tool
  - name: FeishuChatInteract
    yaml_path: xiaobei_tool_feishu:feishu_chat/tool.yaml
    binding: xiaobei_tool_feishu:feishu_chat_tool
  - name: Search
    yaml_path: xiaobei_tool_search:search/tool.yaml
    binding: xiaobei_tool_search:search
  - name: ImageCaption
    yaml_path: xiaobei_tool_image_caption:image_caption/tool.yaml
    binding: xiaobei_tool_image_caption:image_caption
  - name: GenerateImage
    yaml_path: xiaobei_tool_generate_image:generate_image/tool.yaml
    binding: xiaobei_tool_generate_image:generate_image
  
  # 新增：本地执行工具（通过 Openclaw）
  - name: LocalRead
    yaml_path: xiaobei_tool_local_exec:local_read/tool.yaml
    binding: xiaobei_tool_local_exec:local_read
  - name: LocalWrite
    yaml_path: xiaobei_tool_local_exec:local_write/tool.yaml
    binding: xiaobei_tool_local_exec:local_write
  - name: LocalExec
    yaml_path: xiaobei_tool_local_exec:local_exec/tool.yaml
    binding: xiaobei_tool_local_exec:local_exec
  - name: OpenVSCode
    yaml_path: xiaobei_tool_local_exec:open_vscode/tool.yaml
    binding: xiaobei_tool_local_exec:open_vscode
  - name: LocalListDir
    yaml_path: xiaobei_tool_local_exec:local_list_dir/tool.yaml
    binding: xiaobei_tool_local_exec:local_list_dir
  - name: LocalEdit
    yaml_path: xiaobei_tool_local_exec:local_edit/tool.yaml
    binding: xiaobei_tool_local_exec:local_edit
  
  # 原有的 TodoWrite、Finish 等
  - name: TodoWrite
    yaml_path: xiaobei_tool_base:todo/tool.yaml
    binding: xiaobei_tool_base:todo_write
  - name: Finish
    yaml_path: xiaobei_tool_base:finish/tool.yaml
    binding: xiaobei_tool_base:finish

sub_agents: []
mcp_servers: []
middlewares:
  - xiaobei_agent_main:event_tracking_middleware
```

---

## 3. CLI 客户端

### 3.1 启动脚本

```python
# northau-xiaobei/cli.py

"""
小北本地客户端 CLI
功能：本地交互式 Agent 对话
依赖：northau-xiaobei + Openclaw Gateway
作者：XiaoBei Team
"""

import asyncio
import argparse
import os
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

from src.utils.openclaw_client import OpenclawClient
from src.agent_runner import AgentRunner

async def check_openclaw():
    """检查 Openclaw Gateway 是否运行"""
    try:
        client = OpenclawClient()
        await client.connect()
        await client.disconnect()
        return True
    except Exception as e:
        return False

async def main():
    parser = argparse.ArgumentParser(description="小北本地客户端")
    parser.add_argument("-w", "--workspace", help="工作目录", default=os.getcwd())
    parser.add_argument("-t", "--thread", help="继续指定的 Thread")
    parser.add_argument("--config", help="配置文件路径")
    args = parser.parse_args()
    
    # 检查 Openclaw
    print("🔍 检查 Openclaw Gateway...")
    if not await check_openclaw():
        print("❌ Openclaw Gateway 未运行")
        print("   请先启动: openclaw gateway")
        return
    print("✅ Openclaw Gateway 已连接")
    
    # 设置工作目录
    workspace = os.path.abspath(args.workspace)
    print(f"📁 工作目录: {workspace}")
    
    # 初始化 Agent
    runner = AgentRunner(
        workspace_dir=workspace,
        thread_id=args.thread,
    )
    
    # Thread 信息
    if args.thread:
        print(f"📝 继续 Thread: {args.thread}")
    else:
        print(f"📝 新建 Thread: {runner.thread_id}")
    
    print("\n🤖 小北本地版已启动 (输入 'exit' 退出)\n")
    
    # 交互循环
    while True:
        try:
            user_input = input("你: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ["exit", "quit", "q"]:
                print("👋 再见！")
                break
            
            # 运行 Agent
            print()
            async for event in runner.run(user_input):
                if event["type"] == "text":
                    print(event["content"], end="", flush=True)
                elif event["type"] == "tool_start":
                    print(f"\n🔧 {event['tool_name']}: {event.get('summary', '')}")
                elif event["type"] == "tool_end":
                    if event.get("output"):
                        print(f"   ✅ {event['output'][:100]}...")
                elif event["type"] == "error":
                    print(f"\n❌ 错误: {event['message']}")
            
            print("\n")
            
        except KeyboardInterrupt:
            print("\n👋 再见！")
            break
        except Exception as e:
            print(f"\n❌ 错误: {e}\n")

if __name__ == "__main__":
    asyncio.run(main())
```

### 3.2 使用方式

```bash
# 1. 先启动 Openclaw Gateway（后台运行）
$ openclaw gateway &

# 2. 启动小北 CLI
$ python cli.py -w ~/projects/myapp

🔍 检查 Openclaw Gateway...
✅ Openclaw Gateway 已连接
📁 工作目录: /Users/xxx/projects/myapp
📝 新建 Thread: thread_1706947200

🤖 小北本地版已启动 (输入 'exit' 退出)

你: 帮我看看这个项目的结构

🔧 LocalListDir: /Users/xxx/projects/myapp
   ✅ 找到 12 个文件/目录

🔧 LocalRead: package.json
   ✅ 读取成功

这是一个 Node.js + TypeScript 项目：
- 使用 Express 4.18 框架
- TypeScript 5.0
- 包含 Jest 测试

主要目录结构：
- src/        源代码
- tests/      测试文件
- dist/       编译输出

你: 用 VSCode 打开 src 目录

🔧 OpenVSCode: /Users/xxx/projects/myapp/src
   ✅ 已打开

✅ 已用 VSCode 打开 src 目录

你: 运行测试

🔧 LocalExec: npm test
   ✅ 执行完成

📦 Running tests...
 PASS  src/__tests__/app.test.ts
 ✓ should return hello (5ms)

All tests passed!

你: exit
👋 再见！
```

---

## 4. 部署架构

### 4.1 本地运行

```
┌─────────────────────────────────────────────────────────────────┐
│                      本地机器                                    │
│                                                                 │
│  ┌─────────────────┐        ┌─────────────────────────────┐    │
│  │  小北 CLI        │        │  Openclaw Gateway           │    │
│  │  (Python)        │◄──────►│  (Node.js)                  │    │
│  │                  │  WS    │                             │    │
│  │  python cli.py   │        │  openclaw gateway           │    │
│  └─────────────────┘        └─────────────────────────────┘    │
│          │                              │                       │
│          ▼                              ▼                       │
│  ┌─────────────────┐        ┌─────────────────────────────┐    │
│  │  AI API          │        │  本地文件系统                │    │
│  │  (Claude/GPT)    │        │  /Users/xxx/projects/...    │    │
│  └─────────────────┘        └─────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 启动脚本（一键启动）

```bash
#!/bin/bash
# start-xiaobei-local.sh

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js"
    exit 1
fi

# 检查 Python
if ! command -v python &> /dev/null; then
    echo "❌ 请先安装 Python"
    exit 1
fi

# 启动 Openclaw Gateway（后台）
echo "🚀 启动 Openclaw Gateway..."
openclaw gateway &
OPENCLAW_PID=$!
sleep 2

# 检查 Openclaw 是否启动成功
if ! curl -s http://localhost:18789/health > /dev/null; then
    echo "❌ Openclaw Gateway 启动失败"
    exit 1
fi
echo "✅ Openclaw Gateway 已启动 (PID: $OPENCLAW_PID)"

# 启动小北 CLI
echo "🤖 启动小北本地客户端..."
python cli.py "$@"

# 退出时关闭 Openclaw
echo "🛑 关闭 Openclaw Gateway..."
kill $OPENCLAW_PID 2>/dev/null
```

---

## 5. 配置

### 5.1 小北配置 (config.yaml)

```yaml
# ~/.xiaobei/config.yaml

# AI 模型配置
MAIN_AGENT:
  base_url: https://api.anthropic.com
  api_key: ${ANTHROPIC_API_KEY}
  model: claude-sonnet-4

# Openclaw 配置
openclaw:
  url: ws://localhost:18789
  token: ""  # 本地通常不需要

# 工作空间
workspace:
  default_dir: ~/projects

# Thread 存储
storage:
  type: sqlite
  path: ~/.xiaobei/threads.db

# 工具配置
tools:
  feishu:
    app_id: ${FEISHU_APP_ID}
    app_secret: ${FEISHU_APP_SECRET}
  search:
    provider: tavily
    api_key: ${TAVILY_API_KEY}

# 安全配置
security:
  allowed_directories:
    - ~/projects
    - ~/workspace
    - /tmp
```

### 5.2 环境变量 (.env)

```bash
# ~/.xiaobei/.env

# AI API Keys
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx

# 飞书
FEISHU_APP_ID=cli_xxx
FEISHU_APP_SECRET=xxx

# 搜索
TAVILY_API_KEY=tvly-xxx
```

---

## 6. 实施计划

### 6.1 阶段划分

```
阶段 1: Openclaw 客户端 (2天)
├── 实现 OpenclawClient (Python)
├── 实现基础方法 (read_file, write_file, exec_shell)
└── 测试连接和调用

阶段 2: 本地执行工具 (3天)
├── 实现 LocalRead 工具
├── 实现 LocalWrite 工具
├── 实现 LocalExec 工具
├── 实现 LocalEdit 工具
├── 实现 OpenVSCode 工具
└── YAML 配置和注册

阶段 3: Agent 配置更新 (1天)
├── 更新 main_agent.yaml
├── 添加本地执行工具
└── 测试 Agent 调用工具

阶段 4: CLI 客户端 (2天)
├── 实现 cli.py
├── 实现交互循环
├── 实现流式输出
└── 实现 Thread 管理

阶段 5: 一键启动 (1天)
├── 启动脚本
├── 配置文件模板
└── 文档

阶段 6: 测试优化 (2天)
├── 端到端测试
├── 错误处理
└── 性能优化
```

### 6.2 时间估计

| 阶段 | 内容 | 时间 |
|-----|------|------|
| 1 | Openclaw 客户端 | 2天 |
| 2 | 本地执行工具 | 3天 |
| 3 | Agent 配置更新 | 1天 |
| 4 | CLI 客户端 | 2天 |
| 5 | 一键启动 | 1天 |
| 6 | 测试优化 | 2天 |
| **总计** | | **~11天** |

---

## 7. 总结

### 7.1 最终架构

```
┌───────────────────────────────────────────────────────────┐
│                    本地客户端架构                          │
├───────────────────────────────────────────────────────────┤
│                                                           │
│   用户 ←──► CLI (python cli.py)                          │
│              │                                            │
│              ▼                                            │
│   ┌─────────────────────────────────────────────────┐    │
│   │       northau-xiaobei (Agent 框架)              │    │
│   │                                                  │    │
│   │   nexau Agent Core                              │    │
│   │   + 小北工具 (飞书、搜索、图像...)              │    │
│   │   + 本地执行工具 (调用 Openclaw)                │    │
│   └─────────────────────┬───────────────────────────┘    │
│                         │ WebSocket                       │
│                         ▼                                 │
│   ┌─────────────────────────────────────────────────┐    │
│   │       Openclaw Gateway (本地执行引擎)            │    │
│   │                                                  │    │
│   │   file_read / file_write / shell_exec / ...     │    │
│   └─────────────────────────────────────────────────┘    │
│                                                           │
└───────────────────────────────────────────────────────────┘

组件职责：
- northau-xiaobei: Agent 框架、AI 调用、工具协调
- Openclaw: 本地执行（文件、命令、浏览器、Git）
```

### 7.2 核心价值

| 方面 | 说明 |
|-----|------|
| **复用** | 保留 northau-xiaobei 的 Agent 框架和工具 |
| **增强** | 通过 Openclaw 获得本地执行能力 |
| **简化** | 不需要 north-app-core、E2B |
| **本地** | 直接操作本地文件、执行命令 |
| **灵活** | 文件编辑用 VSCode |

---

*文档结束*
