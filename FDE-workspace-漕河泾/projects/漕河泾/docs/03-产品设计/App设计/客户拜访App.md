# App 设计方案 - 客户拜访 App

## 概述

| 项目 | 说明 |
|------|------|
| App 名称 | visit-app（客户拜访） |
| 对应场景 | 企业走访全流程：拜访准备 → 拜访记录 → 需求闭环 |
| 核心用户 | 招商经理（日常使用）、赛道组长（配置）、管理者（查看） |
| 核心价值 | 让每个招商经理都能像老法师一样做好拜访准备、高质量沉淀走访信息 |

## 页面结构

```
/                              # 企业列表（首页）
├── /enterprise/[id]           # 企业画像详情页（公共模块）
│   ├── Tab: 基本信息
│   ├── Tab: 走访记录
│   ├── Tab: 需求清单
│   └── Tab: 服务记录
├── /enterprise/[id]/report    # 背调报告 + 沟通清单
├── /visits                    # 走访记录列表
│   └── /visits/[id]           # 走访记录详情（确认/调整）
├── /demands                   # 需求清单列表（0.3）
└── /settings                  # 配置页（赛道问题、话术）
```

## 页面详细设计

### 1. 首页 - 企业列表

**功能**：
- 展示所有企业列表（默认按最近走访时间排序）
- 搜索：按企业名模糊搜索
- 筛选：按产业赛道 / 走访状态 / 时间范围
- 每行显示：企业名、产业标签、最近走访时间、走访次数、主责经理
- 点击企业名 → 进入企业画像详情
- 右上角"生成背调"按钮 → 选择企业 → 触发背调 Agent

**数据**：
- 来源：`enterprises` 表 + `visit_records` 聚合
- 实时更新：通过 Supabase Realtime 监听 `enterprises` 表变化

**交互**：
- 列表支持分页（每页 20 条）
- 搜索实时过滤（debounce 300ms）
- 点击行 → 跳转企业画像

---

### 2. 企业画像详情页（公共模块）

**功能**：多 Tab 展示企业全维度信息

**Tab 1：基本信息**
- 工商信息卡片：企业名/统一代码/注册地址/法人/成立日期/注册资本
- 产业标签：赛道 + 产业链位置 + 发展阶段
- 股权结构：控股股东 + 穿透链
- 融资情况：融资轮次时间线
- 团队情况：创始人 + 高管简介
- 产品情况：主要产品列表
- 行业动态：最近新闻/公告
- AI 摘要：一段 AI 生成的企业总结

**Tab 2：走访记录**
- 时间线形式展示所有走访记录（跨部门）
- 每条记录：走访人/部门/日期/关键发现/企业诉求/下一步
- 标记哪个部门走访的（颜色区分：产促/科创/园发）
- 支持展开查看完整内容

**Tab 3：需求清单**（0.3）
- 企业历史提出的所有诉求
- 每条：需求内容/类型/来源走访/处理状态/负责部门
- 状态流转：待处理 → 处理中 → 已完成

**Tab 4：服务记录**
- 历史服务包发放记录
- 租赁合同信息
- 合作历史

---

### 3. 背调报告页

**功能**：展示 AI 生成的背调报告 + 沟通清单

**布局**：
- 左侧：背调报告内容（按模块折叠展开）
  - 企业基本面（8 个模块）
  - 每个模块可折叠
  - 数据来源标注（企业数据库 / 企查查 / deep research）
- 右侧：沟通清单
  - 谈话提纲（基于背调的合作方向建议）
  - 必问问题（赛道 3+3 + 政策话术）
  - 关键洞察（高亮标注）
- 顶部操作：
  - "导出飞书文档"按钮 → 生成飞书文档可打印
  - "重新生成"按钮 → 重新触发 Agent
  - 生成状态指示（生成中 / 已完成 / 失败）

**Agent 集成**：
- 点击"生成背调" → sendChat 到背调报告 Agent
- Agent 通过 supabase_tool 写入 `background_reports` 表
- App 通过 Realtime 监听写入 → 实时展示内容

---

### 4. 走访记录列表

**功能**：展示所有走访记录

**列表字段**：走访日期 / 企业名 / 走访人 / 部门 / 确认状态
**筛选**：按时间 / 部门 / 确认状态
**操作**：点击 → 进入走访记录详情

---

### 5. 走访记录详情（确认/调整）

**功能**：展示 AI 提取的走访记录，支持人工确认和调整

**布局**：
- 顶部：企业名 + 走访日期 + 走访人 + 确认状态
- 左侧：AI 提取的结构化内容
  - 企业最新情况（可编辑）
  - 企业诉求列表（可增删改）
  - 合作意向（可编辑）
  - 下一步计划（可编辑）
- 右侧：关键问题覆盖度
  - 赛道问题覆盖情况（✅/❌）
  - 政策问题覆盖情况（✅/❌）
- 底部：人工补充区（文本框）
- 操作按钮："确认并入库" / "驳回重新提取"

**Agent 集成**：
- 妙记关联后 → 走访记录 Agent 自动触发
- Agent 写入 `visit_records` 表（is_confirmed = false）
- 用户确认后 → 更新 is_confirmed = true → 触发企业画像更新

---

### 6. 配置页

**功能**：管理赛道关键问题和话术配置

**子页面**：
- 赛道关键问题：按赛道配置必问问题（游戏/生物医药/集成电路/租赁...）
- 政策话术：配置科创部门嵌入的政策问题
- 部门职责对照表：部门 → 负责人 → 联系方式

---

## 数据模型

```sql
-- 使用产品功能架构中定义的公共表：
-- enterprises, visit_records, background_reports

-- 额外的走访场景专用表：

-- 需求清单表（0.3 版本）
CREATE TABLE visit_demands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprises(id),
  visit_record_id UUID REFERENCES visit_records(id),
  demand_content TEXT NOT NULL,
  demand_type TEXT,              -- service/cooperation/policy
  assigned_department TEXT,
  assigned_to TEXT,
  feishu_task_id TEXT,
  status TEXT DEFAULT 'pending', -- pending/processing/done
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS：按用户部门隔离
ALTER TABLE visit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_demands ENABLE ROW LEVEL SECURITY;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE visit_records;
ALTER PUBLICATION supabase_realtime ADD TABLE background_reports;
```

## Agent 集成

| Agent | 触发方式 | 输入 | 输出 |
|-------|---------|------|------|
| 背调报告 Agent | 用户点击"生成背调" | enterprise_id | background_reports 记录 + 飞书文档 |
| 走访记录 Agent | 妙记关联后自动 | feishu_minute_id + enterprise_id | visit_records 记录（待确认） |
| Deep Research | 被背调 Agent 调用 | 企业名/关键词 | 公开信息补充到 enterprises |

## 技术约束

- Next.js 14 + App Router
- @north/design + shadcn/ui + Tailwind
- TypeScript 严格模式
- SDK Context（Phase 4 mock，Phase 5 真实）
- Zustand 状态管理
