/**
 * 详情页 — 查看项目结果
 *
 * 模式：
 * 1. 从 URL 获取项目 ID
 * 2. 加载项目数据
 * 3. 订阅 Realtime 更新
 * 4. 显示结果（Agent 写入后自动更新）
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { useProjectRealtime } from '@/hooks/useProjectRealtime';
import { getProject, type Project } from '@/lib/supabase';

// ============================================
// 状态指示器
// ============================================

function StatusIndicator({ status }: { status: string }) {
  if (status === 'running') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
        <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
        Agent 正在处理中...
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        已完成
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        处理失败
      </div>
    );
  }

  return null;
}

// ============================================
// 详情内容（需要 useSearchParams）
// ============================================

function DetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 订阅 Realtime 更新
  useProjectRealtime(projectId);

  // 加载项目数据
  useEffect(() => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    void getProject(projectId).then((data) => {
      setProject(data);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, [projectId]);

  // 加载中
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
      </div>
    );
  }

  // 项目不存在
  if (!project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-500">项目不存在</p>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-indigo-600 hover:underline"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 头部 */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
              onClick={() => router.push('/')}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-base font-semibold text-gray-900">{project.title}</h1>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* 状态 */}
        <div className="mb-6">
          <StatusIndicator status={project.status} />
        </div>

        {/* ⚠️ 在这里添加你的业务内容展示 */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">
            项目 ID: {project.id}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            在这里展示 Agent 生成的内容。
            <br />
            数据通过 Supabase Realtime 自动更新。
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 页面（Suspense 包裹 useSearchParams）
// ============================================

export default function DetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
