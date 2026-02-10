/**
 * 数据类型定义
 *
 * ⚠️ 根据你的业务需要修改这些类型
 * 保持和 Supabase schema + xiaobei-manifest.json 一致
 */

import { z } from 'zod';

// ============================================
// 项目状态
// ============================================

export type ProjectStatus = 'pending' | 'running' | 'completed' | 'failed';

// ============================================
// Activity State Schema（和 xiaobei-manifest.json 一致）
// ============================================

export const ActivityAppStateSchema = z.object({
  projectId: z.string().describe('项目ID'),
});
export type ActivityAppState = z.infer<typeof ActivityAppStateSchema>;

export const ActivityStateSchema = z.object({
  app_state: ActivityAppStateSchema,
  content: z.record(z.string(), z.unknown()),
});
export type ActivityState = z.infer<typeof ActivityStateSchema>;

// ============================================
// 你的业务类型定义
// ⚠️ 在这里添加更多类型
// ============================================

// 示例：如果你的 App 是企业走访
// export interface VisitRecord {
//   id: string;
//   enterprise_name: string;
//   visit_date: string;
//   notes: string;
//   status: ProjectStatus;
// }
