# 替换指令精确编辑

**适用场景**: AI 辅助内容修改，需要精确控制不改坏原文。

**核心实现**:

```typescript
// Agent 输出替换指令（不输出完整文档）
interface Replacement {
  id: string;
  search_text: string;   // 要替换的原文
  replace_text: string;  // 替换后的内容
  status: 'pending' | 'accepted' | 'rejected';
}

// 前端执行精确替换
function applyReplacements(content: string, replacements: Replacement[]): string {
  let result = content;
  for (const r of replacements) {
    if (r.status === 'accepted') {
      result = result.replace(r.search_text, r.replace_text);
    }
  }
  return result;
}
```

**注意事项**:
- Agent Prompt 必须明确"只输出替换指令，不输出完整文档"
- 数据库同时存完整内容（versions 表）和替换指令（replacements 表）
- DiffPreview 组件支持逐个接受/拒绝
- 使用 `diff-match-patch` 库做模糊匹配（容忍小变化）

**实例**: vibe-writing 的 AI 写作辅助功能
