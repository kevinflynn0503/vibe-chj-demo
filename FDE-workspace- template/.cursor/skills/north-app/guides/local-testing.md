# North-App 本地测试

在本地验证 `@north-app/*` 应用的 Agent 工具调用。

## 测试环境

```bash
cd northau-xiaobei-main
```

确保 `.env` 文件已配置。

## 基本用法

```bash
uv run quick_start.py --query '<你的 prompt>'
```

## 测试步骤

1. **获取 prompt**: 在 `web/@north-app/<app>/src/lib/prompts.ts` 找到 `buildUserPrompt`
2. **构造测试数据**: 复制 prompt 模板，填入测试数据
3. **运行**: `uv run quick_start.py --query '<构造的 prompt>'`
4. **验证**:
   - 控制台输出 Agent 响应
   - 检查 Supabase 数据库写入
   - 查看 `logs/` 目录日志

## 示例

```bash
uv run quick_start.py --query '<reference>
<!-- METADATA_JSON: {"metadata":{"app":"vibe-writing","action":"写作优化","projectId":"test","versionId":"test-001"}} -->
【任务说明】处理文档中的 [AI: xxx] 标记。
【保存指令】调用 supabase_tool(...)
【待处理文档】# 测试文档
[AI: 写一段100字的介绍]
</reference> 处理 1 个 AI 标记'
```

## 验证数据库

```sql
SELECT * FROM writing_replacements ORDER BY created_at DESC LIMIT 10;
```

## 相关文件

| 文件 | 说明 |
|------|------|
| `northau-xiaobei-main/quick_start.py` | 测试入口 |
| `northau-xiaobei-main/artifacts/agents/main/` | 主 Agent 配置 |
| `northau-xiaobei-main/artifacts/tools/supabase/` | Supabase 工具 |
| `web/@north-app/<app>/src/lib/prompts.ts` | 各应用 Prompt |
