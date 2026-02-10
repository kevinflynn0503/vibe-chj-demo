/**
 * SDK Context Provider 模板
 * 
 * 功能：
 * 1. 初始化 useAppManager SDK
 * 2. 提供 SDK 上下文给子组件
 * 3. ⚠️ 必须传递 getState 参数
 * 
 * 使用：
 * - 在 layout.tsx 中包裹应用
 * - 子组件通过 useSDK() 获取 SDK 实例
 */
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAppManager } from '@north/north-client-sdk';

// SDK 返回类型
type AppManagerReturn = ReturnType<typeof useAppManager>;

// Context
const SDKContext = createContext<AppManagerReturn | null>(null);

// 日志前缀
const LOG_PREFIX = '[your-app-name]';

// Provider Props
interface SDKProviderProps {
  children: ReactNode;
  instanceId?: string;
  originXiaobei?: string;
  getState?: () => Promise<Record<string, unknown>>;  // ⚠️ 必须声明
}

/**
 * SDK Provider 组件
 * 
 * @example
 * ```tsx
 * // layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SDKProvider>{children}</SDKProvider>
 *         <Toaster />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function SDKProvider({
  children,
  instanceId = '',
  originXiaobei,
  getState,  // ⚠️ 必须接收并传递
}: SDKProviderProps) {
  // 确定 origin
  const origin = originXiaobei || process.env.NEXT_PUBLIC_XIAOBEI_ORIGIN || '';
  
  console.log(`${LOG_PREFIX} SDKProvider 初始化, origin:`, origin);

  // 初始化 SDK
  const appManager = useAppManager({
    instanceId,
    originXiaobei: origin,
    getState,  // ⚠️ 关键：必须传递，否则无法正常通信！
  });

  // 调试日志
  console.log(`${LOG_PREFIX} SDK 状态:`, appManager.status);

  return (
    <SDKContext.Provider value={appManager}>
      {children}
    </SDKContext.Provider>
  );
}

/**
 * 获取 SDK 实例的 Hook
 * 
 * @example
 * ```tsx
 * const { status, sendChat, callXiaobeiAPI } = useSDK();
 * 
 * if (status !== 'running') {
 *   return <Loading />;
 * }
 * ```
 */
export function useSDK() {
  const context = useContext(SDKContext);
  if (!context) {
    throw new Error('useSDK must be used within SDKProvider');
  }
  return context;
}

/**
 * 导出 SDK 状态类型
 */
export type SDKStatus = 'init' | 'loading' | 'running';
