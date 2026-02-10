# App 设计方案 - 政策服务 App

## 概述

| 项目 | 说明 |
|------|------|
| App 名称 | policy-app（政策服务） |
| 对应场景 | 高新技术企业认定服务全流程 |
| 核心用户 | 项目经理（一线执行）、薛科总（管理审核） |
| 核心价值 | 从 17000 家企业中自动筛出可申报高新的企业，让科创团队精准服务 |

## 页面结构

```
/                              # 政策工作台（首页）
├── /enterprises               # 企业管理大盘
│   └── /enterprises/[id]      # 企业画像（复用公共模块 + 政策 Tab）
├── /policies                  # 政策管理大盘
│   └── /policies/[type]       # 某政策详情（筛选结果列表）
├── /screening                 # 筛选任务页
│   └── /screening/[id]        # 单个企业的初筛/分级报告
├── /tasks                     # 触达任务列表
│   └── /tasks/[id]            # 任务详情
├── /diagnosis/[id]            # 申报诊断报告（0.2）
├── /dashboard                 # 统计看板
└── /settings                  # 配置页（政策规则、话术）
```

## 页面详细设计

### 1. 首页 - 政策工作台

**功能**：
- 概览卡片：本轮筛选企业数 / A 级 / B 级 / C 级
- 触达进度条：已分发 / 已走访 / 有意愿 / 已诊断
- 快捷入口：开始新一轮筛选 / 查看待处理任务 / 看统计
- 最近动态流：最近的筛选结果、走访反馈、诊断完成

---

### 2. 企业管理大盘

**功能**：
- 企业列表（可搜索、可筛选）
- 筛选维度：产业赛道 / 政策类型 / 申报状态 / 分级
- 每行：企业名 / 赛道 / 初筛结果 / 分级 / 触达状态 / 最终结果
- 点击 → 进入企业画像（含政策 Tab）
- 支持批量操作：批量分发触达任务

**企业画像-政策 Tab**：
- 初筛结果：逐项条件判断（✅通过/❌不通过/⚠️待确认）
- 分级结果：A/B/C + 各维度得分
- 触达状态：时间线（分发→走访→反馈）
- 诊断报告：如有
- 最终结果：审批通过/未通过

---

### 3. 筛选任务页

**功能**：
- 选择政策类型（一期仅"高新技术企业认定"）
- 点击"开始筛选" → 触发政策初筛 Agent
- 筛选进度实时展示（已处理 N / 总计 M）
- 筛选完成后展示结果：
  - 汇总统计：A 级 X 家 / B 级 Y 家 / C 级 Z 家 / 不符合 W 家
  - 企业列表（按分级排序）
  - 每家：企业名 / 分级 / 满足条件数 / 缺失项 / 置信度

**Agent 集成**：
- "开始筛选" → sendChat 到政策初筛 Agent
- Agent 批量处理 → 逐条写入 `policy_assessments` 表
- App Realtime 监听 → 进度条实时更新

---

### 4. 单企业初筛/分级报告

**功能**：
- 展示单个企业的政策评估详情
- 逐项条件判断：
  - 条件名 / 判断标准 / 企业数据 / 判断结果 / 数据来源 / 置信度
- 综合评级：A/B/C + 总分
- 缺失数据提示："以下字段数据不足，建议走访时确认"
- 操作："生成走访问题" → 基于缺失项生成定向走访问题

---

### 5. 触达任务列表

**功能**：
- 展示所有触达任务
- 筛选：按项目经理 / 状态 / 优先级
- 每行：企业名 / 分级 / 分配给 / 状态 / 分发时间 / 走访时间
- 批量操作："一键分发 A 级企业" → 自动创建飞书任务

---

### 6. 统计看板（Dashboard）

**功能**：
- 企业统计：按分级分布饼图、按赛道分布柱状图
- 触达进度：漏斗图（筛选→分发→走访→有意愿→诊断→申报→获批）
- 工作进度：每个项目经理的分配数 / 完成数 / 转化率
- 时间趋势：按周/月的触达量变化

---

### 7. 配置页

**功能**：
- 政策规则配置：上传政策材料 → AI 自动拆解为 rubrics → 人工审核
- 走访话术配置：配置政策必问的 7 条话术
- 项目经理-企业对应关系：配置两企清单

---

## 数据模型

```sql
-- 使用产品功能架构中定义的公共表：
-- enterprises, policy_assessments, policy_rules, visit_records

-- 额外的政策场景专用表：

-- 政策材料表
CREATE TABLE policy_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_type TEXT NOT NULL,
  material_name TEXT NOT NULL,
  material_content TEXT,
  file_url TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS + Realtime
ALTER TABLE policy_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_materials ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE policy_assessments;
```

## Agent 集成

| Agent | 触发方式 | 输入 | 输出 |
|-------|---------|------|------|
| 政策初筛 Agent | 用户点击"开始筛选" | policy_type + 企业范围 | policy_assessments 批量记录 |
| Deep Research | 被初筛 Agent 调用 | 企业名 | enterprises 数据补齐 |
| 政策诊断 Agent | 上传材料后触发 | enterprise_id + 材料 | policy_assessments.diagnosis_result |
| feishu_agent | 触达任务分发时 | 任务内容 + 负责人 | 飞书任务 ID |
