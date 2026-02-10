/**
 * Realtime 订阅 Hook
 * 订阅 Supabase 表的实时变化，自动更新前端状态
 *
 * 核心模式：
 * 1. 优先 Realtime（WebSocket）
 * 2. 订阅失败时自动降级为轮询
 * 3. 清理时同时取消订阅和轮询
 */

'use client';

import type { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useRef } from 'react';

import {
  getSupabaseClient,
  isSupabaseConfigured,
  getProject,
} from '@/lib/supabase';
import { useAppStateStore } from '@/store/app-state';

// ⚠️ 修改此处为你的 App 名称
const LOG_PREFIX = '[your-app-name]';

// ⚠️ 修改此处为你的表名
const TABLE_NAME = 'projects';

// 轮询间隔
const POLL_INTERVAL = 5000;

/**
 * 订阅项目 Realtime 更新
 */
export function useProjectRealtime(projectId: string | null) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!projectId || !isSupabaseConfigured() || projectId.startsWith('local-')) {
      return;
    }

    console.log(`${LOG_PREFIX} 📡 订阅 Realtime:`, projectId);

    const supabase = getSupabaseClient();

    // ============================================
    // 轮询 Fallback
    // ============================================
    const startPolling = () => {
      if (pollingTimerRef.current) return;

      console.log(`${LOG_PREFIX} 🔄 启动轮询备份`);

      pollingTimerRef.current = setInterval(() => {
        void (async () => {
          try {
            const store = useAppStateStore.getState();
            const project = await getProject(projectId);

            if (project && project.status !== store.currentProject?.status) {
              console.log(`${LOG_PREFIX} 🔄 轮询发现状态变化:`, project.status);
              store._updateProject(projectId, { status: project.status });
            }
          } catch (error) {
            console.error(`${LOG_PREFIX} 轮询失败:`, error);
          }
        })();
      }, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };

    // ============================================
    // Realtime 订阅
    // ============================================
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: TABLE_NAME,
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          console.log(`${LOG_PREFIX} 📥 Realtime 更新:`, payload);
          const newData = payload.new as Record<string, unknown>;
          const store = useAppStateStore.getState();

          // 更新状态
          store._updateProject(projectId, newData as Partial<typeof store.currentProject & object>);
        },
      )
      .subscribe((status, err) => {
        const statusStr = String(status);
        console.log(`${LOG_PREFIX} 订阅状态:`, status);

        if (err) {
          console.error(`${LOG_PREFIX} ❌ 订阅错误:`, err);
        }

        if (statusStr === 'SUBSCRIBED') {
          console.log(`${LOG_PREFIX} ✅ Realtime 订阅成功`);
        } else if (statusStr === 'CHANNEL_ERROR' || statusStr === 'TIMED_OUT') {
          console.error(`${LOG_PREFIX} ❌ Realtime 订阅失败，启动轮询`);
          startPolling();
        }
      });

    channelRef.current = channel;

    // 清理
    return () => {
      console.log(`${LOG_PREFIX} 取消 Realtime 订阅`);
      stopPolling();
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [projectId]);
}
