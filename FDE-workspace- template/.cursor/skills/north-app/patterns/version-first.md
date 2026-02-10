# 版本管理最新优先

**适用场景**: 文档/项目的版本历史管理。

**核心实现**:

```typescript
// 数据库查询: 按 created_at 降序
const { data: versions } = await supabase
  .from('versions')
  .select('*')
  .eq('project_id', projectId)
  .order('created_at', { ascending: false });

// versions[0] 就是最新版本，信任数据库排序
const latestVersion = versions[0];
set({ currentVersion: latestVersion });
```

**注意事项**:
- 不要在前端重新排序（信任数据库）
- 版本号用 `MAX + 1` 生成，不用 `count + 1`
- `content` 字段直存完整内容，不依赖文件链

**实例**: vibe-writing 和 research-book 的版本加载
