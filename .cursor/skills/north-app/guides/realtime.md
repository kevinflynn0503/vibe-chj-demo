# Realtime 订阅

## 启用 Realtime

**关键步骤：表必须加入 `supabase_realtime` publication！**

```sql
-- 在 Supabase 数据库中执行
ALTER PUBLICATION supabase_realtime ADD TABLE [app]_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE [app]_blocks;
```

## 订阅 Hook 实现

```typescript
// src/hooks/useProjectRealtime.ts
import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { useAppStateStore } from '@/store/app-state';

export function useProjectRealtime(projectId: string | null) {
  const projectChannelRef = useRef<RealtimeChannel | null>(null);
  const blocksChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // 前置条件检查
    if (!projectId) return;
    if (!isSupabaseConfigured()) return;
    if (projectId.startsWith('local-')) return;  // 跳过本地 ID

    const supabase = getSupabaseClient();
    const store = useAppStateStore.getState();

    // 1. 订阅项目表（UPDATE 事件）
    const projectChannel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'research_projects',
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          console.log('[Realtime] 项目更新:', payload.new);
          
          // 更新思维导图数据
          if (payload.new.mindmap_data) {
            store._updateMindmapData(payload.new.mindmap_data);
          }
          
          // 更新 PPT 数据
          if (payload.new.ppt_data) {
            store._updatePptData(payload.new.ppt_data);
          }
          
          // 更新状态
          if (payload.new.status) {
            store._updateProjectStatus(payload.new.status);
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] 项目订阅状态:', status);
      });

    projectChannelRef.current = projectChannel;

    // 2. 订阅报告块表（INSERT 和 UPDATE 事件）
    const blocksChannel = supabase
      .channel(`blocks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'report_blocks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('[Realtime] 新报告块:', payload.new);
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
          console.log('[Realtime] 报告块更新:', payload.new);
          store._updateReportBlock(payload.new as ReportBlock);
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] 报告块订阅状态:', status);
      });

    blocksChannelRef.current = blocksChannel;

    // 3. 清理函数
    return () => {
      console.log('[Realtime] 清理订阅...');
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
```

## 在页面中使用

```tsx
// src/app/(root)/detail/page.tsx
export default function DetailPage() {
  const projectId = useSearchParams().get('id');
  
  // 订阅实时更新
  useProjectRealtime(projectId);

  // 从 Store 获取数据（自动更新）
  const reportBlocks = useReportBlocks();
  const mindmapData = useMindmapData();
  const pptData = usePptData();

  return (
    <div>
      {/* 数据变化时自动重渲染 */}
      <ReportView blocks={reportBlocks} />
    </div>
  );
}
```

## Store 更新方法

```typescript
// src/store/app-state.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppStateStore {
  // 数据
  reportBlocks: ReportBlock[];
  mindmapData: MindmapData | null;
  pptData: PptData | null;
  projectStatus: string;

  // 内部更新方法（以 _ 开头）
  _addReportBlock: (block: ReportBlock) => void;
  _updateReportBlock: (block: ReportBlock) => void;
  _updateMindmapData: (data: MindmapData) => void;
  _updatePptData: (data: PptData) => void;
  _updateProjectStatus: (status: string) => void;
  _loadProjectData: (data: LoadProjectData) => void;
}

export const useAppStateStore = create<AppStateStore>()(
  devtools((set) => ({
    reportBlocks: [],
    mindmapData: null,
    pptData: null,
    projectStatus: 'pending',

    // 添加报告块（按 block_order 排序）
    _addReportBlock: (block) => {
      set((state) => {
        // 检查是否已存在
        const exists = state.reportBlocks.some(b => b.id === block.id);
        if (exists) {
          return state;  // 不重复添加
        }
        
        // 添加并排序
        const newBlocks = [...state.reportBlocks, block]
          .sort((a, b) => a.block_order - b.block_order);
        
        return { reportBlocks: newBlocks };
      });
    },

    // 更新报告块
    _updateReportBlock: (block) => {
      set((state) => ({
        reportBlocks: state.reportBlocks.map(b =>
          b.id === block.id ? block : b
        ),
      }));
    },

    _updateMindmapData: (data) => set({ mindmapData: data }),
    _updatePptData: (data) => set({ pptData: data }),
    _updateProjectStatus: (status) => set({ projectStatus: status }),

    // 加载项目数据（初始化时使用）
    _loadProjectData: (data) => {
      set({
        reportBlocks: data.blocks ?? [],
        mindmapData: data.mindmap ?? null,
        pptData: data.ppt ?? null,
        projectStatus: data.status ?? 'pending',
      });
    },
  }))
);

// 只读选择器
export const useReportBlocks = () => useAppStateStore(s => s.reportBlocks);
export const useMindmapData = () => useAppStateStore(s => s.mindmapData);
export const usePptData = () => useAppStateStore(s => s.pptData);
export const useProjectStatus = () => useAppStateStore(s => s.projectStatus);
```

## 数据流

```
Agent 执行
    │
    ├─→ INSERT report_blocks (block_type='title', block_order=1)
    │       ↓
    │   Supabase Realtime 推送
    │       ↓
    │   useProjectRealtime 接收
    │       ↓
    │   store._addReportBlock(block)
    │       ↓
    │   组件自动重渲染（显示标题）
    │
    ├─→ INSERT report_blocks (block_type='section', block_order=2)
    │       ↓
    │   ... 同上 ...
    │       ↓
    │   组件自动重渲染（显示第一章）
    │
    └─→ UPDATE research_projects SET status='completed'
            ↓
        Supabase Realtime 推送
            ↓
        useProjectRealtime 接收
            ↓
        store._updateProjectStatus('completed')
            ↓
        组件自动重渲染（显示完成状态）
```

## 最佳实践

### 1. 使用 ref 存储 channel

```typescript
const channelRef = useRef<RealtimeChannel | null>(null);

// 避免重复订阅
if (channelRef.current) {
  await supabase.removeChannel(channelRef.current);
}

channelRef.current = supabase.channel(...).subscribe();
```

### 2. 正确清理订阅

```typescript
useEffect(() => {
  const channel = subscribe();
  
  return () => {
    // ⚠️ 必须清理，否则内存泄漏！
    void supabase.removeChannel(channel);
  };
}, [projectId]);
```

### 3. 防止重复添加

```typescript
_addReportBlock: (block) => {
  set((state) => {
    // 检查是否已存在
    const exists = state.reportBlocks.some(b => b.id === block.id);
    if (exists) return state;
    
    return {
      reportBlocks: [...state.reportBlocks, block],
    };
  });
},
```

### 4. 跳过本地 ID

```typescript
// 本地创建的项目 ID 以 'local-' 开头
if (projectId.startsWith('local-')) {
  console.log('[Realtime] 跳过本地项目订阅');
  return;
}
```

### 5. 记录订阅状态

```typescript
.subscribe((status) => {
  console.log('[Realtime] 订阅状态:', status);
  // status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR'
});
```

## 调试技巧

### 检查 Realtime 是否启用

```sql
-- 查看当前 publication 包含的表
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

### 检查订阅状态

```typescript
const channel = supabase.channel('test');

channel.subscribe((status, err) => {
  console.log('状态:', status);
  if (err) console.error('错误:', err);
});
```

### 手动触发测试

```sql
-- 手动更新数据，观察前端是否收到
UPDATE research_projects 
SET status = 'completed' 
WHERE id = 'xxx';
```
