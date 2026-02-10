/**
 * Mock 数据 — 孵化器管理 App
 */

import type {
  IncubatorEnterprise,
  MatchResult,
  ActivityReport,
  ChatMessage,
} from './schema';

// ============================================
// 孵化企业
// ============================================

export const mockIncubatorEnterprises: IncubatorEnterprise[] = [
  {
    id: 'inc-001', enterprise_id: 'ent-003', name: '北坡科技',
    products: ['AI Agent平台', '企业智能助手'],
    tech_stack: ['大模型', 'RAG', 'Agent框架', 'Next.js'],
    target_market: '企业数字化', funding_stage: '天使轮',
    activity_score: 82,
    bp_summary: 'AI Agent开发团队，专注企业级智能助手。正在为漕河泾开发智能驾驶舱系统。',
    employee_count: 6, location: 'A6-501', entered_at: '2024-08',
    created_at: '2024-08-01T00:00:00Z',
  },
  {
    id: 'inc-002', enterprise_id: 'ent-005', name: '芯视科技',
    products: ['AI视觉传感器芯片', '工业视觉模组'],
    tech_stack: ['IC设计', 'CMOS传感器', '嵌入式AI'],
    target_market: '工业自动化/智能驾驶', funding_stage: 'Pre-A',
    activity_score: 91,
    bp_summary: 'AI视觉传感器芯片设计，产品用于工业自动化和智能驾驶场景。新一代芯片已完成流片。',
    employee_count: 15, location: 'A6-802', entered_at: '2023-06',
    created_at: '2023-06-15T00:00:00Z',
  },
  {
    id: 'inc-003', enterprise_id: 'inc-ent-003', name: '宇和科技',
    products: ['工业机械臂控制系统', '自动化产线方案'],
    tech_stack: ['运动控制', '机器人', 'PLC编程', 'ROS'],
    target_market: '工业制造', funding_stage: 'A轮',
    activity_score: 88,
    bp_summary: '工业机械臂控制系统供应商，曾完成仪电集团自动化产线项目。2025年营收约1000万。',
    employee_count: 22, location: 'A6-803', entered_at: '2023-01',
    created_at: '2023-01-10T00:00:00Z',
  },
  {
    id: 'inc-004', enterprise_id: 'inc-ent-004', name: '智码科技',
    products: ['工业控制软件', 'SCADA系统', '数字孪生'],
    tech_stack: ['C++', 'Python', '工控协议', '3D可视化'],
    target_market: '智能制造', funding_stage: '种子轮',
    activity_score: 65,
    bp_summary: '工业控制软件开发商，核心产品为SCADA系统和数字孪生平台。',
    employee_count: 8, location: 'A6-901', entered_at: '2024-03',
    created_at: '2024-03-20T00:00:00Z',
  },
  {
    id: 'inc-005', enterprise_id: 'inc-ent-005', name: '清洁智造',
    products: ['智能清洁机器人', '清洁液配方'],
    tech_stack: ['机器人', '导航算法', '化工'],
    target_market: '商业清洁', funding_stage: '天使轮',
    activity_score: 45,
    bp_summary: '智能商用清洁机器人，集成自主导航和智能清洁液配比系统。',
    employee_count: 10, location: 'A6-902', entered_at: '2024-06',
    created_at: '2024-06-01T00:00:00Z',
  },
];

// ============================================
// 订单匹配示例（预置对话）
// ============================================

export const mockMatchResult: MatchResult = {
  id: 'match-001',
  query_text: 'A企业（仪电集团）有个自动洗车项目，我们孵化的企业有谁能参与？',
  query_type: 'demand_to_incubator',
  sub_tasks: ['机械臂控制', '视觉传感方案', '软件控制系统', '清洁液智能配比'],
  matches: [
    {
      enterprise_id: 'inc-ent-003', name: '宇和科技',
      match_reason: '工业机械臂控制系统供应商，曾完成仪电自动化产线项目，有成熟的机械臂控制方案',
      match_score: 92, activity_score: 88, location: '漕河泾A6注册',
      sub_task: '机械臂控制', products: ['工业机械臂控制系统'],
    },
    {
      enterprise_id: 'ent-005', name: '芯视科技',
      match_reason: 'AI视觉传感器可用于洗车场景的车辆识别和定位，新一代芯片支持边缘推理',
      match_score: 78, activity_score: 91, location: '漕河泾A6注册',
      sub_task: '视觉传感方案', products: ['AI视觉传感器芯片'],
    },
    {
      enterprise_id: 'inc-ent-004', name: '智码科技',
      match_reason: '工业控制软件和数字孪生平台可用于洗车流程的集成控制和远程监控',
      match_score: 68, activity_score: 65, location: '漕河泾A6注册',
      sub_task: '软件控制系统', products: ['SCADA系统'],
    },
    {
      enterprise_id: 'inc-ent-005', name: '清洁智造',
      match_reason: '智能清洁机器人团队拥有清洁液智能配比技术，可复用于洗车场景',
      match_score: 55, activity_score: 45, location: '漕河泾A6注册',
      sub_task: '清洁液智能配比', products: ['清洁液配方'],
    },
  ],
  combination_suggestion: '推荐组合：宇和科技（机械臂控制）+ 芯视科技（视觉传感器），两家合作覆盖核心环节，组合覆盖度达 90%。宇和优先推荐原因：漕河泾注册主体、高活跃度（88分）、有仪电项目成功经验。',
  relationship_graph: {
    nodes: [
      { id: 'ent-004', name: '仪电集团（需求方）', type: 'park', score: undefined },
      { id: 'inc-ent-003', name: '宇和科技', type: 'incubator', score: 92 },
      { id: 'ent-005', name: '芯视科技', type: 'incubator', score: 78 },
      { id: 'inc-ent-004', name: '智码科技', type: 'incubator', score: 68 },
      { id: 'inc-ent-005', name: '清洁智造', type: 'incubator', score: 55 },
    ],
    edges: [
      { source: 'ent-004', target: 'inc-ent-003', relation: '供应链', label: '机械臂控制' },
      { source: 'ent-004', target: 'ent-005', relation: '供应链', label: '视觉传感' },
      { source: 'ent-004', target: 'inc-ent-004', relation: '技术合作', label: '软件控制' },
      { source: 'ent-004', target: 'inc-ent-005', relation: '技术合作', label: '清洁方案' },
      { source: 'inc-ent-003', target: 'ent-005', relation: '互补', label: '硬件+感知' },
    ],
  },
  created_at: '2026-02-09T14:00:00Z',
};

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-001', role: 'user',
    content: '仪电集团有个自动洗车项目，我们孵化的企业有谁能参与？',
    timestamp: '2026-02-09T14:00:00Z',
  },
  {
    id: 'msg-002', role: 'assistant',
    content: `分析「自动洗车项目」，拆解为以下技术环节：

**1. 机械臂控制** → 匹配到 **宇和科技**（匹配度 92%）
曾完成仪电自动化产线项目，有成熟的机械臂控制方案。

**2. 视觉传感方案** → 匹配到 **芯视科技**（匹配度 78%）
AI视觉传感器可用于车辆识别和定位，新一代芯片支持边缘推理。

**3. 软件控制系统** → 匹配到 **智码科技**（匹配度 68%）
SCADA系统可用于洗车流程集成控制和远程监控。

**4. 清洁液智能配比** → 匹配到 **清洁智造**（匹配度 55%）
拥有清洁液智能配比技术，可复用于洗车场景。

---

📌 **推荐组合方案**：宇和科技 + 芯视科技，组合覆盖度 90%。
- 宇和优先推荐：漕河泾注册 ✅ · 高活跃（88分）✅ · 仪电成功经验 ✅`,
    match_result: mockMatchResult,
    timestamp: '2026-02-09T14:00:05Z',
  },
];

// ============================================
// 高活跃企业报告
// ============================================

export const mockActivityReports: ActivityReport[] = [
  { enterprise_id: 'ent-005', name: '芯视科技', activity_score: 91, trend: 'up', signals: ['本周5次会议室预约', '3位投资人来访', '招聘3个岗位'] },
  { enterprise_id: 'inc-ent-003', name: '宇和科技', activity_score: 88, trend: 'stable', signals: ['本周3次会议室预约', '1位大客户来访'] },
  { enterprise_id: 'ent-003', name: '北坡科技', activity_score: 82, trend: 'up', signals: ['本周4次会议室预约', '频繁加班（门禁数据）'] },
  { enterprise_id: 'inc-ent-004', name: '智码科技', activity_score: 65, trend: 'down', signals: ['会议室预约减少50%'] },
  { enterprise_id: 'inc-ent-005', name: '清洁智造', activity_score: 45, trend: 'down', signals: ['连续2周无会议室预约', '无访客'] },
];

// ============================================
// 查询函数
// ============================================

export function getIncubatorEnterprises(): IncubatorEnterprise[] {
  return mockIncubatorEnterprises;
}

export function getIncubatorEnterprise(id: string): IncubatorEnterprise | undefined {
  return mockIncubatorEnterprises.find((e) => e.id === id);
}

export function getChatMessages(): ChatMessage[] {
  return mockChatMessages;
}

export function getActivityReports(): ActivityReport[] {
  return mockActivityReports;
}
