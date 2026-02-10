/**
 * SDK Context Provider — 小北平台通信
 * 
 * 注意：@north/north-client-sdk 在开发环境可能未安装
 * 此文件提供 mock 实现以支持独立运行
 */

'use client';

import { createContext, useContext, type ReactNode } from 'react';

const LOG_PREFIX = '[visit-app]';

// SDK 状态类型
interface UseAppManagerReturn {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  sendChat: (message: string) => void;
  instanceId: string;
}

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

export function SDKProvider({
  children,
  instanceId = '',
  originXiaobei,
}: {
  children: ReactNode;
  instanceId?: string;
  originXiaobei?: string;
}) {
  const origin = originXiaobei ?? getOriginXiaobei();

  console.log(`${LOG_PREFIX} SDKProvider 初始化, origin:`, origin);

  // Mock implementation for standalone mode
  const appManager: UseAppManagerReturn = {
    status: 'idle',
    sendChat: (message: string) => {
      console.log(`${LOG_PREFIX} sendChat (mock):`, message);
    },
    instanceId,
  };

  console.log(`${LOG_PREFIX} SDK 当前状态:`, appManager.status);

  return (
    <SDKContext.Provider value={appManager}>{children}</SDKContext.Provider>
  );
}

export function useSDK(): UseAppManagerReturn {
  const context = useContext(SDKContext);

  if (!context) {
    throw new Error('useSDK must be used within SDKProvider');
  }

  return context;
}

export type { UseAppManagerReturn };
