/**
 * 企业服务 — API 抽象层
 * 
 * 页面只 import 这里的函数，内部自动判断走 Mock 还是真实 API。
 * 所有函数返回 Promise，统一异步接口。
 */

import type { Enterprise, BackgroundReport } from '@/lib/schema';
import { USE_MOCK, delay, apiFetch } from './client';

/** 获取企业列表 */
export async function fetchEnterprises(): Promise<Enterprise[]> {
  if (USE_MOCK) {
    const { getEnterprises } = await import('@/lib/mock-data');
    await delay();
    return getEnterprises();
  }
  return apiFetch<Enterprise[]>('/enterprises');
}

/** 获取单个企业详情 */
export async function fetchEnterprise(id: string): Promise<Enterprise | undefined> {
  if (USE_MOCK) {
    const { getEnterprise } = await import('@/lib/mock-data');
    await delay();
    return getEnterprise(id);
  }
  return apiFetch<Enterprise>(`/enterprises/${id}`);
}

/** 获取企业背调报告 */
export async function fetchBackgroundReport(enterpriseId: string): Promise<BackgroundReport | undefined> {
  if (USE_MOCK) {
    const { getBackgroundReport } = await import('@/lib/mock-data');
    await delay();
    return getBackgroundReport(enterpriseId);
  }
  return apiFetch<BackgroundReport>(`/enterprises/${enterpriseId}/report`);
}
