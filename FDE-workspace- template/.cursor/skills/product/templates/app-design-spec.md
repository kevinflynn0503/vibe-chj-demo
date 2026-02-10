# App 设计方案 - [App名称]

## 概述

| 项目 | 说明 |
|------|------|
| App 名称 | |
| 对应场景 | |
| 核心用户 | |
| 核心价值 | |

## 页面结构

```
/                          # 首页（列表）
├── /create                # 创建
├── /[id]                  # 详情
│   ├── /[id]/report       # 报告
│   └── /[id]/edit         # 编辑
└── /settings              # 设置（如需要）
```

## 页面详细设计

### 首页（列表页）

**功能**：
- 
**数据**：
- 
**交互**：
- 

### 创建页

**功能**：
**表单字段**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|

### 详情页

**功能**：
**Tab 结构**：
1. 
2. 
3. 

### 报告页

**功能**：
**Agent 集成**：

## 数据模型

```sql
CREATE TABLE [表名] (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  -- 业务字段
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE [表名] ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_isolation" ON [表名] 
  USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE [表名];
```

## Agent 集成

| Agent | 触发方式 | 输入 | 输出 |
|-------|---------|------|------|

## 技术约束

- Next.js 14 + App Router
- @north/design + shadcn/ui + Tailwind
- TypeScript 严格模式
- SDK Context（Phase 4 mock，Phase 5 真实）
- Zustand 状态管理
