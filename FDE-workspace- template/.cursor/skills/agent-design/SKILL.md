---
name: agent-design
description: NexAU 组件设计。指导 Agent Artifact、Tool Artifact、SubAgent、MCP 服务器的设计与实现。适用于开发新的 Agent 或 Tool 组件时。
---

# NexAU 组件设计技能

## 这是什么

这个技能指导你如何设计 NexAU 框架中的各类组件：Agent Artifact、Tool Artifact、SubAgent、MCP 服务器等。提供完整的项目模板和最佳实践。

---

## Artifact 概览

NexAU 使用 **Artifact** 作为组件的标准化封装单元：

```
artifacts/
├── agents/              # Agent Artifacts
│   ├── main/           # 主 Agent
│   └── deep_research/  # 深度研究 Agent
└── tools/              # Tool Artifacts
    ├── search/         # 搜索工具
    ├── filesystem/     # 文件系统工具
    └── feishu/         # 飞书工具
```

每个 Artifact 是一个**独立的 Python 包**，包含完整的配置、实现和测试。

---

## 一、Artifact 标准结构

### Agent Artifact 结构

```
my-agent/
├── artifact.json           # 元数据声明
├── pyproject.toml          # Python 包配置
├── README.md               # 文档
├── src/
│   └── my_agent/
│       ├── __init__.py
│       ├── my_agent.yaml   # Agent 配置
│       ├── my_agent.md     # System Prompt
│       ├── sub_agents/     # 子代理
│       │   └── helper/
│       │       ├── helper.yaml
│       │       └── helper.md
│       └── tools/          # 自定义工具
│           └── custom/
│               ├── tool.yaml
│               └── custom.py
└── tests/
    ├── __init__.py
    └── test_agent.py
```

### Tool Artifact 结构

```
my-tool/
├── artifact.json           # 元数据声明
├── pyproject.toml          # Python 包配置
├── README.md               # 文档
├── src/
│   └── my_tool/
│       ├── __init__.py
│       └── my_tool/
│           ├── __init__.py
│           ├── tool.yaml   # 工具配置
│           └── my_tool.py  # 工具实现
└── tests/
    ├── __init__.py
    └── test_my_tool.py
```

---

## 二、artifact.json 规范

### Agent artifact.json

```json
{
  "name": "my-agent",
  "type": "agent",
  "version": "0.1.0",
  "description": "Agent 的简短描述",
  "specification": {
    "agent_spec": {
      "exported_agents": [
        {
          "name": "my-agent",
          "version": "0.1.0",
          "yaml_path": "./src/my_agent/my_agent.yaml"
        }
      ],
      "tools": [
        {
          "name": "my-tool-base",
          "version": "0.1.0",
          "imported_tools": ["TodoWrite", "Finish"]
        }
      ],
      "sub_agents": [
        {
          "name": "my-sub-agent",
          "version": "0.1.0"
        }
      ],
      "mcp_servers": [
        {
          "name": "external-api",
          "type": "http",
          "url": "https://api.example.com/mcp"
        }
      ]
    }
  }
}
```

### Tool artifact.json

```json
{
  "name": "my-tool",
  "type": "tool",
  "version": "0.1.0",
  "description": "工具的简短描述",
  "specification": {
    "tool_spec": {
      "exported_tools": [
        {
          "name": "MyTool",
          "yaml_path": "./src/my_tool/my_tool/tool.yaml",
          "binding": "my_tool:my_tool_function"
        }
      ]
    }
  }
}
```

---

## 三、pyproject.toml 规范

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "my-artifact"
version = "1.0.0"
description = "简短描述"
readme = "README.md"
requires-python = ">=3.8"
dependencies = [
    "nexau",
    "my-common",
    "pytest>=7.0.0"
]

[tool.hatch.build.targets.wheel]
packages = ["src/my_artifact"]

[tool.hatch.build.targets.sdist]
include = ["/src", "/README.md", "/artifact.json"]

[tool.black]
line-length = 100

[tool.ruff]
line-length = 100

[tool.pytest.ini_options]
testpaths = ["tests"]
```

---

## 四、Agent 配置 (YAML)

完整模板见 [templates/agent-artifact/src/my_agent/my_agent.yaml](templates/agent-artifact/src/my_agent/my_agent.yaml)

### 关键配置

```yaml
name: my_agent

# 变量
variables:
  max_tokens: 200000

# LLM 配置
llm_config:
  temperature: 0.6          # 创造性
  max_tokens: 35000         # 输出上限
  stream: true              # 流式输出
  timeout: 600              # 超时

# 工具
tools:
  - name: ToolName
    yaml_path: path/to/tool.yaml
    binding: module:function

# 子代理
sub_agents:
  - name: SubAgentName
    config_path: ./sub_agents/sub.yaml

# MCP 服务器
mcp_servers:
  - name: server-name
    type: http
    url: https://api.example.com/mcp

# 中间件
middlewares:
  - import: ...LoggingMiddleware
    params: {...}
  - import: ...ContextCompactionMiddleware
    params:
      threshold: 0.75
      compaction_strategy: "sliding_window"

# 停止工具
stop_tools: [Finish]
```

---

## 五、Tool 配置 (YAML)

完整模板见 [templates/tool-artifact/src/my_tool/my_tool/tool.yaml](templates/tool-artifact/src/my_tool/my_tool/tool.yaml)

### 关键配置

```yaml
name: MyTool
description: >-
  工具用途描述。
  
  使用说明：
  - 何时使用
  - 输入格式
  
  示例：
    param: "value"

input_schema:
  type: object
  properties:
    required_param:
      type: string
      description: 必填参数说明
      
    optional_param:
      type: integer
      default: 10
      minimum: 1
      maximum: 100
      description: 可选参数说明
      
    enum_param:
      type: string
      enum: ["opt1", "opt2"]
      description: |
        枚举说明：
        - opt1: 含义1
        - opt2: 含义2
        
  required: [required_param]
  additionalProperties: false
  $schema: http://json-schema.org/draft-07/schema#
```

---

## 六、System Prompt 设计

完整模板见 [templates/agent-artifact/src/my_agent/my_agent.md](templates/agent-artifact/src/my_agent/my_agent.md)

### 结构

```markdown
# Agent Name

## Core Identity and Mission

<identity>
你是谁，有什么能力
</identity>

<mission>
核心任务和工作流程
</mission>

## Behavioral Guidelines

### Tone and Style
- 简洁直接
- 避免冗余

### Task Management
- 使用 TodoWrite
- 及时更新状态

## Tool Usage Strategy

### Search
- 发现信息
- 后续深度阅读

### File Operations
- Read 先于 Edit

## Context

Today is {{date}}.
Workspace: {{workspace}}
```

详细指南见 [system-prompt-guide.md](system-prompt-guide.md)

---

## 七、Tool 实现 (Python)

完整模板见 [templates/tool-artifact/src/my_tool/my_tool/my_tool.py](templates/tool-artifact/src/my_tool/my_tool/my_tool.py)

### 结构

```python
"""
My Tool - 功能描述

功能说明：
1. 功能1
2. 功能2
"""
from typing import Optional
from nexau.archs.tool import ToolContext


async def my_tool_function(
    required_param: str,
    optional_param: int = 10,
    context: ToolContext = None
) -> dict:
    """
    工具函数。
    
    Args:
        required_param: 必填参数
        optional_param: 可选参数
        context: 工具上下文
        
    Returns:
        dict: {"status": "success/error", "data": ...}
    """
    try:
        # 参数验证
        if not required_param:
            return {"status": "error", "error": "参数不能为空"}
        
        # 业务逻辑
        result = process(required_param)
        
        return {"status": "success", "data": result}
        
    except Exception as e:
        return {"status": "error", "error": str(e)}
```

---

## 八、SubAgent 设计

### 配置要点

```yaml
name: HelperAgent
description: >-
  子代理用途。当主代理需要 XX 时调用。
  
  输入格式：
  - "执行 [任务]"
  
llm_config:
  stream: false              # 子代理不需要流式

tools:
  - name: Search             # 精简工具集
  - name: Read

stop_tools: []               # 由主代理控制

middlewares:
  - import: ...ContextCompactionMiddleware
    params:
      compaction_strategy: "tool_result_compaction"
```

---

## 九、MCP Server 配置

### HTTP 类型

```yaml
mcp_servers:
  - name: external-api
    type: http
    url: https://api.example.com/mcp
    env:
      API_KEY: ${env.API_KEY}
```

### STDIO 类型

```yaml
mcp_servers:
  - name: database-mcp
    type: stdio
    command: "uv"
    args: ["run", "postgres-mcp"]
    env:
      DATABASE_URI: ${env.DB_URL}
```

---

## 十、Middleware 配置

### 日志中间件

```yaml
- import: nexau.archs.main_sub.execution.hooks:LoggingMiddleware
  params:
    model_logger: "[agent][model]"
    tool_logger: "[agent][tool]"
    log_model_calls: true
```

### 上下文压缩

```yaml
- import: nexau...context_compaction:ContextCompactionMiddleware
  params:
    max_context_tokens: 200000
    auto_compact: true
    threshold: 0.75
    compaction_strategy: "sliding_window"  # 或 "tool_result_compaction"
    window_size: 2
```

| 策略 | 说明 | 适用 |
|------|------|------|
| `sliding_window` | 保留最近 N 轮 | 对话型 |
| `tool_result_compaction` | 压缩工具结果 | 工具密集型 |

---

## 模板索引

完整的项目模板：

| 模板 | 路径 | 说明 |
|------|------|------|
| Agent Artifact | `templates/agent-artifact/` | 完整 Agent 包模板 |
| Tool Artifact | `templates/tool-artifact/` | 完整 Tool 包模板 |

### Agent Artifact 包含

- `artifact.json` - 元数据
- `pyproject.toml` - 包配置
- `README.md` - 文档
- `src/my_agent/my_agent.yaml` - Agent 配置
- `src/my_agent/my_agent.md` - System Prompt
- `tests/test_agent.py` - 测试

### Tool Artifact 包含

- `artifact.json` - 元数据
- `pyproject.toml` - 包配置
- `README.md` - 文档
- `src/my_tool/my_tool/tool.yaml` - 工具配置
- `src/my_tool/my_tool/my_tool.py` - 工具实现
- `tests/test_my_tool.py` - 测试

---

## 开发流程

### 1. 创建新 Artifact

```bash
# 创建目录
mkdir -p artifacts/<type>/<name>
cd artifacts/<type>/<name>

# 初始化
uv init --name my-artifact-name
```

### 2. 复制模板

从 `templates/` 复制相应模板，修改名称和配置。

### 3. 实现功能

- Agent: 编写 System Prompt 和配置
- Tool: 实现工具函数和配置

### 4. 编写测试

```bash
pytest
```

### 5. 安装使用

```bash
# 开发模式
uv add -e .

# 在 Agent 中引用
tools:
  - name: MyTool
    yaml_path: path/to/tool.yaml
    binding: my_tool:function
```

---

## 设计检查清单

### Artifact 通用
- [ ] artifact.json 完整正确
- [ ] pyproject.toml 依赖完整
- [ ] README.md 说明清晰
- [ ] 测试覆盖核心功能

### Agent
- [ ] description 说明何时调用
- [ ] System Prompt 身份明确
- [ ] 工具使用有指导
- [ ] 配置了上下文压缩

### Tool
- [ ] description 详细有示例
- [ ] 参数都有说明
- [ ] 错误处理完善
- [ ] 返回值结构化

---

## 参考资料

- [System Prompt 设计指南](system-prompt-guide.md)
- [Workspace Design](../workspace-design/SKILL.md)
- [Context Engineering](../context/context-engineering.md)
- [Skill Creation](../skill-creation/SKILL.md)

---

## 版本历史

- **v2.0.0**（2026-01-28）：完整 Artifact 模板
  - 新增完整 Agent Artifact 模板
  - 新增完整 Tool Artifact 模板
  - 包含 artifact.json、pyproject.toml、tests 等
  - 基于实际项目结构设计

- **v1.0.0**（2026-01-28）：初始版本
