/**
 * 政策服务 — API 抽象层
 */

import type { PolicyAssessment, PolicyStats, ProjectManagerProgress } from '@/lib/schema';
import { USE_MOCK, delay, apiFetch } from './client';

/** 获取政策评估列表 */
export async function fetchAssessments(grade?: string): Promise<PolicyAssessment[]> {
  if (USE_MOCK) {
    const { getAssessments } = await import('@/lib/mock-data');
    await delay();
    return getAssessments(grade);
  }
  const params = grade ? `?grade=${grade}` : '';
  return apiFetch<PolicyAssessment[]>(`/policy/assessments${params}`);
}

/** 获取单条政策评估 */
export async function fetchAssessment(id: string): Promise<PolicyAssessment | undefined> {
  if (USE_MOCK) {
    const { getAssessment } = await import('@/lib/mock-data');
    await delay();
    return getAssessment(id);
  }
  return apiFetch<PolicyAssessment>(`/policy/assessments/${id}`);
}

/** 获取政策统计 */
export async function fetchPolicyStats(): Promise<PolicyStats> {
  if (USE_MOCK) {
    const { getPolicyStats } = await import('@/lib/mock-data');
    await delay();
    return getPolicyStats();
  }
  return apiFetch<PolicyStats>('/policy/stats');
}

/** 获取项目经理进度 */
export async function fetchPMProgress(): Promise<ProjectManagerProgress[]> {
  if (USE_MOCK) {
    const { getPMProgress } = await import('@/lib/mock-data');
    await delay();
    return getPMProgress();
  }
  return apiFetch<ProjectManagerProgress[]>('/policy/pm-progress');
}
