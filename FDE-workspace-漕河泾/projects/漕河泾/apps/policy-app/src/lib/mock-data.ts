/**
 * Mock 数据 — 政策服务 App（高新技术企业认定）
 */

import type {
  Enterprise,
  PolicyAssessment,
  PolicyRule,
  PolicyStats,
  ProjectManagerProgress,
} from './schema';

// ============================================
// 政策规则（高新技术企业认定 rubrics）
// ============================================

export const mockPolicyRules: PolicyRule[] = [
  { id: 'rule-01', policy_type: '高新技术企业', rule_name: '成立时间', rule_type: 'hard', rule_description: '企业注册成立时间不少于一年', evaluation_criteria: '成立日期距今 >= 365天', max_score: 0, data_source: '企业数据库', is_active: true },
  { id: 'rule-02', policy_type: '高新技术企业', rule_name: '知识产权', rule_type: 'hard', rule_description: '拥有自主知识产权（发明专利、实用新型、软著等）', evaluation_criteria: '至少1项一类知识产权或6项二类知识产权', max_score: 30, data_source: '企查查/走访', is_active: true },
  { id: 'rule-03', policy_type: '高新技术企业', rule_name: '技术领域', rule_type: 'hard', rule_description: '属于国家重点支持的高新技术领域', evaluation_criteria: '电子信息/生物医药/新材料/新能源/高技术服务等8大领域', max_score: 0, data_source: '企业数据库', is_active: true },
  { id: 'rule-04', policy_type: '高新技术企业', rule_name: '研发费用占比', rule_type: 'hard', rule_description: '近三年研发费用总额占销售收入总额的比例符合要求', evaluation_criteria: '年销<5000万→5%；5000万-2亿→4%；>2亿→3%', max_score: 20, data_source: '走访/财务数据', is_active: true },
  { id: 'rule-05', policy_type: '高新技术企业', rule_name: '高新收入占比', rule_type: 'hard', rule_description: '高新技术产品（服务）收入占企业当年总收入的60%以上', evaluation_criteria: '高新收入/总收入 >= 60%', max_score: 0, data_source: '走访/财务数据', is_active: true },
  { id: 'rule-06', policy_type: '高新技术企业', rule_name: '科技人员占比', rule_type: 'hard', rule_description: '从事研发和技术创新的科技人员占比不低于10%', evaluation_criteria: '科技人员/总员工 >= 10%', max_score: 0, data_source: '走访', is_active: true },
  { id: 'rule-07', policy_type: '高新技术企业', rule_name: '技术先进程度', rule_type: 'soft', rule_description: '核心技术的先进程度和对主要产品的支持作用', evaluation_criteria: '专家评分', max_score: 20, data_source: 'AI评估', is_active: true },
  { id: 'rule-08', policy_type: '高新技术企业', rule_name: '创新能力', rule_type: 'soft', rule_description: '企业的创新管理水平和研发组织能力', evaluation_criteria: '专家评分', max_score: 30, data_source: 'AI评估', is_active: true },
];

// ============================================
// 筛选结果
// ============================================

export const mockAssessments: PolicyAssessment[] = [
  {
    id: 'assess-001',
    enterprise_id: 'ent-001',
    enterprise_name: '上海强生医疗器械有限公司',
    policy_type: '高新技术企业',
    screening_result: 'pass',
    screening_details: [
      { rule_name: '成立时间', rule_type: 'hard', result: 'pass', enterprise_value: '2005年成立，21年', required_value: '≥1年', data_source: '企业数据库', confidence: 'high' },
      { rule_name: '知识产权', rule_type: 'hard', result: 'pass', enterprise_value: '12项发明专利+6项实用新型', required_value: '≥1项一类', data_source: '企查查', confidence: 'high' },
      { rule_name: '技术领域', rule_type: 'hard', result: 'pass', enterprise_value: '生物医药-医疗器械', required_value: '8大领域之一', data_source: '企业数据库', confidence: 'high' },
      { rule_name: '研发费用占比', rule_type: 'hard', result: 'pass', enterprise_value: '约8%', required_value: '>2亿收入→≥3%', data_source: '走访记录', confidence: 'medium', note: '数据来自2026.01.25科创走访' },
      { rule_name: '高新收入占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '≥60%', data_source: '', confidence: 'low', note: '需走访时确认' },
      { rule_name: '科技人员占比', rule_type: 'hard', result: 'pass', enterprise_value: '约30%', required_value: '≥10%', data_source: '走访记录', confidence: 'medium' },
    ],
    grade: 'A',
    grade_score: 85,
    touch_status: 'willing',
    assigned_to: '薛坤',
    final_result: 'pending',
    created_at: '2026-02-05T10:00:00Z',
    updated_at: '2026-02-07T14:00:00Z',
  },
  {
    id: 'assess-002',
    enterprise_id: 'ent-005',
    enterprise_name: '上海芯视科技有限公司',
    policy_type: '高新技术企业',
    screening_result: 'pass',
    screening_details: [
      { rule_name: '成立时间', rule_type: 'hard', result: 'pass', enterprise_value: '2023年成立，3年', required_value: '≥1年', data_source: '企业数据库', confidence: 'high' },
      { rule_name: '知识产权', rule_type: 'hard', result: 'pending', enterprise_value: '正在申请中（数量未知）', required_value: '≥1项一类', data_source: 'deep research', confidence: 'low', note: '需确认专利授权情况' },
      { rule_name: '技术领域', rule_type: 'hard', result: 'pass', enterprise_value: '电子信息-集成电路', required_value: '8大领域之一', data_source: '企业数据库', confidence: 'high' },
      { rule_name: '研发费用占比', rule_type: 'hard', result: 'pending', enterprise_value: '约60%（来自走访，置信度低）', required_value: '<5000万→≥5%', data_source: '走访记录', confidence: 'low' },
      { rule_name: '高新收入占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '≥60%', data_source: '', confidence: 'low' },
      { rule_name: '科技人员占比', rule_type: 'hard', result: 'pass', enterprise_value: '约80%（15人中12人研发）', required_value: '≥10%', data_source: '走访记录', confidence: 'medium' },
    ],
    grade: 'B',
    grade_score: 68,
    touch_status: 'assigned',
    assigned_to: '项目经理A',
    final_result: 'pending',
    created_at: '2026-02-05T10:00:00Z',
    updated_at: '2026-02-05T10:00:00Z',
  },
  {
    id: 'assess-003',
    enterprise_id: 'ent-002',
    enterprise_name: '上海蔚来汽车科技有限公司',
    policy_type: '高新技术企业',
    screening_result: 'pass',
    screening_details: [
      { rule_name: '成立时间', rule_type: 'hard', result: 'pass', enterprise_value: '2014年成立', required_value: '≥1年', data_source: '企业数据库', confidence: 'high' },
      { rule_name: '知识产权', rule_type: 'hard', result: 'pass', enterprise_value: '200+项专利', required_value: '≥1项一类', data_source: '企查查', confidence: 'high' },
      { rule_name: '技术领域', rule_type: 'hard', result: 'pass', enterprise_value: '新能源汽车-智能驾驶', required_value: '8大领域之一', data_source: '企业数据库', confidence: 'high' },
      { rule_name: '研发费用占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '>2亿→≥3%', data_source: '', confidence: 'low' },
      { rule_name: '高新收入占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '≥60%', data_source: '', confidence: 'low' },
      { rule_name: '科技人员占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '≥10%', data_source: '', confidence: 'low' },
    ],
    grade: 'B',
    grade_score: 62,
    touch_status: 'pending',
    final_result: 'pending',
    created_at: '2026-02-05T10:00:00Z',
    updated_at: '2026-02-05T10:00:00Z',
  },
  {
    id: 'assess-004',
    enterprise_id: 'ent-004',
    enterprise_name: '上海仪电集团有限公司',
    policy_type: '高新技术企业',
    screening_result: 'pass',
    screening_details: [
      { rule_name: '成立时间', rule_type: 'hard', result: 'pass', enterprise_value: '1990年成立', required_value: '≥1年', data_source: '企业数据库', confidence: 'high' },
      { rule_name: '知识产权', rule_type: 'hard', result: 'pass', enterprise_value: '500+项专利', required_value: '≥1项一类', data_source: '企查查', confidence: 'high' },
      { rule_name: '技术领域', rule_type: 'hard', result: 'pass', enterprise_value: '电子信息-系统集成', required_value: '8大领域之一', data_source: '企业数据库', confidence: 'high' },
      { rule_name: '研发费用占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '>2亿→≥3%', data_source: '', confidence: 'low' },
      { rule_name: '高新收入占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '≥60%', data_source: '', confidence: 'low' },
      { rule_name: '科技人员占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '≥10%', data_source: '', confidence: 'low' },
    ],
    grade: 'C',
    grade_score: 55,
    touch_status: 'pending',
    final_result: 'pending',
    created_at: '2026-02-05T10:00:00Z',
    updated_at: '2026-02-05T10:00:00Z',
  },
];

// ============================================
// 统计
// ============================================

export const mockPolicyStats: PolicyStats = {
  total_screened: 326,
  grade_a: 12,
  grade_b: 28,
  grade_c: 45,
  unqualified: 241,
  touch_assigned: 35,
  touch_visited: 18,
  touch_willing: 8,
  approved: 0,
};

export const mockPMProgress: ProjectManagerProgress[] = [
  { name: '薛坤', assigned: 8, visited: 6, willing: 3, conversion_rate: 0.5 },
  { name: '项目经理A', assigned: 12, visited: 5, willing: 2, conversion_rate: 0.4 },
  { name: '项目经理B', assigned: 10, visited: 4, willing: 2, conversion_rate: 0.5 },
  { name: '项目经理C', assigned: 5, visited: 3, willing: 1, conversion_rate: 0.33 },
];

// ============================================
// 查询函数
// ============================================

export function getAssessments(grade?: string): PolicyAssessment[] {
  if (grade) return mockAssessments.filter((a) => a.grade === grade);
  return mockAssessments;
}

export function getAssessment(id: string): PolicyAssessment | undefined {
  return mockAssessments.find((a) => a.id === id);
}

export function getAssessmentByEnterprise(enterpriseId: string): PolicyAssessment | undefined {
  return mockAssessments.find((a) => a.enterprise_id === enterpriseId);
}

export function getPolicyStats(): PolicyStats {
  return mockPolicyStats;
}

export function getPMProgress(): ProjectManagerProgress[] {
  return mockPMProgress;
}

export function getPolicyRules(): PolicyRule[] {
  return mockPolicyRules;
}
