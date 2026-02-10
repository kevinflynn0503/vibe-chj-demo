/**
 * SDK Context Provider
 * 提供 useAppManager 的返回值给所有子组件使用
 *
 * 来源：从 research-book 提取的生产级实现
 * - 自动推断宿主 origin
 * - 必须传递 getState 参数
 */

'use client';

import {
  useAppManager,
  type UseAppManagerReturn,
} from '@north/north-client-sdk';
import { createContext, useContext, type ReactNode } from 'react';

// ⚠️ 修改此处为你的 App 名称
const LOG_PREFIX = '[your-app-name]';

/**
 * 获取宿主应用的 origin
 */
function getOriginXiaobei(): string {
  if (
    typeof process !== 'undefined' &&
    process.env?.NEXT_PUBLIC_XIAOBEI_ORIGIN
  ) {
    return process.env.NEXT_PUBLIC_XIAOBEI_ORIGIN;
  }

  if (typeof window !== 'undefined') {
    const globalOrigin = (window as Window & { xiaobeiOrigin?: string })
      .xiaobeiOrigin;
    if (globalOrigin) {
      return globalOrigin;
    }

    if (window.parent && window.parent !== window) {
      try {
        const referrer = document.referrer;
        if (referrer) {
          const url = new URL(referrer);
          return url.origin;
        }
      } catch {
        // ignore
      }
    }

    return window.location.origin;
  }

  return '*';
}

const SDKContext = createContext<UseAppManagerReturn | null>(null);

/**
 * SDK Provider
 */
export function SDKProvider({
  children,
  instanceId = '',
  originXiaobei,
  getState,
}: {
  children: ReactNode;
  instanceId?: string;
  originXiaobei?: string;
  getState?: () => Promise<Record<string, unknown>>;
}) {
  const origin = originXiaobei ?? getOriginXiaobei();

  console.log(`${LOG_PREFIX} SDKProvider 初始化, origin:`, origin);

  const appManager = useAppManager({
    instanceId,
    originXiaobei: origin,
    getState, // ⚠️ 关键：必须传递
  });

  console.log(`${LOG_PREFIX} SDK 当前状态:`, appManager.status);

  return (
    <SDKContext.Provider value={appManager}>{children}</SDKContext.Provider>
  );
}

/**
 * 使用 SDK Context 的 Hook
 */
export function useSDK(): UseAppManagerReturn {
  const context = useContext(SDKContext);

  if (!context) {
    throw new Error('useSDK must be used within SDKProvider');
  }

  return context;
}

export type { UseAppManagerReturn };
