# CSV 数据库简明指南

## 什么时候用 CSV？

| 用 CSV | 不用 CSV |
|--------|---------|
| 数据量 < 5000 条 | 数据量很大 |
| 不需要复杂查询 | 需要 JOIN 等操作 |
| Agent 要能直接读 | 需要事务支持 |
| 人要能用 Excel 改 | 高并发写入 |

---

## 基本结构

每个 CSV 表都要有这几列：

```csv
id,created_at,updated_at,status,[你的字段...]
```

示例：

```csv
id,created_at,updated_at,status,name,value
001,2026-01-28,2026-01-28,active,项目A,100
002,2026-01-28,2026-01-28,active,项目B,200
```

---

## 四种操作

### 新增（Create）

```
读取现有数据 → 生成新 ID → 加上时间戳 → 追加到文件末尾
```

### 查询（Read）

```
读取整个文件 → 按条件过滤 → 返回匹配的行
```

### 更新（Update）

```
读取整个文件 → 找到目标行 → 修改字段值 → 更新时间戳 → 写回文件
```

### 删除（Delete）

```
软删除：把 status 改成 "deleted"（推荐）
硬删除：直接删除那一行
```

---

## 常用表模板

### 用户偏好

```csv
id,created_at,updated_at,status,key,value,confidence
001,2026-01-28,2026-01-28,active,language,中文,1.0
002,2026-01-28,2026-01-28,active,style,简洁,0.8
```

### 知识库

```csv
id,created_at,updated_at,status,subject,fact,source,verified
001,2026-01-28,2026-01-28,active,XX公司,主营AI芯片,官网,true
002,2026-01-28,2026-01-28,active,XX公司,2020年成立,工商,true
```

### 任务列表

```csv
id,created_at,updated_at,status,title,priority,due_date,assigned
001,2026-01-28,2026-01-28,active,调研XX公司,P1,2026-01-30,agent
002,2026-01-28,2026-01-28,pending,整理政策,P2,2026-01-31,agent
```

### 需求池

```csv
id,created_at,updated_at,status,title,requester,priority,description
001,2026-01-28,2026-01-28,active,新增导出功能,张三,P2,希望支持导出PDF
```

### Bug 跟踪

```csv
id,created_at,updated_at,status,title,reporter,severity,description,resolution
001,2026-01-28,2026-01-28,open,登录失败,李四,high,点击登录无反应,
```

---

## 实用技巧

### ID 怎么生成？

```
简单递增：001, 002, 003...
带前缀：task_001, user_002...
带日期：20260128_001...
```

### 怎么处理大文件？

如果 CSV 超过 1000 行：
- 考虑按时间分文件（如 `2026-01.csv`, `2026-02.csv`）
- 或者按类别分文件
- 保持单个文件 < 500 行最佳

### 怎么备份？

用 Git 就行：
```bash
git add data/*.csv
git commit -m "更新: 数据备份 2026-01-28"
```

---

## 注意事项

1. **不要删除列** —— 旧数据会出问题
2. **新增列放最后** —— 保持向后兼容
3. **时间用统一格式** —— 推荐 `YYYY-MM-DD`
4. **文本有逗号要加引号** —— `"这是,文本"`
5. **定期归档旧数据** —— 保持主表精简
