/**
 * 孵化器服务 — API 抽象层
 */

import type { IncubatorEnterprise, ActivityReport, ChatMessage, MatchResult } from '@/lib/schema';
import { USE_MOCK, delay, apiFetch } from './client';

/** 孵化器统计数据类型 */
export interface IncubatorStats {
  total_enterprises: number;
  active_enterprises: number;
  hightech_count: number;
  total_orders: number;
  pending_orders: number;
}

/** 企业活跃度排名类型 */
export interface ActivityRanking {
  enterprise_id: string;
  enterprise_name: string;
  score: number;
}

/** 获取在孵企业列表 */
export async function fetchIncubatorEnterprises(): Promise<IncubatorEnterprise[]> {
  if (USE_MOCK) {
    const { getIncubatorEnterprises } = await import('@/lib/mock-data');
    await delay();
    return getIncubatorEnterprises();
  }
  return apiFetch<IncubatorEnterprise[]>('/incubator/enterprises');
}

/** 获取单个在孵企业 */
export async function fetchIncubatorEnterprise(id: string): Promise<IncubatorEnterprise | undefined> {
  if (USE_MOCK) {
    const { getIncubatorEnterprise } = await import('@/lib/mock-data');
    await delay();
    return getIncubatorEnterprise(id);
  }
  return apiFetch<IncubatorEnterprise>(`/incubator/enterprises/${id}`);
}

/** 获取活跃度报告 */
export async function fetchActivityReports(): Promise<ActivityReport[]> {
  if (USE_MOCK) {
    const { getActivityReports } = await import('@/lib/mock-data');
    await delay();
    return getActivityReports();
  }
  return apiFetch<ActivityReport[]>('/incubator/activity-reports');
}

/** 获取聊天消息 */
export async function fetchChatMessages(): Promise<ChatMessage[]> {
  if (USE_MOCK) {
    const { getChatMessages } = await import('@/lib/mock-data');
    await delay();
    return getChatMessages();
  }
  return apiFetch<ChatMessage[]>('/incubator/chat-messages');
}

/** 获取匹配结果 */
export async function fetchMatchResult(): Promise<MatchResult | undefined> {
  if (USE_MOCK) {
    const { mockMatchResult } = await import('@/lib/mock-data');
    await delay();
    return mockMatchResult;
  }
  return apiFetch<MatchResult>('/incubator/match-result');
}

/** 获取孵化器统计 */
export async function fetchIncubatorStats(): Promise<IncubatorStats> {
  if (USE_MOCK) {
    const { getIncubatorStats } = await import('@/lib/mock-data');
    await delay();
    return getIncubatorStats();
  }
  return apiFetch<IncubatorStats>('/incubator/stats');
}

/** 获取企业活跃度排名 */
export async function fetchActivityRanking(): Promise<ActivityRanking[]> {
  if (USE_MOCK) {
    const { getEnterpriseActivityRanking } = await import('@/lib/mock-data');
    await delay();
    return getEnterpriseActivityRanking();
  }
  return apiFetch<ActivityRanking[]>('/incubator/activity-ranking');
}
