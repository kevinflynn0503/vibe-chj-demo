/**
 * 创建页 — 新建项目
 *
 * 模式：
 * 1. 用户填写表单
 * 2. 创建 Supabase 记录
 * 3. 发送 Prompt 到 Agent
 * 4. 跳转到详情页
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useSDK } from '@/contexts/sdk-context';
import { useHostAPI } from '@/lib/host-api';
import { createProject, isSupabaseConfigured } from '@/lib/supabase';

export default function CreatePage() {
  const router = useRouter();
  const sdk = useSDK();
  const hostAPI = useHostAPI();
  const hostAPIRef = useRef(hostAPI);
  hostAPIRef.current = hostAPI;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 获取用户信息
  useEffect(() => {
    void hostAPIRef.current.getUserInfo().then((user) => {
      if (user?.uid) setUserId(user.uid);
    });
  }, []);

  // 提交
  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      toast.error('请输入标题');
      return;
    }

    if (sdk.status !== 'running') {
      toast.error('SDK 未就绪，请稍候重试');
      return;
    }

    setIsSubmitting(true);

    try {
      let projectId: string;

      // 创建 Supabase 记录
      if (isSupabaseConfigured() && userId) {
        const project = await createProject({
          userId,
          title: title.trim(),
          description: description.trim(),
        });
        projectId = project.id;
      } else {
        projectId = `local-${Date.now()}`;
      }

      // ⚠️ 构建 Prompt — 根据你的 Agent 需要修改
      const prompt = `请执行任务：${title.trim()}${description ? `\n\n详细说明：${description}` : ''}`;

      // 发送到 Agent
      try {
        await sdk.sendChat({ message: prompt });
        toast.success('任务已启动');
        router.replace(`/detail?id=${projectId}`);
      } catch {
        toast.error('消息发送失败，请重试');
      }
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('创建失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, sdk, userId, router]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 头部 */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-3.5">
        <button
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
          onClick={() => router.push('/')}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-sm font-medium text-gray-900">新建</h1>
      </div>

      {/* 表单 */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
          <section>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              标题
            </label>
            <input
              type="text"
              placeholder="输入标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </section>

          <section>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              描述（可选）
            </label>
            <textarea
              placeholder="详细说明..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </section>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="border-t border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-2xl justify-end">
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="min-w-[120px] rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? '创建中...' : '开始'}
          </button>
        </div>
      </div>
    </div>
  );
}
