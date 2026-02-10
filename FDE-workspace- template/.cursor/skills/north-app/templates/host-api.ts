/**
 * Host API 封装模板
 * 
 * 功能：
 * 1. 封装宿主通信 API
 * 2. 用户信息获取（带重试和缓存）
 * 3. 文件操作（上传、下载、列表）
 * 4. 消息发送
 */
'use client';

import { useAppManager } from '@north/north-client-sdk';
import { useSDK } from '@/contexts/sdk-context';

// 日志前缀
const LOG_PREFIX = '[HostAPI]';

// ============================================
// 类型定义
// ============================================

export interface UserInfo {
  uid: string;           // 用户 ID（必需）
  name?: string;         // 用户名
  email?: string;        // 邮箱
  avatar?: string;       // 头像 URL
  workspaceId?: string;  // 工作空间 ID
}

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

export interface UploadFileResult {
  id: string;
  name: string;
  url: string;
  size: number;
}

export interface ListDriveFilesResult {
  files: DriveFile[];
  total: number;
  page: number;
  size: number;
  hasMore: boolean;
}

// ============================================
// HostAPI 类
// ============================================

export class HostAPI {
  private sdk: ReturnType<typeof useAppManager>;
  private cachedUser: UserInfo | null = null;
  private userPromise: Promise<UserInfo | null> | null = null;

  constructor(sdk: ReturnType<typeof useAppManager>) {
    this.sdk = sdk;
  }

  // ============================================
  // 用户信息
  // ============================================

  /**
   * 获取用户信息（带缓存和重试）
   */
  async getUserInfo(): Promise<UserInfo | null> {
    // 1. 检查缓存
    if (this.cachedUser) {
      console.log(`${LOG_PREFIX} 返回缓存的用户信息`);
      return this.cachedUser;
    }

    // 2. 防止并发请求
    if (this.userPromise) {
      console.log(`${LOG_PREFIX} 等待进行中的请求`);
      return this.userPromise;
    }

    // 3. 带重试获取
    this.userPromise = this.fetchUserInfoWithRetry();
    return this.userPromise;
  }

  private async fetchUserInfoWithRetry(
    maxRetries = 5,
    delayMs = 1000
  ): Promise<UserInfo | null> {
    for (let i = 0; i < maxRetries; i++) {
      console.log(`${LOG_PREFIX} 第 ${i + 1}/${maxRetries} 次尝试获取用户信息...`);

      try {
        const result = await this.sdk.callXiaobeiAPI('getUserInfo');
        const userInfo = result?.userInfo ?? result;

        if (userInfo?.uid) {
          this.cachedUser = userInfo as UserInfo;
          console.log(`${LOG_PREFIX} ✅ 获取成功:`, userInfo);
          return this.cachedUser;
        }
      } catch (err) {
        console.error(`${LOG_PREFIX} 获取失败:`, err);
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    console.warn(`${LOG_PREFIX} ⚠️ 重试 ${maxRetries} 次后仍未获取到用户信息`);
    return null;
  }

  // ============================================
  // 消息发送
  // ============================================

  /**
   * 发送消息到 Agent
   */
  async sendChat(message: string): Promise<void> {
    console.log(`${LOG_PREFIX} 发送消息:`, message.slice(0, 100) + '...');
    await this.sdk.sendChat(message, {
      skipRouteNavigation: true,  // 防止 iframe 刷新
    });
  }

  // ============================================
  // 文件操作
  // ============================================

  /**
   * 列出工作空间文件
   */
  async listDriveFiles(
    parentId?: string | null,
    options: { q?: string; page?: number; limit?: number } = {},
  ): Promise<ListDriveFilesResult> {
    console.log(`${LOG_PREFIX} 列出文件, parentId:`, parentId);

    const result = await this.sdk.callXiaobeiAPI('listDriveFiles', {
      parentId: parentId ?? null,
      q: options.q,
      page: options.page ?? 1,
      limit: options.limit ?? 50,
    });

    return {
      files: result?.files ?? [],
      total: result?.total ?? result?.files?.length ?? 0,
      page: result?.page ?? 1,
      size: result?.size ?? result?.files?.length ?? 0,
      hasMore: result?.hasMore ?? false,
    };
  }

  /**
   * 上传文件
   */
  async uploadFile(file: File): Promise<UploadFileResult | null> {
    // 文件大小检查（20MB）
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`${LOG_PREFIX} 文件超过 20MB 限制`);
      return null;
    }

    console.log(`${LOG_PREFIX} 上传文件:`, file.name);

    try {
      // 转换为 base64
      const fileData = await this.fileToBase64(file);

      // 上传（带超时）
      const timeoutMs = 60000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('上传超时')), timeoutMs);
      });

      const result = await Promise.race([
        this.sdk.uploadFile({
          fileData,
          filename: file.name,
          mimeType: file.type || 'application/octet-stream',
        }),
        timeoutPromise,
      ]);

      console.log(`${LOG_PREFIX} ✅ 上传成功:`, result);

      return {
        id: result.file_uri || crypto.randomUUID(),
        name: result.file_name || file.name,
        url: result.file_uri || '',
        size: file.size,
      };
    } catch (error) {
      console.error(`${LOG_PREFIX} 上传失败:`, error);
      return null;
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 获取文件下载 URL
   */
  async getFileDownloadUrl(
    path: string,
    threadId?: string,
  ): Promise<string | null> {
    console.log(`${LOG_PREFIX} 获取下载 URL:`, path);

    try {
      const result = await this.sdk.callXiaobeiAPI('getFileDownloadUrl', {
        path,
        threadId,
      });

      if (result?.success && result?.url) {
        return result.url;
      }

      return result?.url || null;
    } catch (error) {
      console.error(`${LOG_PREFIX} 获取下载 URL 失败:`, error);
      return null;
    }
  }
}

// ============================================
// Hook
// ============================================

/**
 * 获取 HostAPI 实例的 Hook
 * 
 * @example
 * ```tsx
 * const hostAPI = useHostAPI();
 * 
 * useEffect(() => {
 *   hostAPI.getUserInfo().then(info => {
 *     setUserId(info?.uid);
 *   });
 * }, []);
 * ```
 */
export function useHostAPI(): HostAPI {
  const sdk = useSDK();
  return new HostAPI(sdk);
}
