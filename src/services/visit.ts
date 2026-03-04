/**
 * 走访服务 — API 抽象层
 */

import type { VisitRecord, VisitDemand, VisitStats } from '@/lib/schema';
import { USE_MOCK, delay, apiFetch } from './client';

/** 获取走访记录列表 */
export async function fetchVisitRecords(enterpriseId?: string): Promise<VisitRecord[]> {
  if (USE_MOCK) {
    const { getVisitRecords } = await import('@/lib/mock-data');
    await delay();
    return getVisitRecords(enterpriseId);
  }
  const params = enterpriseId ? `?enterprise_id=${enterpriseId}` : '';
  return apiFetch<VisitRecord[]>(`/visits${params}`);
}

/** 获取单条走访记录 */
export async function fetchVisitRecord(id: string): Promise<VisitRecord | undefined> {
  if (USE_MOCK) {
    const { getVisitRecords } = await import('@/lib/mock-data');
    await delay();
    return getVisitRecords().find(r => r.id === id);
  }
  return apiFetch<VisitRecord>(`/visits/${id}`);
}

/** 获取需求列表 */
export async function fetchDemands(enterpriseId?: string): Promise<VisitDemand[]> {
  if (USE_MOCK) {
    const { getDemands } = await import('@/lib/mock-data');
    await delay();
    return getDemands(enterpriseId);
  }
  const params = enterpriseId ? `?enterprise_id=${enterpriseId}` : '';
  return apiFetch<VisitDemand[]>(`/demands${params}`);
}

/** 获取走访统计 */
export async function fetchVisitStats(): Promise<VisitStats> {
  if (USE_MOCK) {
    const { getStats } = await import('@/lib/mock-data');
    await delay();
    return getStats();
  }
  return apiFetch<VisitStats>('/visits/stats');
}
