# Agent 设计方案汇总 - 漕河泾

> 按 NexAU Artifact 规范设计，每个 Agent 包含 artifact.json + yaml 配置 + System Prompt + 工作空间。

---

## Artifact 全景

```
artifacts/
├── agents/
│   ├── caohejing-visit/           # 客户拜访主 Agent
│   ├── caohejing-policy/          # 政策服务主 Agent
│   └── caohejing-incubator/       # 孵化器管理主 Agent
└── tools/
    └── caohejing-common/          # 共用业务工具（企业查询/飞书操作封装）
```

每个场景一个 **主 Agent**，内含若干 **Sub-Agent**。主 Agent 负责理解用户意图并分派任务，Sub-Agent 完成具体的能力。

---

## 一、客户拜访 Agent

### artifact.json

```json
{
  "name": "caohejing-visit",
  "type": "agent",
  "version": "0.1.0",
  "description": "漕河泾客户拜访场景主 Agent。负责背调报告生成、走访记录提取、需求闭环。",
  "specification": {
    "agent_spec": {
      "exported_agents": [
        {
          "name": "caohejing-visit",
          "version": "0.1.0",
          "yaml_path": "./src/caohejing_visit/caohejing_visit.yaml"
        }
      ],
      "tools": [
        { "name": "supabase-tool", "version": "latest", "imported_tools": ["SupabaseTool"] },
        { "name": "feishu-tool", "version": "latest", "imported_tools": ["FeishuTool"] },
        { "name": "caohejing-common", "version": "0.1.0", "imported_tools": ["EnterpriseQuery", "PolicyCheck"] }
      ],
      "sub_agents": [
        { "name": "deep-research", "version": "latest" }
      ]
    }
  }
}
```

### Agent YAML 配置

```yaml
# caohejing_visit.yaml
name: caohejing_visit

variables:
  max_tokens: 200000

llm_config:
  temperature: 0.4          # 偏精确，减少发散
  max_tokens: 35000
  stream: true
  timeout: 600

# 工具
tools:
  - name: SupabaseTool
    description: "读写 Supabase 数据库（enterprises/visit_records/background_reports 等表）"
  - name: FeishuTool
    description: "飞书 API 操作（妙记/日历/文档/任务/消息）"
  - name: EnterpriseQuery
    description: "封装的企业查询工具，支持模糊搜索、标签筛选、关联查询"
  - name: PolicyCheck
    description: "检查企业是否匹配任何政策条件，用于在背调中嵌入政策问题"

# 子代理
sub_agents:
  - name: deep_research
    config_path: ./sub_agents/deep_research/deep_research.yaml
    description: "从公开互联网搜集企业信息，补齐数据库缺失字段"

# 中间件
middlewares:
  - import: nexau.archs.main_sub.execution.hooks:LoggingMiddleware
    params:
      model_logger: "[visit][model]"
      tool_logger: "[visit][tool]"
  - import: nexau...context_compaction:ContextCompactionMiddleware
    params:
      max_context_tokens: 200000
      threshold: 0.75
      compaction_strategy: "tool_result_compaction"

stop_tools: [Finish]
```

### System Prompt（caohejing_visit.md）

```markdown
# 漕河泾客户拜访 Agent

<identity>
你是漕河泾开发区客户拜访场景的 AI 助手。你帮助招商经理完成拜访准备（背调+沟通清单）和拜访复盘（走访记录提取+需求整理）。
</identity>

<mission>
你有三个核心任务：

1. **生成背调报告**：当用户指定一家企业时，整合企业数据库+企查查+公开信息，生成结构化背调报告（8 个模块）+ 沟通清单（谈话提纲+必问问题），并创建飞书文档。

2. **提取走访记录**：当收到飞书妙记内容时，从转录文本中提取企业最新情况、企业诉求、合作意向、下一步计划，检测赛道关键问题覆盖度。

3. **整理需求清单**：从走访记录中提取企业诉求，分类为服务/合作/政策类需求，生成飞书任务分发给对应部门。
</mission>

## 工具使用策略

### SupabaseTool
- 查询 `enterprises` 表获取企业基本信息
- 查询 `visit_records` 表获取历史走访记录
- 查询 `system_configs` 表获取赛道 3+3 问题配置
- 写入 `background_reports` 表保存背调报告
- 写入 `visit_records` 表保存走访记录（is_confirmed=false）
- 写入 `visit_demands` 表保存企业诉求

### FeishuTool
- `get_minute`：获取飞书妙记转录内容
- `list_calendar_events`：获取日历拜访日程（用于妙记关联）
- `create_document` + `write_document`：创建飞书文档写入背调报告
- `create_task`：创建飞书任务分发需求
- `send_message`：推送通知给相关人

### EnterpriseQuery
- `search(name)`：模糊搜索企业
- `get_profile(enterprise_id)`：获取完整画像
- `get_visits(enterprise_id)`：获取所有部门的走访记录

### deep_research（Sub-Agent）
- 当数据库信息不足时调用
- 传入企业名 + 需要补齐的字段列表
- 返回公开数据 + 来源标注 + 置信度

## 背调报告输出格式

报告包含 8+2 个模块：
1. 工商信息（企业全名/注册时间/地址/法人/注册资本）
2. 股权情况（控股股东/穿透/近一年变化）
3. 融资情况（历史融资/重要投资方）
4. 团队情况（创始人/高管简介）
5. 产品情况（主要产品/市场/技术优势）
6. 行业/企业动态（最新新闻/公告）
7. 产业链分析（供应商/客户）
8. 潜在需求分析（政策/服务/合作/投融资）
9. 潜在合作可能（基于漕河泾资源匹配）
10. 历史走访汇总（跨部门所有走访记录精要）

沟通清单包含：
- 谈话提纲（基于背调发现的合作方向建议）
- 赛道必问问题（3+3 框架，从 system_configs 获取）
- 政策触达问题（如果 PolicyCheck 发现匹配的政策）
- 关键洞察（高亮标注需要特别关注的点）

## 走访记录提取规则

- 提取数字时，用正则二次校验（方言转录可能不准）
- 没有提到的信息留空，标注"未提及"，**不编造**
- 每个字段标注置信度：high/medium/low
- 所有输出标记为"待确认"，必须用户确认后才更新企业画像
- 检测关键问题覆盖度时，对照 system_configs 中对应赛道的问题列表

## Context

Today is {{date}}.
Workspace: {{workspace}}
当前操作用户：{{user_name}}，部门：{{user_department}}
```

### 工作空间设计

```
workspaces/客户拜访/
├── AGENTS.md                      # Agent 行为规则
├── MEMORY.md                      # 项目记忆
├── memory/
│   └── knowledge.csv              # 积累的企业知识
├── skills/
│   ├── 背调报告生成.md              # 背调报告的详细生成规则
│   ├── 走访记录提取.md              # 妙记提取的详细规则
│   └── 沟通清单框架.md              # 3+3 沟通框架说明
├── data/
│   ├── track_questions.csv         # 赛道关键问题配置
│   ├── policy_questions.csv        # 政策话术配置
│   └── department_map.csv          # 部门职责对照表
└── outputs/
    └── reports/                    # 生成的背调报告存档
```

---

## 二、政策服务 Agent

### artifact.json

```json
{
  "name": "caohejing-policy",
  "type": "agent",
  "version": "0.1.0",
  "description": "漕河泾政策服务场景主 Agent。负责企业筛选、分级、触达任务分发、申报诊断。",
  "specification": {
    "agent_spec": {
      "exported_agents": [
        {
          "name": "caohejing-policy",
          "version": "0.1.0",
          "yaml_path": "./src/caohejing_policy/caohejing_policy.yaml"
        }
      ],
      "tools": [
        { "name": "supabase-tool", "version": "latest", "imported_tools": ["SupabaseTool"] },
        { "name": "feishu-tool", "version": "latest", "imported_tools": ["FeishuTool"] },
        { "name": "caohejing-common", "version": "0.1.0", "imported_tools": ["EnterpriseQuery"] }
      ],
      "sub_agents": [
        { "name": "deep-research", "version": "latest" },
        { "name": "policy-screener", "version": "0.1.0" }
      ]
    }
  }
}
```

### Agent YAML 配置

```yaml
# caohejing_policy.yaml
name: caohejing_policy

llm_config:
  temperature: 0.3          # 政策判断要更精确
  max_tokens: 35000
  stream: true
  timeout: 600

tools:
  - name: SupabaseTool
  - name: FeishuTool
  - name: EnterpriseQuery

sub_agents:
  - name: deep_research
    config_path: ./sub_agents/deep_research/deep_research.yaml
  - name: policy_screener
    config_path: ./sub_agents/policy_screener/policy_screener.yaml
    description: >-
      政策筛选子代理。对单个企业执行政策条件逐项评估。
      主 Agent 负责批量调度，子代理负责单个企业的精确判断。

middlewares:
  - import: nexau...context_compaction:ContextCompactionMiddleware
    params:
      compaction_strategy: "tool_result_compaction"
      threshold: 0.75

stop_tools: [Finish]
```

### Sub-Agent: policy_screener

```yaml
# sub_agents/policy_screener/policy_screener.yaml
name: policy_screener
description: >-
  政策初筛子代理。对单个企业评估是否符合指定政策的申报条件。
  输入：企业数据 + 政策 rubrics
  输出：逐项评估结果 + 综合分级

llm_config:
  temperature: 0.2          # 极度精确
  max_tokens: 10000
  stream: false             # 子代理不需要流式

tools:
  - name: EnterpriseQuery

stop_tools: []               # 由主代理控制
```

```markdown
# policy_screener.md

<identity>
你是政策条件评估专家。你根据政策 rubrics 对单个企业逐项评估是否符合申报条件。
</identity>

<mission>
收到企业数据和 rubrics 后：
1. 逐条评估每个硬性条件（pass/fail/pending）
2. 数据充分的直接判断，数据不足的标记 pending 并说明缺什么
3. 综合评分并分级（A/B/C/不符合）
4. **绝不编造数据**。没有数据支撑的字段标记 pending，不猜测
</mission>

## 分级标准
- A 级（≥80分）：硬性条件全满足，高概率可申报
- B 级（60-80分）：大部分满足，1-2 项待确认
- C 级（<60分）：部分满足，需深入了解
- 不符合：关键硬性条件明确不满足

## 特别注意
- 税务风险是一票否决项，单独标注
- 研发费用占比计算要区分企业规模（年销售额区间不同标准不同）
- 知识产权要区分一类（发明专利）和二类（实用新型/软著）
```

### System Prompt（caohejing_policy.md）

```markdown
# 漕河泾政策服务 Agent

<identity>
你是漕河泾开发区政策服务场景的 AI 助手。你帮助科创团队从 17000+ 园区企业中筛选出符合政策申报条件的企业，分级管理，并协调触达和诊断。
</identity>

<mission>
你有四个核心任务：

1. **企业筛选**：根据上传的政策材料生成 rubrics，然后批量评估企业，输出分级名单。
   - 调用 policy_screener 子代理逐个企业评估
   - 数据不足时调用 deep_research 补齐
   - 每处理 10 家写一次进度到 Supabase

2. **触达任务分发**：将筛选出的 A/B 级企业分配给项目经理。
   - 通过 FeishuTool 创建飞书任务
   - 通过 FeishuTool 创建日历事件
   - 在任务描述中嵌入走访必问问题

3. **走访信息处理**：项目经理走访回来后，从妙记中提取政策相关信息。
   - 更新 policy_assessments 表的触达状态
   - 如果获得了新的企业数据，更新初筛结果

4. **申报诊断**（0.2 版本）：企业提供材料后，逐项审核给出诊断报告。

## 工具使用策略

### SupabaseTool
- 读 `policy_rules` 获取当前有效的政策规则
- 读 `enterprises` 批量获取待筛选企业
- 写 `policy_assessments` 保存筛选/分级/触达/诊断结果
- 写进度信息（每 10 家企业更新一次，前端 Realtime 展示进度）

### FeishuTool
- `create_task`：为项目经理创建走访任务
- `create_calendar_event`：创建走访日程
- `send_message`：筛选完成后推送结果给科创负责人
- `get_minute`：获取政策触达走访的妙记

### policy_screener（Sub-Agent）
- 传入：企业数据 JSON + rubrics JSON
- 返回：逐项评估结果 + 分级 + 缺失字段列表

## 规则可配置
政策标准每年会变。所有规则存在 `policy_rules` 表中，通过前端配置页管理。Agent 每次运行时从表中读取最新规则，不硬编码。
</mission>

## Context

Today is {{date}}.
Workspace: {{workspace}}
```

### 工作空间设计

```
workspaces/政策服务/
├── AGENTS.md
├── MEMORY.md
├── skills/
│   ├── 高新技术企业认定.md          # 高新认定的详细规则和经验
│   ├── 企业筛选方法.md             # 初筛和分级的详细方法
│   └── 申报诊断规则.md             # 材料审核的评判标准
├── data/
│   ├── policy_rubrics/             # 各政策的 rubrics 配置
│   │   └── 高新技术企业.yaml
│   ├── talk_scripts.csv            # 走访话术（7 条必问）
│   └── project_manager_map.csv     # 项目经理-企业对应关系
└── outputs/
    ├── screening_results/          # 筛选结果存档
    └── diagnosis_reports/          # 诊断报告存档
```

---

## 三、孵化器管理 Agent

### artifact.json

```json
{
  "name": "caohejing-incubator",
  "type": "agent",
  "version": "0.1.0",
  "description": "漕河泾孵化器管理场景主 Agent。负责订单/资源智能匹配、运营监控分析。",
  "specification": {
    "agent_spec": {
      "exported_agents": [
        {
          "name": "caohejing-incubator",
          "version": "0.1.0",
          "yaml_path": "./src/caohejing_incubator/caohejing_incubator.yaml"
        }
      ],
      "tools": [
        { "name": "supabase-tool", "version": "latest", "imported_tools": ["SupabaseTool"] },
        { "name": "caohejing-common", "version": "0.1.0", "imported_tools": ["EnterpriseQuery"] }
      ],
      "sub_agents": [
        { "name": "deep-research", "version": "latest" }
      ]
    }
  }
}
```

### Agent YAML 配置

```yaml
# caohejing_incubator.yaml
name: caohejing_incubator

llm_config:
  temperature: 0.5          # 匹配需要一定创造性
  max_tokens: 35000
  stream: true
  timeout: 600

tools:
  - name: SupabaseTool
  - name: EnterpriseQuery

sub_agents:
  - name: deep_research
    config_path: ./sub_agents/deep_research/deep_research.yaml

middlewares:
  - import: nexau...context_compaction:ContextCompactionMiddleware
    params:
      compaction_strategy: "sliding_window"    # 对话型，保留上下文
      window_size: 5

stop_tools: [Finish]
```

### System Prompt（caohejing_incubator.md）

```markdown
# 漕河泾孵化器管理 Agent

<identity>
你是漕河泾 A6 奇岱松校友中心的孵化器管理 AI 助手。你帮助运营人员在 70 家孵化企业和 17000+ 园区企业之间发现合作机会。
</identity>

<mission>
你有两个核心任务：

1. **订单/资源智能匹配**（对话式交互）：
   - 场景 A：用户输入一个外部需求（如"A企业有个自动洗车项目"），你拆解需求 → 在孵化企业中匹配 → 输出推荐列表
   - 场景 B：用户提到一个孵化企业有变化（融资/新产品），你分析该企业能力 → 在园区企业中匹配合作方
   - 每次匹配生成关系网数据（nodes + edges），用于前端可视化

2. **运营分析**（定时/按需）：
   - 分析会议室预约和访客数据 → 识别高活跃企业 → 生成报告
   - 异常检测：连续低活跃的企业预警

## 匹配逻辑

### 需求拆解
大需求 → 子任务（如自动洗车 → 机械臂 + 传感器 + 软件控制 + 清洗液）

### 匹配维度
1. **业务方向匹配**：产品/技术/服务方向是否相关
2. **产业链关系**：上下游、互补、竞合
3. **活跃度加权**：高活跃企业（多会议/多访客/多招聘）优先
4. **主体所在地**：漕河泾注册 > 上海注册 > 外地注册
5. **历史成功案例**：有类似订单经验的优先

### 输出格式
每个匹配结果包含：企业名 + 匹配原因（可解释）+ 匹配度分数 + 活跃度 + 主体所在地

### 关系网数据
```json
{
  "nodes": [
    { "id": "ent_001", "name": "宇和科技", "type": "incubator", "score": 85 },
    { "id": "ent_002", "name": "仪电集团", "type": "park", "score": null }
  ],
  "edges": [
    { "source": "ent_001", "target": "ent_002", "relation": "供应链", "label": "机械臂控制" }
  ]
}
```

## 工具使用策略

### SupabaseTool
- 读 `incubator_enterprises` 获取孵化企业画像（含 BP 解析结果）
- 读 `enterprises` 搜索园区企业
- 读 `operation_metrics` 获取活跃度数据
- 写 `incubator_matches` 保存匹配结果 + 关系网数据

### EnterpriseQuery
- 按产业标签搜索园区企业
- 按产品方向搜索孵化企业
- 获取企业详细画像

### deep_research（Sub-Agent）
- 孵化企业 BP 信息不足时，搜索补齐
- 园区大企业的最新动态和需求

## 对话交互
- 支持多轮对话：用户可以追问"换一批"、"详细分析这家"、"加个条件"
- 每轮对话都更新匹配结果和关系网数据
- 用户确认匹配后，可以选择"创建对接会议"（通过 FeishuTool 创建日历事件）
</mission>

## Context

Today is {{date}}.
Workspace: {{workspace}}
```

### 工作空间设计

```
workspaces/孵化器管理/
├── AGENTS.md
├── MEMORY.md
├── memory/
│   └── match_knowledge.csv         # 积累的匹配知识（什么类型的企业适合配什么）
├── skills/
│   ├── 订单匹配方法.md              # 匹配维度和权重说明
│   ├── 产业链分析.md               # 产业链上下游关系知识
│   └── 运营指标解读.md             # 活跃度指标的业务含义
├── data/
│   ├── incubator_profiles.csv      # 孵化企业画像摘要（从 BP 解析）
│   └── historical_matches.csv      # 历史成功订单案例
└── outputs/
    ├── match_results/              # 匹配结果存档
    └── activity_reports/           # 高活跃企业报告存档
```

---

## 四、共用 Tool Artifact：caohejing-common

### artifact.json

```json
{
  "name": "caohejing-common",
  "type": "tool",
  "version": "0.1.0",
  "description": "漕河泾项目共用业务工具。封装企业查询、政策检查等高频操作。",
  "specification": {
    "tool_spec": {
      "exported_tools": [
        {
          "name": "EnterpriseQuery",
          "yaml_path": "./src/caohejing_common/enterprise_query/tool.yaml",
          "binding": "enterprise_query:enterprise_query"
        },
        {
          "name": "PolicyCheck",
          "yaml_path": "./src/caohejing_common/policy_check/tool.yaml",
          "binding": "policy_check:policy_check"
        }
      ]
    }
  }
}
```

### EnterpriseQuery Tool

```yaml
# tool.yaml
name: EnterpriseQuery
description: >-
  企业查询工具。从 Supabase 查询企业信息，支持多种查询方式。
  
  使用场景：
  - 按名称搜索企业（模糊匹配）
  - 按 ID 获取完整画像
  - 按标签/赛道筛选企业列表
  - 获取某企业的所有走访记录
  
  示例：
    action: "search"
    params: { "name": "强生", "limit": 10 }

input_schema:
  type: object
  properties:
    action:
      type: string
      enum: ["search", "get_profile", "filter_by_tags", "get_visits"]
      description: |
        操作类型：
        - search: 按名称模糊搜索
        - get_profile: 按 ID 获取完整画像
        - filter_by_tags: 按产业标签筛选
        - get_visits: 获取某企业的走访记录
    params:
      type: object
      description: "操作参数，不同 action 参数不同"
  required: [action, params]
```

```python
# enterprise_query.py
"""
企业查询工具 - 封装 Supabase 企业数据查询
"""
from typing import Optional
from nexau.archs.tool import ToolContext


async def enterprise_query(
    action: str,
    params: dict,
    context: ToolContext = None
) -> dict:
    """企业查询。"""
    try:
        supabase = context.get_supabase_client()
        
        if action == "search":
            name = params.get("name", "")
            limit = params.get("limit", 10)
            result = supabase.table("enterprises") \
                .select("*") \
                .ilike("name", f"%{name}%") \
                .limit(limit) \
                .execute()
            return {"status": "success", "data": result.data}
            
        elif action == "get_profile":
            eid = params.get("enterprise_id")
            enterprise = supabase.table("enterprises") \
                .select("*") \
                .eq("id", eid) \
                .single() \
                .execute()
            # 同时获取扩展信息
            incubator_info = supabase.table("incubator_enterprises") \
                .select("*") \
                .eq("enterprise_id", eid) \
                .execute()
            return {
                "status": "success",
                "data": {
                    "enterprise": enterprise.data,
                    "incubator": incubator_info.data[0] if incubator_info.data else None
                }
            }
            
        elif action == "filter_by_tags":
            tags = params.get("tags", [])
            result = supabase.table("enterprises") \
                .select("*") \
                .contains("industry_tags", tags) \
                .execute()
            return {"status": "success", "data": result.data}
            
        elif action == "get_visits":
            eid = params.get("enterprise_id")
            result = supabase.table("visit_records") \
                .select("*") \
                .eq("enterprise_id", eid) \
                .order("visit_date", desc=True) \
                .execute()
            return {"status": "success", "data": result.data}
            
        else:
            return {"status": "error", "error": f"Unknown action: {action}"}
            
    except Exception as e:
        return {"status": "error", "error": str(e)}
```

### PolicyCheck Tool

```yaml
# tool.yaml
name: PolicyCheck
description: >-
  政策匹配检查工具。检查一个企业是否匹配任何已配置的政策条件。
  用于背调报告中嵌入政策触达问题。
  
  示例：
    enterprise_id: "uuid-xxx"

input_schema:
  type: object
  properties:
    enterprise_id:
      type: string
      description: "企业 ID"
  required: [enterprise_id]
```

---

## 五、设计检查清单

### Artifact 通用
- [x] artifact.json 完整正确（name/type/version/spec）
- [x] 依赖声明完整（tools/sub_agents）
- [ ] pyproject.toml（开发阶段补充）
- [ ] 测试覆盖核心功能（开发阶段补充）

### Agent
- [x] System Prompt 身份明确（identity + mission）
- [x] 工具使用有策略指导
- [x] 配置了上下文压缩（ContextCompactionMiddleware）
- [x] Sub-Agent 职责清晰（policy_screener / deep_research）
- [x] 工作空间设计完整（AGENTS.md + skills/ + data/ + outputs/）

### Tool
- [x] description 详细有示例
- [x] input_schema 参数完整
- [x] 错误处理（try/except）
- [x] 返回值结构化（status + data/error）
