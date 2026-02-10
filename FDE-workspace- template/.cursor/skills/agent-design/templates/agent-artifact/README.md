# My Agent

> Agent 的简短描述

## 功能特性

- 功能1
- 功能2
- 功能3

## 目录结构

```
my-agent/
├── src/
│   └── my_agent/
│       ├── __init__.py
│       ├── my_agent.yaml      # Agent 配置
│       ├── my_agent.md        # System Prompt
│       ├── sub_agents/        # 子代理
│       │   └── helper/
│       │       ├── helper.yaml
│       │       └── helper.md
│       └── tools/             # 自定义工具
│           └── custom_tool/
│               ├── tool.yaml
│               └── custom_tool.py
├── tests/
│   ├── __init__.py
│   └── test_agent.py
├── artifact.json
├── pyproject.toml
└── README.md
```

## 使用方式

### 开发模式安装

```bash
cd my-agent
uv add -e .
```

### 配置说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `temperature` | float | 0.6 | LLM 创造性程度 |
| `max_tokens` | int | 35000 | 单次最大输出 |
| `stream` | bool | true | 是否流式输出 |

## 依赖

- nexau
- my-tool-base
- my-tool-search
- my-tool-filesystem

## 测试

```bash
pytest
```

## 版本历史

- **v1.0.0** - 初始版本
