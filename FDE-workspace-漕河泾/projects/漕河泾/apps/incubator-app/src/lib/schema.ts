/**
 * 漕河泾孵化器管理 App — 数据类型定义
 */

import { z } from 'zod';

// ============================================
// 孵化企业
// ============================================

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

// ============================================
// 订单匹配
// ============================================

export type MatchQueryType = 'demand_to_incubator' | 'incubator_to_park';

export interface MatchResult {
  id: string;
  query_text: string;
  query_type: MatchQueryType;
  sub_tasks?: string[];
  matches: MatchItem[];
  combination_suggestion?: string;
  relationship_graph?: RelationshipGraph;
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

// ============================================
// 关系网
// ============================================

export interface RelationshipGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  name: string;
  type: 'incubator' | 'park' | 'external';
  score?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  label?: string;
}

// ============================================
// 运营指标
// ============================================

export interface ActivityReport {
  enterprise_id: string;
  name: string;
  activity_score: number;
  trend: 'up' | 'down' | 'stable';
  signals: string[];
}

// ============================================
// 对话
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  match_result?: MatchResult;
  timestamp: string;
}

// ============================================
// Activity State
// ============================================

export const ActivityAppStateSchema = z.object({
  projectId: z.string().describe('项目ID'),
});
export type ActivityAppState = z.infer<typeof ActivityAppStateSchema>;
