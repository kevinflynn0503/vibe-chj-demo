/**
 * API 客户端配置
 * 
 * - 开发环境：使用 Mock 数据（通过 delay 模拟网络延迟）
 * - 生产环境：使用真实 API
 * 
 * 切换方式：设置环境变量 NEXT_PUBLIC_USE_MOCK=true/false
 */

/** 是否使用 Mock 数据 */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

/** Mock 延迟时间（ms），模拟网络请求 */
const MOCK_DELAY = 300;

/** 模拟异步延迟 */
export function delay(ms: number = MOCK_DELAY): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** API 基础 URL */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

/**
 * 通用 fetch 封装（生产环境使用）
 * 自动添加 baseURL、headers、错误处理
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.text().catch(() => 'Unknown error');
    throw new Error(`API Error [${res.status}]: ${error}`);
  }

  return res.json();
}
