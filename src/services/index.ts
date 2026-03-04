/**
 * Services — 统一导出
 * 
 * 使用方式：
 * import { fetchEnterprises } from '@/services';
 * 
 * 或按业务域导入：
 * import { fetchEnterprises, fetchEnterprise } from '@/services/enterprise';
 */

// 客户端配置
export { USE_MOCK, API_BASE_URL } from './client';

// 企业服务
export { fetchEnterprises, fetchEnterprise, fetchBackgroundReport } from './enterprise';

// 走访服务
export { fetchVisitRecords, fetchVisitRecord, fetchDemands, fetchVisitStats } from './visit';

// 政策服务
export { fetchAssessments, fetchAssessment, fetchPolicyStats, fetchPMProgress } from './policy';

// 孵化器服务
export {
  fetchIncubatorEnterprises,
  fetchIncubatorEnterprise,
  fetchActivityReports,
  fetchChatMessages,
  fetchMatchResult,
  fetchIncubatorStats,
  fetchActivityRanking,
} from './incubator';

// 类型导出
export type { IncubatorStats, ActivityRanking } from './incubator';
