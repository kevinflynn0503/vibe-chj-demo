# AI 辅助精确编辑模式

## 核心架构

```
用户文档 + 标记 --> Agent (只输出替换指令) --> supabase_tool
                                                   |
                                              replacements 表
                                                   |
                                              Realtime / 轮询
                                                   |
                                              前端 DiffPreview
                                                   |
                                        用户确认 (接受/拒绝)
                                                   |
                                        前端执行 string.replace()
                                                   |
                                        保存完整内容到 versions 表
```

**关键原则**: Agent 不输出完整文档，只输出替换指令。前端负责精确替换。

## 为什么不让 Agent 直接输出完整文档？

LLM 的已知问题:
- 删除空行和注释代码
- "修复/清理"不相关的内容
- 改变格式和排版

精确编辑方案的优势:
- 100% 保证不会改坏原有内容
- 用户可以逐个确认修改
- 可追溯 AI 具体改了什么

## 双表设计

```sql
-- 表1: 完整内容
CREATE TABLE writing_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  ...
);

-- 表2: 替换指令
CREATE TABLE writing_replacements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES writing_versions(id),
  search_text TEXT NOT NULL,
  replace_text TEXT NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',  -- pending | accepted | rejected
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Prompt 设计要点

告诉 Agent 只输出替换指令:

```
不要输出完整文档，只输出替换指令。

supabase_tool({
  "app_name": "vibe-writing",
  "operation": "create",
  "table": "writing_replacements",
  "data": {
    "version_id": "关联版本ID",
    "search_text": "[AI: 原始标记]",
    "replace_text": "生成的内容",
    "reason": "替换原因"
  }
})
```

## DiffPreview 组件

```
+--------------------------------------------------+
| AI 修改预览                    [全部拒绝] [全部接受] |
+--------------------------------------------------+
| #1 生成介绍段落                    [拒绝] [接受]    |
| | 删除              | 插入                |       |
| | [AI: 写介绍]      | 人工智能是...       |       |
+--------------------------------------------------+
| 已接受 0 / 2 处修改                                |
+--------------------------------------------------+
```

## 定位策略

| 方式 | 适用场景 | 推荐度 |
|------|---------|--------|
| 完整 search 文本 | 短文本替换 | 中 |
| 上下文锚点 + 模糊匹配 | 通用场景 | 高（推荐）|
| 行号范围 | 静态内容 | 低 |

推荐使用 `diff-match-patch` 库进行模糊匹配。
