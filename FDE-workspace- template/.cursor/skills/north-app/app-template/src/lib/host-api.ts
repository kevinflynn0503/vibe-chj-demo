/**
 * Host API 封装
 * 从 research-book 提取的生产级实现
 *
 * 核心功能：
 * 1. 用户信息获取（带重试和缓存）
 * 2. 消息发送到 Agent
 * 3. 文件操作（上传、下载、列表）
 * 4. 后端 API 请求（Cookie 认证）
 */

'use client';

import { useMemo } from 'react';

import { useSDK, type UseAppManagerReturn } from '@/contexts/sdk-context';

type SDKType = UseAppManagerReturn;

// ============================================
// 类型定义
// ============================================

/** 用户信息 */
export interface UserInfo {
  uid: string;
  name?: string;
  email?: string;
  avatar?: string;
  workspaceId?: string;
}

/** 空间文件 */
export interface DriveFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  filetype?: string;
  isFolder: boolean;
  size?: number;
  mimeType?: string;
  parentId?: string;
  path?: string;
}

/** 文件上传结果 */
export interface UploadFileResult {
  id: string;
  name: string;
  url: string;
  size: number;
}

/** 文件列表结果 */
export interface ListDriveFilesResult {
  files: DriveFile[];
  total: number;
  page: number;
  size: number;
  hasMore: boolean;
}

// ============================================
// 辅助函数
// ============================================

/** 安全提取字符串值 */
function getStringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

/**
 * 获取宿主 origin（用于推断 API URL）
 */
function getHostOrigin(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

/**
 * 从宿主 URL 推断后端 API URL
 */
function inferBackendApiUrl(hostOrigin: string): string {
  try {
    const url = new URL(hostOrigin);
    const hostname = url.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }

    if (hostname.includes('ei.xiaobei.top')) {
      return `${url.protocol}//dev-api.xiaobei.top`;
    }

    const parts = hostname.split('.');
    if (parts.length >= 2) {
      parts[0] = 'dev-api';
      return `${url.protocol}//${parts.join('.')}`;
    }

    return hostOrigin;
  } catch {
    return hostOrigin;
  }
}

/**
 * 获取 API 基础 URL
 */
function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '/api/v1';

  const envApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envApiUrl) return envApiUrl;

  const hostOrigin = getHostOrigin();
  const backendOrigin = inferBackendApiUrl(hostOrigin);
  return `${backendOrigin}/api/v1`;
}

/**
 * 发起后端 API 请求（Cookie 认证）
 */
async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T | null> {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/${path}`;

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) return null;

    const json = await response.json();

    // 检查包装格式 {code, msg, data}
    if (typeof json === 'object' && json !== null && 'code' in json) {
      return json.code === 0 ? (json.data as T) : null;
    }

    return json as T;
  } catch {
    return null;
  }
}

// ============================================
// Host API 类
// ============================================

export class HostAPI {
  private sdk: SDKType;
  private cachedUser: UserInfo | null = null;
  private userPromise: Promise<UserInfo | null> | null = null;

  constructor(sdk: SDKType) {
    this.sdk = sdk;
  }

  /**
   * 获取当前用户信息（带缓存和重试）
   */
  async getUserInfo(): Promise<UserInfo | null> {
    if (this.cachedUser) return this.cachedUser;
    if (this.userPromise) return this.userPromise;

    this.userPromise = this.fetchUserInfoWithRetry();
    return this.userPromise;
  }

  private async fetchUserInfoWithRetry(
    maxRetries = 5,
    retryDelay = 1000,
  ): Promise<UserInfo | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!this.sdk.callXiaobeiAPI) {
          if (attempt < maxRetries) {
            await this.delay(retryDelay);
            continue;
          }
          break;
        }

        const sdkResult = await this.sdk.callXiaobeiAPI('getUserInfo');

        if (sdkResult && typeof sdkResult === 'object') {
          const result = sdkResult as Record<string, unknown>;

          if (result.success === false) {
            if (attempt < maxRetries) {
              await this.delay(retryDelay);
              continue;
            }
            break;
          }

          const userInfo: UserInfo = {
            uid: getStringValue(result.uid) || getStringValue(result.user_id) || '',
            name: getStringValue(result.name) || getStringValue(result.username) || '',
            email: getStringValue(result.email) || undefined,
            avatar: getStringValue(result.avatar) || getStringValue(result.avatar_url) || undefined,
            workspaceId: getStringValue(result.workspaceId) || getStringValue(result.default_workspace_id) || undefined,
          };

          if (userInfo.uid) {
            this.cachedUser = userInfo;
            return this.cachedUser;
          }
        }

        if (attempt < maxRetries) {
          await this.delay(retryDelay);
        }
      } catch {
        if (attempt < maxRetries) {
          await this.delay(retryDelay);
        }
      }
    }

    this.userPromise = null;
    return null;
  }

  /**
   * 发送消息到 Agent
   */
  sendChat(message: string): void {
    void this.sdk.sendChat({ message });
  }

  /**
   * 获取空间文件列表
   */
  async listDriveFiles(
    parentId?: string | null,
    options: { q?: string; page?: number; limit?: number } = {},
  ): Promise<ListDriveFilesResult> {
    try {
      if (!this.sdk.callXiaobeiAPI) {
        return { files: [], total: 0, page: 1, size: 0, hasMore: false };
      }

      const result = await this.sdk.callXiaobeiAPI('listDriveFiles', {
        parentId: parentId ?? null,
        q: options.q,
        page: options.page ?? 1,
        limit: options.limit ?? 50,
      });

      if (result && typeof result === 'object' && 'success' in result) {
        const response = result as {
          success: boolean;
          files?: DriveFile[];
          total?: number;
          page?: number;
          size?: number;
          hasMore?: boolean;
        };

        if (response.success && response.files) {
          return {
            files: response.files,
            total: response.total ?? response.files.length,
            page: response.page ?? 1,
            size: response.size ?? response.files.length,
            hasMore: response.hasMore ?? false,
          };
        }
      }

      return { files: [], total: 0, page: 1, size: 0, hasMore: false };
    } catch {
      return { files: [], total: 0, page: 1, size: 0, hasMore: false };
    }
  }

  /**
   * 上传文件（带超时处理）
   */
  async uploadFile(file: File): Promise<UploadFileResult | null> {
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) return null;

    try {
      const fileData = await this.fileToBase64(file);
      const UPLOAD_TIMEOUT = 60000;

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('上传超时')), UPLOAD_TIMEOUT);
      });

      const result = await Promise.race([
        this.sdk.uploadFile(
          {
            fileData,
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
          },
          { timeout: UPLOAD_TIMEOUT },
        ),
        timeoutPromise,
      ]);

      if (result && 'success' in result && result.success && 'file_uri' in result) {
        return {
          id: result.file_uri || crypto.randomUUID(),
          name: result.file_name || file.name,
          url: result.file_uri ?? '',
          size: file.size,
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * 获取文件下载 URL
   */
  async getFileDownloadUrl(path: string, threadId?: string): Promise<string | null> {
    try {
      if (!path?.trim()) return null;

      if (this.sdk.callXiaobeiAPI) {
        const result = await this.sdk.callXiaobeiAPI('getFileDownloadUrl', { path, threadId });
        if (result && typeof result === 'object') {
          const response = result as { success?: boolean; url?: string };
          if (response.success && response.url) return response.url;
        }
      }

      // 降级：直接调用后端 API
      const apiResult = await apiRequest<{ url: string }>(
        'drive/workspace-files/download',
        { method: 'POST', body: JSON.stringify({ path, thread_id: threadId }) },
      );
      return apiResult?.url ?? null;
    } catch {
      return null;
    }
  }

  /**
   * 监听状态变化
   */
  onStateChange(callback: (state: unknown) => void): () => void {
    const unsubscribe = this.sdk.onStateChange(
      callback as (state: Record<string, unknown>) => void,
    ) as unknown as (() => void) | undefined;
    return unsubscribe ?? (() => undefined);
  }

  /** 清除用户缓存 */
  clearUserCache(): void {
    this.cachedUser = null;
    this.userPromise = null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as base64'));
        }
      };
      reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
      reader.readAsDataURL(file);
    });
  }
}

// ============================================
// React Hook
// ============================================

/**
 * 获取 HostAPI 实例（useMemo 确保稳定）
 */
export function useHostAPI(): HostAPI {
  const sdk = useSDK();
  return useMemo(() => new HostAPI(sdk), [sdk]);
}
