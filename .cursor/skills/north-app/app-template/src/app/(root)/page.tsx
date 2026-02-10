/**
 * 首页 — 项目列表
 *
 * 模式：
 * 1. SDK 未就绪 → 加载动画
 * 2. 获取用户信息 → 加载项目列表
 * 3. loading → 骨架屏 → 空状态 / 列表
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useSDK } from '@/contexts/sdk-context';
import { useHostAPI } from '@/lib/host-api';
import { listProjects, isSupabaseConfigured, type Project } from '@/lib/supabase';

// ============================================
// 骨架屏
// ============================================

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4">
      <div className="mb-3 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mb-4 h-3 w-1/2 rounded bg-gray-100" />
      <div className="flex items-center gap-2">
        <div className="h-6 w-16 rounded-full bg-gray-100" />
        <div className="h-6 w-12 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

// ============================================
// 空状态
// ============================================

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900">暂无项目</h3>
      <p className="mt-1 text-xs text-gray-500">点击下方按钮创建第一个项目</p>
      <button
        onClick={onCreate}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        创建项目
      </button>
    </div>
  );
}

// ============================================
// 状态标签
// ============================================

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-600',
    running: 'bg-amber-50 text-amber-600',
    failed: 'bg-red-50 text-red-600',
    pending: 'bg-gray-50 text-gray-500',
  };
  const labels: Record<string, string> = {
    completed: '已完成',
    running: '进行中',
    failed: '失败',
    pending: '待处理',
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${styles[status] ?? styles.pending}`}>
      {labels[status] ?? '待处理'}
    </span>
  );
}

// ============================================
// 主页面
// ============================================

export default function HomePage() {
  const router = useRouter();
  const { status } = useSDK();
  const hostAPI = useHostAPI();
  const hostAPIRef = useRef(hostAPI);
  hostAPIRef.current = hostAPI;

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取用户信息 → 加载项目列表
  useEffect(() => {
    void hostAPIRef.current.getUserInfo().then((info) => {
      if (info?.uid && isSupabaseConfigured()) {
        void listProjects(info.uid).then((data) => {
          setProjects(data);
          setIsLoading(false);
        }).catch(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  // SDK 未就绪
  if (status !== 'running') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 头部 */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-base font-semibold text-gray-900">App 名称</h1>
          <button
            onClick={() => router.push('/create')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div className="mx-auto max-w-5xl px-6 py-6">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <EmptyState onCreate={() => router.push('/create')} />
        )}

        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/detail?id=${project.id}`)}
                className="cursor-pointer rounded-xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <h3 className="truncate text-sm font-medium text-gray-900">
                  {project.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
                <div className="mt-3">
                  <StatusBadge status={project.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
