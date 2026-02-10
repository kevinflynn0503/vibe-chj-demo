# 版本管理最佳实践

## 版本存储设计

```sql
CREATE TABLE writing_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES writing_projects(id),
  version_number INTEGER,
  source VARCHAR(20) NOT NULL,  -- 'user' | 'ai'
  content TEXT NOT NULL,         -- 完整内容直存
  word_count INTEGER,
  change_summary TEXT,
  parent_version_id UUID REFERENCES writing_versions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

关键决策: `content` 字段直存完整文档内容，不依赖远程文件。

## 版本号生成

用 `MAX(version_number) + 1`，不用 `count + 1`:

```typescript
const { data } = await client
  .from('versions')
  .select('version_number')
  .eq('project_id', projectId)
  .order('version_number', { ascending: false })
  .limit(1);

const newVersionNumber = (data?.[0]?.version_number ?? 0) + 1;
```

## 获取最新版本

```typescript
// 按 created_at 降序，versions[0] 就是最新的
const { data: versions } = await client
  .from('versions')
  .select('*')
  .eq('project_id', projectId)
  .order('created_at', { ascending: false });

const latestVersion = versions[0];
```

信任数据库排序，不在前端重复排序。

## 自动保存防竞争

```typescript
// 关键: acceptAllReplacements 时必须
// 1. 取消 autoSaveTimer
// 2. 设置 hasUnsavedChanges: false
// 3. 设置 isSaving: true 作为保存锁

acceptAllReplacements: async () => {
  // 立即取消自动保存
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }

  // ... 应用替换 ...

  set({
    editorContent: newContent,
    hasUnsavedChanges: false,  // 关键
    isSaving: true,            // 保存锁
  });

  try {
    await createVersion({ content: newContent, ... });
  } finally {
    set({ isSaving: false });
  }
};
```
