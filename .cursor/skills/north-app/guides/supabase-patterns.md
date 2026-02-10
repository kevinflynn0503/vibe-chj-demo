# Supabase 数据库设计模式

## 表设计规范

### 必备字段

```sql
CREATE TABLE [app]_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,           -- 数据隔离必需
  title TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 命名规范

- 表名: `[app]_[实体复数]`（如 `writing_projects`, `research_blocks`）
- 字段: `snake_case`（如 `created_at`, `user_id`）
- 主键: `id` (UUID)

### 索引策略

```sql
-- 外键必建索引
CREATE INDEX idx_versions_project ON writing_versions(project_id);

-- 高频查询字段
CREATE INDEX idx_projects_user ON writing_projects(user_id);
```

## Realtime 启用

每个需要实时更新的表都必须手动启用：

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE writing_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE writing_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE writing_replacements;
```

验证方式: 在 Supabase Dashboard -> Database -> Replication 中确认表已勾选。

## 数据隔离

所有查询必须按 `user_id` 过滤:

```typescript
// 正确
const { data } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId);

// 错误 -- 数据泄露！
const { data } = await supabase
  .from('projects')
  .select('*');
```

## 版本号生成

```typescript
// 正确: MAX + 1
const { data } = await client
  .from('versions')
  .select('version_number')
  .eq('project_id', projectId)
  .order('version_number', { ascending: false })
  .limit(1);
const next = (data?.[0]?.version_number ?? 0) + 1;

// 错误: count + 1（删除中间版本后会重复）
const { count } = await client
  .from('versions')
  .select('*', { count: 'exact', head: true });
```

## 内容存储

直接在数据库中存储完整内容：

```typescript
// 正确: content 字段直存
await client.from('versions').insert({
  project_id: projectId,
  content: fullContent,  // 完整内容
  source: 'user',
});

// 错误: 依赖远程文件链（多跳容易断裂）
await client.from('versions').insert({
  file_url: 'ai-generated://xxx',  // 不可靠
  content_preview: content.slice(0, 500),  // 内容丢失
});
```

## Supabase Client 配置

```typescript
const supabase = createClient(url, key, {
  realtime: {
    params: { eventsPerSecond: 10 },
    timeout: 60000,
    heartbeatIntervalMs: 25000,
  },
});
```
