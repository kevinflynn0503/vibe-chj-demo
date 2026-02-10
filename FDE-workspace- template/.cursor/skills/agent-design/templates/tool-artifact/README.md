# My Tool

> 工具的简短描述

## 功能特性

- 功能1
- 功能2
- 功能3

## 目录结构

```
my-tool/
├── src/
│   └── my_tool/
│       ├── __init__.py
│       └── my_tool/
│           ├── __init__.py
│           ├── tool.yaml        # 工具配置
│           └── my_tool.py       # 工具实现
├── tests/
│   ├── __init__.py
│   └── test_my_tool.py
├── artifact.json
├── pyproject.toml
└── README.md
```

## 使用方式

### 开发模式安装

```bash
cd my-tool
uv add -e .
```

### 在 Agent 中使用

```yaml
tools:
  - name: MyTool
    yaml_path: path/to/my_tool/tool.yaml
    binding: my_tool:my_tool_function
```

### 参数说明

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `input_param` | string | 是 | - | 输入参数 |
| `optional_param` | integer | 否 | 10 | 可选参数 |

## 示例

```python
# 调用示例
result = await my_tool_function(
    input_param="example",
    optional_param=20
)
```

## 依赖

- nexau
- requests

## 测试

```bash
pytest
```

## 版本历史

- **v1.0.0** - 初始版本
