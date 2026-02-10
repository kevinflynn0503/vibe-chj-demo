# Realtime + 轮询双重保障

**适用场景**: 需要实时性但网络环境不确定的数据同步。

**核心实现**:

```typescript
// 同时建立 Realtime 订阅和定时轮询
const channel = supabase
  .channel('changes')
  .on('postgres_changes', { event: 'INSERT', table: 'xxx' }, handleEvent)
  .subscribe((status) => {
    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      console.warn('Realtime 失败，轮询已启动');
    }
  });

// 5 秒轮询作为备份
const timer = setInterval(async () => {
  const newData = await pollForUpdates();
  newData.filter(d => !processedIds.has(d.id)).forEach(handleEvent);
}, 5000);

// 清理
return () => {
  channel?.unsubscribe();
  clearInterval(timer);
};
```

**注意事项**:
- 用 `Set` 记录已处理的 ID，避免重复处理
- 订阅状态回调需要防重入标志
- 表必须手动启用 Realtime（`ALTER PUBLICATION`）

**实例**: vibe-writing 的替换指令订阅（`project-store.ts`）
