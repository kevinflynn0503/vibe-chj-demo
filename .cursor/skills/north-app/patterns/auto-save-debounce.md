# 自动保存防抖 + 保存锁

**适用场景**: 编辑器内容自动保存，需要避免与批量操作的竞争条件。

**核心实现**:

```typescript
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

// 编辑时设置延迟保存
function onContentChange(content: string) {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    if (!get().isSaving) {
      saveContent(content);
    }
  }, 1000);
}

// 批量操作前必须取消定时器 + 加锁
async function acceptAll() {
  // 1. 取消定时器
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }

  // 2. 加锁 + 标记无未保存
  set({ isSaving: true, hasUnsavedChanges: false });

  try {
    await saveVersion(newContent);
  } finally {
    set({ isSaving: false });
  }
}
```

**注意事项**:
- 批量操作（acceptAll, rejectAll）前必须 `clearTimeout`
- `isSaving` 是互斥锁，防止自动保存和手动保存同时执行
- 异常时必须重置 `isSaving`

**实例**: vibe-writing 的 `project-store.ts` acceptAllReplacements
