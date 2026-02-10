/**
 * Zustand Store 模板
 * 
 * 功能：
 * 1. 项目列表状态管理
 * 2. CRUD 操作
 * 3. 与 Realtime 配合使用
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { listProjects, createProject, updateProject, deleteProject } from '@/lib/supabase';

// ============================================
// 类型定义
// ============================================

interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

interface ProjectStore {
  // 状态
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // 查询方法
  fetchProjects: (params: { userId: string }) => Promise<void>;
  fetchProject: (id: string) => Promise<Project | null>;

  // CRUD 方法
  createNewProject: (params: {
    userId: string;
    title: string;
    description?: string;
  }) => Promise<Project | null>;
  updateProjectStatus: (id: string, status: Project['status']) => Promise<void>;
  removeProject: (id: string) => Promise<void>;

  // 工具方法
  setCurrentProject: (project: Project | null) => void;
  setError: (error: string | null) => void;

  // 内部更新方法（供 Realtime 使用）
  _addProject: (project: Project) => void;
  _updateProject: (id: string, updates: Partial<Project>) => void;
  _removeProject: (id: string) => void;
}

// ============================================
// Store 实现
// ============================================

export const useProjectStore = create<ProjectStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      // ============================================
      // 查询方法
      // ============================================

      fetchProjects: async ({ userId }) => {
        set({ isLoading: true, error: null });
        try {
          const data = await listProjects(userId);
          set({ projects: data ?? [], isLoading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : '加载失败',
            isLoading: false,
          });
        }
      },

      fetchProject: async (id) => {
        try {
          const project = await getProject(id);
          if (project) {
            set({ currentProject: project });
          }
          return project;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : '加载失败' });
          return null;
        }
      },

      // ============================================
      // CRUD 方法
      // ============================================

      createNewProject: async ({ userId, title, description }) => {
        try {
          const project = await createProject({ userId, title, description });
          if (project) {
            set((state) => ({
              projects: [project, ...state.projects],
            }));
          }
          return project;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : '创建失败' });
          return null;
        }
      },

      updateProjectStatus: async (id, status) => {
        try {
          await updateProject(id, { status });
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? { ...p, status } : p
            ),
            currentProject:
              state.currentProject?.id === id
                ? { ...state.currentProject, status }
                : state.currentProject,
          }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : '更新失败' });
        }
      },

      removeProject: async (id) => {
        try {
          await deleteProject(id);
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProject:
              state.currentProject?.id === id ? null : state.currentProject,
          }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : '删除失败' });
        }
      },

      // ============================================
      // 工具方法
      // ============================================

      setCurrentProject: (project) => set({ currentProject: project }),
      setError: (error) => set({ error }),

      // ============================================
      // 内部更新方法（供 Realtime Hook 使用）
      // ============================================

      _addProject: (project) => {
        set((state) => {
          // 检查是否已存在
          const exists = state.projects.some((p) => p.id === project.id);
          if (exists) return state;

          return {
            projects: [project, ...state.projects],
          };
        });
      },

      _updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, ...updates }
              : state.currentProject,
        }));
      },

      _removeProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject:
            state.currentProject?.id === id ? null : state.currentProject,
        }));
      },
    }),
    { name: 'project-store' }
  )
);

// ============================================
// 只读选择器（用于组件中获取状态）
// ============================================

export const useProjects = () => useProjectStore((s) => s.projects);
export const useCurrentProject = () => useProjectStore((s) => s.currentProject);
export const useIsLoading = () => useProjectStore((s) => s.isLoading);
export const useError = () => useProjectStore((s) => s.error);
