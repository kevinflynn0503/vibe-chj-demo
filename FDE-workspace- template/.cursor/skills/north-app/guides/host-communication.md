# 宿主通信

## SDK 状态生命周期

```
init → loading → running
 │                  │
 │                  ├─→ 可以调用 SDK API
 │                  ├─→ 可以发送消息
 │                  └─→ 可以获取用户信息
 │
 └─→ 此时调用 SDK 会失败，需等待
```

## SDK Context 配置

**⚠️ 关键：必须传递 `getState` 参数！**

```tsx
// src/contexts/sdk-context.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAppManager } from '@north/north-client-sdk';

type AppManagerReturn = ReturnType<typeof useAppManager>;
const SDKContext = createContext<AppManagerReturn | null>(null);

interface SDKProviderProps {
  children: ReactNode;
  instanceId?: string;
  originXiaobei?: string;
  getState?: () => Promise<Record<string, unknown>>;  // ⚠️ 必须声明
}

export function SDKProvider({
  children,
  instanceId = '',
  originXiaobei,
  getState,  // ⚠️ 必须接收
}: SDKProviderProps) {
  const origin = originXiaobei || process.env.NEXT_PUBLIC_XIAOBEI_ORIGIN || '';

  const appManager = useAppManager({
    instanceId,
    originXiaobei: origin,
    getState,  // ⚠️ 必须传递，否则无法正常通信！
  });

  return (
    <SDKContext.Provider value={appManager}>
      {children}
    </SDKContext.Provider>
  );
}

export function useSDK() {
  const context = useContext(SDKContext);
  if (!context) {
    throw new Error('useSDK must be used within SDKProvider');
  }
  return context;
}
```

## 用户信息获取

### 用户信息接口

```typescript
export interface UserInfo {
  uid: string;           // 用户 ID（必需，用于数据隔离）
  name?: string;         // 用户名
  email?: string;        // 邮箱
  avatar?: string;       // 头像 URL
  workspaceId?: string;  // 工作空间 ID（用于文件操作）
}
```

### 获取流程

```
App 启动
    │
    ▼
SDK 初始化 (status: init → loading → running)
    │
    ▼
调用 hostAPI.getUserInfo()
    │
    ├─→ SDK callXiaobeiAPI('getUserInfo')
    │         │
    │         ▼
    │   宿主返回用户信息
    │   { uid, name, email, workspaceId, ... }
    │
    ▼
存储 userId, workspaceId
    │
    ▼
作为 user_id 存入数据库
```

### 重试机制实现

```typescript
async getUserInfo(): Promise<UserInfo | null> {
  // 1. 检查缓存
  if (this.cachedUser) return this.cachedUser;
  
  // 2. 防止并发请求
  if (this.userPromise) return this.userPromise;
  
  // 3. 带重试获取
  this.userPromise = this.fetchUserInfoWithRetry();
  return this.userPromise;
}

private async fetchUserInfoWithRetry(
  maxRetries = 5,
  delayMs = 1000
): Promise<UserInfo | null> {
  for (let i = 0; i < maxRetries; i++) {
    console.log(`[HostAPI] 第 ${i + 1}/${maxRetries} 次尝试获取用户信息...`);
    
    const result = await this.sdk.callXiaobeiAPI('getUserInfo');
    const userInfo = result?.userInfo ?? result;
    
    if (userInfo?.uid) {
      this.cachedUser = userInfo;
      return userInfo;
    }
    
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return null;
}
```

### 页面中使用（推荐模式）

```tsx
export default function Page() {
  const hostAPI = useHostAPI();
  const [userId, setUserId] = useState<string | null>(null);
  const { fetchProjects } = useProjectStore();

  // 1. 获取用户信息（使用 ref 避免依赖变化）
  const hostAPIRef = React.useRef(hostAPI);
  hostAPIRef.current = hostAPI;

  useEffect(() => {
    void hostAPIRef.current.getUserInfo().then((info) => {
      if (info?.uid) {
        setUserId(info.uid);
      } else {
        setUserId('dev-user');  // 开发环境降级
      }
    });
  }, []); // 只在挂载时执行一次

  // 2. 加载数据（依赖 userId）
  useEffect(() => {
    if (userId) {
      void fetchProjects({ userId });
    }
  }, [userId, fetchProjects]);

  // ...
}
```

## Host API 方法列表

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `getUserInfo()` | - | `UserInfo \| null` | 获取用户信息（带重试） |
| `sendChat(message)` | `string` | `void` | 发送消息到 Agent |
| `uploadFile(file)` | `File` | `UploadFileResult \| null` | 上传文件 |
| `getFileDownloadUrl(path)` | `string` | `string \| null` | 获取文件下载 URL |
| `listDriveFiles(parentId, options)` | `string, object` | `ListDriveFilesResult` | 列出空间文件 |
| `queryKnowledge(params)` | `object` | `QueryKnowledgeResult` | 查询知识库 |

## 发送消息到 Agent

```typescript
async sendChat(message: string): Promise<void> {
  await this.sdk.sendChat(message, {
    skipRouteNavigation: true,  // 防止 iframe 刷新
  });
}
```

**使用示例：**

```typescript
const handleSubmit = async () => {
  // 构建 Prompt
  const prompt = buildPromptWithTemplate({
    projectId,
    userId,
    topic,
    template,
  });

  // 发送（不阻塞）
  hostAPI.sendChat(prompt);

  // 跳转到详情页
  router.push(`/detail?id=${projectId}`);
};
```

## 通知宿主当前路由

当 App 路由变化时，通知宿主更新 URL：

```typescript
useEffect(() => {
  if (projectId && window.parent && window.parent !== window) {
    const currentPath = `/detail?id=${projectId}`;
    
    window.parent.postMessage(
      {
        type: 'app-navigation',
        path: currentPath,
      },
      '*'  // 生产环境应使用具体 origin
    );
  }
}, [projectId]);
```
