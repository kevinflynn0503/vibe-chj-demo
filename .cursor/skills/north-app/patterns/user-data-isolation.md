# 用户数据隔离

**适用场景**: 多用户共享同一数据库的数据安全隔离。

**核心实现**:

```typescript
// 所有查询必须按 user_id 过滤
const { data } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)  // 关键！
  .order('created_at', { ascending: false });
```

**注意事项**:
- 每个表都必须有 `user_id` 字段
- 创建数据时必须写入 `user_id`
- 查询时永远不要遗漏 `.eq('user_id', userId)`
- 考虑启用 Supabase RLS（Row Level Security）作为服务端保障

**RLS 参考**:

```sql
-- 启用 RLS
ALTER TABLE writing_projects ENABLE ROW LEVEL SECURITY;

-- 策略: 用户只能访问自己的数据
CREATE POLICY "Users can only access own data"
  ON writing_projects
  FOR ALL
  USING (user_id = auth.uid());
```

**实例**: 所有 @north-app 应用的数据访问
