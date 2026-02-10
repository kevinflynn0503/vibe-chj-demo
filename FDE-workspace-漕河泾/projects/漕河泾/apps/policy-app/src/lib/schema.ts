/**
 * 漕河泾政策服务 App — 数据类型定义
 */

import { z } from 'zod';

// ============================================
// 企业（复用公共定义）
// ============================================

export interface Enterprise {
  id: string;
  name: string;
  short_name?: string;
  industry?: string;
  industry_sub?: string;
  industry_tags?: string[];
  employee_count?: number;
  established_date?: string;
  registered_capital?: string;
  description?: string;
  is_in_park?: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// 政策评估
// ============================================

export type ScreeningResult = 'pass' | 'fail' | 'pending';
export type Grade = 'A' | 'B' | 'C' | 'unqualified';
export type TouchStatus = 'pending' | 'assigned' | 'visited' | 'willing' | 'unwilling';
export type FinalResult = 'approved' | 'rejected' | 'pending';

export interface PolicyAssessment {
  id: string;
  enterprise_id: string;
  enterprise_name: string;
  policy_type: string;
  screening_result: ScreeningResult;
  screening_details: ScreeningDetail[];
  grade: Grade;
  grade_score: number;
  touch_status: TouchStatus;
  assigned_to?: string;
  task_feishu_id?: string;
  final_result: FinalResult;
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

// ============================================
// 政策规则
// ============================================

export interface PolicyRule {
  id: string;
  policy_type: string;
  rule_name: string;
  rule_type: 'hard' | 'soft';
  rule_description: string;
  evaluation_criteria: string;
  max_score: number;
  data_source?: string;
  is_active: boolean;
}

// ============================================
// 统计
// ============================================

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

// ============================================
// 显示映射
// ============================================

export const GRADE_STYLES: Record<Grade, { bg: string; text: string; label: string }> = {
  A: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'A 级' },
  B: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'B 级' },
  C: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'C 级' },
  unqualified: { bg: 'bg-gray-50', text: 'text-gray-500', label: '不符合' },
};

export const TOUCH_STATUS_LABELS: Record<TouchStatus, string> = {
  pending: '待分发',
  assigned: '已分发',
  visited: '已走访',
  willing: '有意愿',
  unwilling: '无意愿',
};

export const SCREENING_RESULT_ICON: Record<ScreeningResult, string> = {
  pass: '✅',
  fail: '❌',
  pending: '⚠️',
};

// ============================================
// Activity State
// ============================================

export const ActivityAppStateSchema = z.object({
  projectId: z.string().describe('项目ID'),
});
export type ActivityAppState = z.infer<typeof ActivityAppStateSchema>;
