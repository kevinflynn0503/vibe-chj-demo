# CSV 表头模板

复制这些表头来创建新的 CSV 文件。

## 记忆类

**用户偏好 `memory/user.csv`**
```csv
id,created_at,updated_at,status,key,value,confidence
```

**知识库 `memory/knowledge.csv`**
```csv
id,created_at,updated_at,status,subject,fact,source,verified
```

**对话历史 `memory/history/YYYY-MM-DD.csv`**
```csv
id,time,role,summary,importance
```

## 任务类

**任务列表 `tasks/backlog.csv`**
```csv
id,created_at,updated_at,status,title,priority,due_date,description
```

## 业务类

**通用数据表**
```csv
id,created_at,updated_at,status,[你的字段...]
```

**企业数据 `data/enterprise_db.csv`**
```csv
id,created_at,updated_at,status,name,industry,founded,website,notes
```

**需求池 `data/requirement_db.csv`**
```csv
id,created_at,updated_at,status,title,requester,priority,description
```

**Bug表 `data/bug_db.csv`**
```csv
id,created_at,updated_at,status,title,reporter,severity,description,resolution
```

---

## 状态值说明

| status | 含义 |
|--------|------|
| active | 正常/进行中 |
| pending | 待处理 |
| completed | 已完成 |
| archived | 已归档 |
| deleted | 已删除（软删除）|
