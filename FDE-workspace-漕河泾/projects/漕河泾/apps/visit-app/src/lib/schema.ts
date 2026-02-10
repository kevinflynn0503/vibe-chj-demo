/**
 * 漕河泾智能驾驶舱 — 统一数据类型
 */

// ═══ 企业画像 ═══

export interface Enterprise {
  id: string;
  name: string;
  short_name?: string;
  unified_code?: string;
  registered_address?: string;
  office_address?: string;
  legal_person?: string;
  established_date?: string;
  registered_capital?: string;
  industry?: string;
  industry_sub?: string;
  industry_tags?: string[];
  supply_chain_position?: string;
  development_stage?: string;
  employee_count?: number;
  description?: string;
  source?: string;
  is_in_park?: boolean;
  is_incubated?: boolean;
  last_visited_at?: string;
  ai_summary?: string;
  created_at: string;
  updated_at: string;
}

// ═══ 走访记录 ═══

export type VisitType = 'investment' | 'innovation' | 'park_dev' | 'incubator' | 'policy';

export interface VisitRecord {
  id: string;
  enterprise_id: string;
  enterprise_name?: string;
  visitor_name: string;
  visitor_department?: string;
  visit_date: string;
  visit_type?: VisitType;
  counterpart_name?: string;
  counterpart_title?: string;
  feishu_minute_id?: string;
  ai_extracted?: Record<string, { value: unknown; confidence: 'high' | 'medium' | 'low' }>;
  key_findings?: string[];
  demands?: string[];
  follow_up?: string;
  human_notes?: string;
  key_question_coverage?: {
    track_questions: { covered: number; total: number; missed: string[] };
    policy_questions?: { covered: number; total: number; missed: string[] };
  };
  is_confirmed: boolean;
  created_at: string;
}

// ═══ 背调报告 ═══

export interface BackgroundReport {
  id: string;
  enterprise_id: string;
  enterprise_name?: string;
  created_by?: string;
  report_content: Record<string, ReportSection>;
  feishu_doc_url?: string;
  communication_checklist?: CommunicationChecklist;
  status: 'generating' | 'draft' | 'published';
  created_at: string;
}

export interface ReportSection {
  title: string;
  content: string;
  source?: string;
}

export interface CommunicationChecklist {
  talking_points: string[];
  must_ask_questions: string[];
  key_insights: string[];
}

// ═══ 企业需求 ═══

export type DemandType = 'service' | 'cooperation' | 'policy';
export type DemandStatus = 'pending' | 'processing' | 'done';

export interface VisitDemand {
  id: string;
  enterprise_id: string;
  enterprise_name?: string;
  visit_record_id?: string;
  demand_content: string;
  demand_type?: DemandType;
  assigned_department?: string;
  assigned_to?: string;
  status: DemandStatus;
  created_at: string;
}

// ═══ 政策评估 ═══

export type Grade = 'A' | 'B' | 'C' | 'unqualified';
export type TouchStatus = 'pending' | 'assigned' | 'visited' | 'willing' | 'unwilling';

export interface PolicyAssessment {
  id: string;
  enterprise_id: string;
  enterprise_name: string;
  policy_type: string;
  screening_result: 'pass' | 'fail' | 'pending';
  screening_details: ScreeningDetail[];
  grade: Grade;
  grade_score: number;
  touch_status: TouchStatus;
  assigned_to?: string;
  task_feishu_id?: string;
  final_result: 'approved' | 'rejected' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface ScreeningDetail {
  rule_name: string;
  rule_type: 'hard' | 'soft';
  result: 'pass' | 'fail' | 'pending';
  enterprise_value?: string;
  required_value?: string;
  data_source?: string;
  confidence?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface PolicyStats {
  total_screened: number;
  grade_a: number;
  grade_b: number;
  grade_c: number;
  unqualified: number;
  touch_assigned: number;
  touch_visited: number;
  touch_willing: number;
  approved: number;
}

export interface ProjectManagerProgress {
  name: string;
  assigned: number;
  visited: number;
  willing: number;
  conversion_rate: number;
}

// ═══ 孵化器 ═══

export interface IncubatorEnterprise {
  id: string;
  enterprise_id: string;
  name: string;
  products: string[];
  tech_stack: string[];
  target_market?: string;
  funding_stage?: string;
  activity_score: number;
  bp_summary?: string;
  employee_count?: number;
  location?: string;
  entered_at?: string;
  created_at: string;
}

export interface MatchResult {
  id: string;
  query_text: string;
  query_type: 'demand_to_incubator' | 'incubator_to_park';
  sub_tasks?: string[];
  matches: MatchItem[];
  combination_suggestion?: string;
  created_at: string;
}

export interface MatchItem {
  enterprise_id: string;
  name: string;
  match_reason: string;
  match_score: number;
  activity_score: number;
  location: string;
  sub_task?: string;
  products?: string[];
}

export interface ActivityReport {
  enterprise_id: string;
  name: string;
  activity_score: number;
  trend: 'up' | 'down' | 'stable';
  signals: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  match_result?: MatchResult;
  timestamp: string;
}

// ═══ 统计 ═══

export interface VisitStats {
  total_enterprises: number;
  visited_enterprises: number;
  total_visits: number;
  pending_confirmations: number;
  pending_demands: number;
}

// ═══ 显示映射 ═══

export const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  investment: '产促招商', innovation: '科创服务', park_dev: '园区发展', incubator: '孵化器', policy: '政策触达',
};

export const DEMAND_TYPE_LABELS: Record<DemandType, string> = {
  service: '服务需求', cooperation: '合作需求', policy: '政策需求',
};

export const GRADE_STYLES: Record<Grade, { bg: string; text: string; label: string }> = {
  A: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'A 级' },
  B: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'B 级' },
  C: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'C 级' },
  unqualified: { bg: 'bg-slate-50', text: 'text-slate-500', label: '不符合' },
};

export const TOUCH_STATUS_LABELS: Record<TouchStatus, string> = {
  pending: '待分发', assigned: '已分发', visited: '已走访', willing: '有意愿', unwilling: '无意愿',
};
