/**
 * Zustand Store
 *
 * 架构要点：
 * - 数据来源：Supabase 数据库
 * - 更新方式：Realtime 订阅 + 轮询 fallback
 * - _update* 方法仅供 useProjectRealtime 和数据加载使用
 * - 外部组件通过只读选择器访问状态
 */

'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { Project } from '@/lib/supabase';

// ============================================
// Store 接口
// ============================================

export interface AppStateStore {
  // 状态
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // 内部更新方法（供 Realtime Hook 和数据加载使用）
  _setProjects: (projects: Project[]) => void;
  _addProject: (project: Project) => void;
  _updateProject: (id: string, updates: Partial<Project>) => void;
  _removeProject: (id: string) => void;
  _setCurrentProject: (project: Project | null) => void;
  _setLoading: (loading: boolean) => void;
  _setError: (error: string | null) => void;
}

// ============================================
// Store 实现
// ============================================

export const useAppStateStore = create<AppStateStore>()(
  devtools(
    (set) => ({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      _setProjects: (projects) => {
        set({ projects, isLoading: false }, false, 'setProjects');
      },

      _addProject: (project) => {
        set(
          (state) => {
            const exists = state.projects.some((p) => p.id === project.id);
            if (exists) return state;
            return { projects: [project, ...state.projects] };
          },
          false,
          'addProject',
        );
      },

      _updateProject: (id, updates) => {
        set(
          (state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? { ...p, ...updates } : p,
            ),
            currentProject:
              state.currentProject?.id === id
                ? { ...state.currentProject, ...updates }
                : state.currentProject,
          }),
          false,
          'updateProject',
        );
      },

      _removeProject: (id) => {
        set(
          (state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProject:
              state.currentProject?.id === id ? null : state.currentProject,
          }),
          false,
          'removeProject',
        );
      },

      _setCurrentProject: (project) => {
        set({ currentProject: project }, false, 'setCurrentProject');
      },

      _setLoading: (isLoading) => set({ isLoading }),
      _setError: (error) => set({ error }),
    }),
    { name: 'AppState' },
  ),
);

// ============================================
// 只读选择器
// ============================================

export const useProjects = () => useAppStateStore((s) => s.projects);
export const useCurrentProject = () => useAppStateStore((s) => s.currentProject);
export const useIsLoading = () => useAppStateStore((s) => s.isLoading);
export const useError = () => useAppStateStore((s) => s.error);
