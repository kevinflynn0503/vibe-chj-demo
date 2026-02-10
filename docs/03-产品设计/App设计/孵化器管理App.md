# App 设计方案 - 孵化器管理 App

## 概述

| 项目 | 说明 |
|------|------|
| App 名称 | incubator-app（孵化器管理） |
| 对应场景 | 孵化器日常运营 + 订单/资源智能匹配 |
| 核心用户 | 孵化器运营人员（公台红）、赵婧总（管理）、领导层（汇报） |
| 核心价值 | 用 AI 帮 70 家孵化企业在 17000+ 园区企业中找到合作机会 |

## 页面结构

```
/                              # 运营概览（首页）
├── /enterprises               # 孵化企业列表
│   └── /enterprises/[id]      # 企业画像（复用公共模块 + 合作 Tab）
├── /match                     # 订单匹配（对话式）
├── /relationships/[id]        # 关系网可视化（0.2）
├── /reports                   # 运营报告列表
│   └── /reports/[id]          # 高活跃企业报告详情
└── /dashboard                 # 运营监控看板
```

## 页面详细设计

### 1. 首页 - 运营概览

**功能**：
- 孵化器概况卡片：在孵企业数 / 高活跃企业数 / 本月匹配数
- 最近匹配记录：最近 5 条订单匹配结果
- 高活跃企业提醒：Top 5 活跃企业及其活跃原因
- 快捷入口：开始匹配 / 查看报告 / 企业列表

---

### 2. 孵化企业列表

**功能**：
- 展示 70 家孵化企业列表
- 每行：企业名 / 产品方向 / 融资阶段 / 活跃度评分 / 最近匹配
- 搜索：按企业名、产品方向
- 筛选：按行业赛道 / 活跃度 / 融资阶段
- 排序：按活跃度 / 最近匹配时间
- 点击 → 进入企业画像

**企业画像-合作 Tab**：
- 历史匹配记录
- 匹配的园区企业列表
- 产业链位置图示
- BP 解析摘要（AI 提取的结构化信息）

---

### 3. 订单匹配页（核心 AI 页面）

**功能**：对话式交互 + 结构化结果展示

**布局**：
- 左侧：对话区域（60%）
  - 输入框 + 发送按钮
  - 对话历史
  - AI 回复以卡片形式展示匹配结果
- 右侧：匹配结果面板（40%）
  - 当前匹配的企业列表
  - 每家：企业名 / 匹配原因 / 匹配度 / 活跃度 / 主体所在地
  - 点击企业 → 展开详情
  - "查看关系图" → 跳转关系网可视化

**对话式交互示例**：
```
用户：A 企业有个自动洗车项目，我们孵化的企业有谁能参与？

Agent：分析自动洗车项目，拆解为以下技术环节：
1. 机械臂控制 → 匹配到：宇和科技（相似度 85%）
2. 传感器方案 → 匹配到：芯视科技（相似度 72%）
3. 软件控制系统 → 匹配到：智码科技（相似度 68%）

推荐组合方案：宇和科技（机械臂）+ 芯视科技（传感器），
组合覆盖度达 90%。

宇和科技优先推荐原因：
- 公司主体注册在漕河泾 ✅
- 近期活跃度高（本月 5 次会议室预约）✅
- 曾完成类似订单（仪电自动化项目）✅
```

**Agent 集成**：
- 用户输入 → sendChat 到订单匹配 Agent
- Agent 查询 enterprises + incubator 数据 → 分析匹配 → 写入 `incubator_matches`
- App Realtime 监听 → 右侧面板实时更新
- 支持多轮对话："换一批" / "加上这个条件" / "详细分析宇和"

---

### 4. 关系网可视化页（0.2）

**功能**：以网状图展示企业间的潜在合作关系

**布局**：
- 中心节点：选中的孵化企业
- 一级节点：直接匹配的园区企业（按匹配度大小展示）
- 连线：标注合作类型（供应链/技术合作/客户关系）
- 交互：
  - 点击节点 → 弹出企业简介卡片
  - 拖拽 → 调整布局
  - 缩放 → 查看全局/局部
  - 点击连线 → 查看合作可能性分析

**数据来源**：`incubator_matches.relationship_graph`

**技术方案**：使用 D3.js 或 react-force-graph

---

### 5. 运营报告

**功能**：展示 AI 生成的运营分析报告

**报告类型**：
- 高活跃企业周报：本周活跃度 Top 10 + 活跃原因分析
- 异常预警：连续 N 天零活动的企业

**每份报告**：
- 生成时间 / 覆盖时段
- 企业列表 + 活跃度得分 + 变化趋势
- AI 分析：为什么判断为高活跃（哪些信号）

---

### 6. 运营监控看板

**功能**：
- 企业活跃度排行（柱状图）
- 会议室使用率（按时段热力图）
- 访客量趋势（折线图）
- 企业类型分布（饼图）

---

## 数据模型

```sql
-- 使用产品功能架构中定义的公共表：
-- enterprises, incubator_matches

-- 额外的孵化器场景专用表：

-- 孵化企业扩展信息
CREATE TABLE incubator_enterprises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprises(id) UNIQUE,
  bp_content JSONB,                -- BP 解析后的结构化内容
  bp_file_url TEXT,                -- 原始 BP 文件链接
  products TEXT[],                 -- 产品列表
  tech_stack TEXT[],               -- 技术方向
  target_market TEXT,              -- 目标市场
  funding_stage TEXT,              -- 融资阶段
  activity_score NUMERIC,          -- 活跃度评分
  activity_details JSONB,          -- 活跃度明细
  incubator_location TEXT,         -- 入驻位置（A6-8F / A6-9F）
  entered_at DATE,                 -- 入驻时间
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 运营监控数据
CREATE TABLE operation_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enterprise_id UUID REFERENCES enterprises(id),
  metric_type TEXT,                -- meeting_room / visitor / recruitment
  metric_date DATE,
  metric_value NUMERIC,
  metric_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS + Realtime
ALTER TABLE incubator_enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE incubator_matches ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE incubator_matches;
```

## Agent 集成

| Agent | 触发方式 | 输入 | 输出 |
|-------|---------|------|------|
| 订单匹配 Agent | 用户对话输入 | 查询文本 + 上下文 | incubator_matches 记录 |
| 高活跃企业 Agent | 定时触发（每周） | 运营数据时段 | 活跃度报告 |
| Deep Research | 被匹配 Agent 调用 | 企业名 | enterprises 数据补齐 |
