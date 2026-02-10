/**
 * Realtime Hook 模板
 * 
 * 功能：
 * 1. 订阅 Supabase Realtime 更新
 * 2. 自动更新 Zustand Store
 * 3. 组件卸载时自动清理
 */
import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { useAppStateStore } from '@/store/app-state';

// 日志前缀
const LOG_PREFIX = '[Realtime]';

// ============================================
// 类型定义
// ============================================

interface ReportBlock {
  id: string;
  project_id: string;
  user_id: string;
  block_type: string;
  block_order: number;
  title?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============================================
// Realtime Hook
// ============================================

/**
 * 订阅项目实时更新
 * 
 * @param projectId 项目 ID
 * 
 * @example
 * ```tsx
 * export default function DetailPage() {
 *   const projectId = useSearchParams().get('id');
 *   
 *   // 订阅实时更新
 *   useProjectRealtime(projectId);
 * 
 *   // 数据自动更新
 *   const blocks = useReportBlocks();
 *   
 *   return <ReportView blocks={blocks} />;
 * }
 * ```
 */
export function useProjectRealtime(projectId: string | null) {
  const projectChannelRef = useRef<RealtimeChannel | null>(null);
  const blocksChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // ============================================
    // 前置条件检查
    // ============================================
    if (!projectId) {
      console.log(`${LOG_PREFIX} projectId 为空，跳过订阅`);
      return;
    }

    if (!isSupabaseConfigured()) {
      console.log(`${LOG_PREFIX} Supabase 未配置，跳过订阅`);
      return;
    }

    // 跳过本地 ID（以 'local-' 开头）
    if (projectId.startsWith('local-')) {
      console.log(`${LOG_PREFIX} 本地项目，跳过订阅`);
      return;
    }

    console.log(`${LOG_PREFIX} 开始订阅项目:`, projectId);

    const supabase = getSupabaseClient();
    const store = useAppStateStore.getState();

    // ============================================
    // 1. 订阅项目表（UPDATE 事件）
    // ============================================
    const projectChannel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'research_projects',  // 替换为你的表名
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          console.log(`${LOG_PREFIX} 项目更新:`, payload.new);

          const newData = payload.new as Record<string, unknown>;

          // 更新思维导图数据
          if (newData.mindmap_data) {
            store._updateMindmapData(newData.mindmap_data as MindmapData);
          }

          // 更新 PPT 数据
          if (newData.ppt_data) {
            store._updatePptData(newData.ppt_data as PptData);
          }

          // 更新状态
          if (newData.status) {
            store._updateProjectStatus(newData.status as string);
          }
        }
      )
      .subscribe((status) => {
        console.log(`${LOG_PREFIX} 项目订阅状态:`, status);
      });

    projectChannelRef.current = projectChannel;

    // ============================================
    // 2. 订阅报告块表（INSERT 和 UPDATE 事件）
    // ============================================
    const blocksChannel = supabase
      .channel(`blocks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'report_blocks',  // 替换为你的表名
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log(`${LOG_PREFIX} 新报告块:`, payload.new);
          store._addReportBlock(payload.new as ReportBlock);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'report_blocks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log(`${LOG_PREFIX} 报告块更新:`, payload.new);
          store._updateReportBlock(payload.new as ReportBlock);
        }
      )
      .subscribe((status) => {
        console.log(`${LOG_PREFIX} 报告块订阅状态:`, status);
      });

    blocksChannelRef.current = blocksChannel;

    // ============================================
    // 3. 清理函数
    // ============================================
    return () => {
      console.log(`${LOG_PREFIX} 清理订阅...`);

      if (projectChannelRef.current) {
        void supabase.removeChannel(projectChannelRef.current);
        projectChannelRef.current = null;
      }

      if (blocksChannelRef.current) {
        void supabase.removeChannel(blocksChannelRef.current);
        blocksChannelRef.current = null;
      }
    };
  }, [projectId]);
}

// ============================================
// 辅助类型（根据实际项目调整）
// ============================================

interface MindmapData {
  nodes: unknown[];
  edges: unknown[];
}

interface PptData {
  slides: unknown[];
}
