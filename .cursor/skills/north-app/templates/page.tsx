/**
 * 页面组件模板
 * 
 * 功能：
 * 1. 获取用户信息
 * 2. 加载项目列表
 * 3. 处理 Loading 状态
 * 4. 标准页面布局
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSDK } from '@/contexts/sdk-context';
import { useHostAPI } from '@/lib/host-api';
import { useProjectStore } from '@/store/project-store';

// 日志前缀
const LOG_PREFIX = '[HomePage]';

// ============================================
// 骨架屏组件
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
// 空状态组件
// ============================================

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
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
// 主页面组件
// ============================================

export default function HomePage() {
  const router = useRouter();
  const { status } = useSDK();
  const hostAPI = useHostAPI();
  const [userId, setUserId] = useState<string | null>(null);
  
  const { projects, isLoading, fetchProjects } = useProjectStore();

  // ============================================
  // 1. 获取用户信息
  // 使用 useRef 避免依赖变化导致无限循环
  // ============================================
  const hostAPIRef = React.useRef(hostAPI);
  hostAPIRef.current = hostAPI;

  useEffect(() => {
    console.log(`${LOG_PREFIX} 开始获取用户信息...`);
    void hostAPIRef.current.getUserInfo().then((info) => {
      console.log(`${LOG_PREFIX} 用户信息:`, info);
      if (info?.uid) {
        setUserId(info.uid);
        console.log(`${LOG_PREFIX} ✅ 设置 userId:`, info.uid);
      } else {
        // 开发环境降级
        setUserId('dev-user');
        console.log(`${LOG_PREFIX} ⚠️ 使用默认 userId: dev-user`);
      }
    });
  }, []); // 只在挂载时执行一次

  // ============================================
  // 2. 加载项目列表（依赖 userId）
  // ============================================
  useEffect(() => {
    if (userId) {
      console.log(`${LOG_PREFIX} 加载项目列表, userId:`, userId);
      void fetchProjects({ userId });
    }
  }, [userId, fetchProjects]);

  // ============================================
  // SDK 未就绪 - 显示加载动画
  // ============================================
  if (status !== 'running') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
      </div>
    );
  }

  // ============================================
  // 页面渲染
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 头部 - 简洁样式 */}
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
            新建项目
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Loading 状态 - 骨架屏 */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && projects.length === 0 && (
          <EmptyState onCreate={() => router.push('/create')} />
        )}

        {/* 项目列表 */}
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
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    project.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-600'
                      : project.status === 'running'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-gray-50 text-gray-500'
                  }`}>
                    {project.status === 'completed' ? '已完成' :
                     project.status === 'running' ? '进行中' : '待处理'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
