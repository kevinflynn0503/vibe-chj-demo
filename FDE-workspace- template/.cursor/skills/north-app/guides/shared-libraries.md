# 共享库规范

## 问题背景

PR #1173 中 research-book 和 vibe-writing 的 `host-api.ts` 有 70% 重复代码（约 400 行）。

## 共享库结构

```
@north/app-common/src/
├── host-api/
│   ├── types.ts           # UserInfo, KnowledgeFile, etc.
│   ├── api-client.ts      # getHostOrigin(), inferBackendApiUrl()
│   ├── base-host-api.ts   # 共享的核心方法
│   └── utils.ts           # formatFileSize(), fileToBase64()
├── logger.ts              # 统一日志工具
└── supabase-config.ts     # Supabase 客户端配置
```

## BaseHostAPI 设计

```typescript
// @north/app-common/src/host-api/base-host-api.ts
export class BaseHostAPI {
  getUserInfo(): Promise<UserInfo | null>;
  fetchUserInfoWithRetry(maxRetries?: number): Promise<UserInfo>;
  queryKnowledge(params: QueryKnowledgeParams): Promise<QueryKnowledgeResult>;
  uploadFile(file: File): Promise<UploadFileResult>;
  sendChat(params: SendChatParams): Promise<void>;
  onStateChange(callback: StateChangeCallback): () => void;
}
```

各应用继承并扩展:

```typescript
// research-book/src/lib/host-api.ts
export class HostAPI extends BaseHostAPI {
  getFileDownloadUrl(fileId: string): Promise<string>;
  listDriveFiles(path?: string): Promise<BackendDriveFile[]>;
}

// vibe-writing/src/lib/host-api.ts
export class HostAPI extends BaseHostAPI {
  uploadTextAsFile(content: string, filename: string): Promise<UploadFileResult>;
  loadFileContent(url: string): Promise<string>;
}
```

## 判断标准

何时提取到共享库:
- 两个以上 App 使用相同代码 -> 提取
- 类型定义被多处引用 -> 提取
- 工具函数无业务逻辑 -> 提取

何时保留在 App 内:
- 只有一个 App 使用
- 包含特定业务逻辑
- 与 App 状态强耦合
