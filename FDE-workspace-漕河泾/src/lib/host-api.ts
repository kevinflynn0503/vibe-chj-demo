/**
 * host-api.ts — 与小北宿主的通信封装
 *
 * Demo 阶段：所有 AI 操作用 toast 模拟
 * Production：通过 SDK sendChat 调用小北 Agent
 */

import { toast } from 'sonner';

/**
 * 发送消息给小北，触发 Agent 执行
 * @param message - prompt 内容
 */
export function sendChat(message: string) {
  // TODO: Production 阶段接入真实 SDK
  // import { useSDK } from '@/contexts/sdk-context';
  // const { sendChat } = useSDK();
  // await sendChat({ message });

  toast.info(`已发送至小北 Agent`, {
    description: message,
    duration: 3000,
  });
}

/** 生成背调报告 */
export function generateReport(enterpriseName: string) {
  sendChat(`为「${enterpriseName}」生成背调报告，包含工商信息、股权结构、融资情况、核心团队、产品技术、行业动态、产业链分析，并生成沟通清单和必问问题。`);
}

/** 关联飞书妙记 */
export function linkMinute(enterpriseName: string, minuteId?: string) {
  const msg = minuteId
    ? `将飞书妙记 ${minuteId} 与「${enterpriseName}」关联，提取走访记录`
    : `查找最近的飞书妙记并与「${enterpriseName}」关联`;
  sendChat(msg);
}

/** 启动政策筛选 */
export function startScreening(policyType: string = '高新技术企业认定') {
  sendChat(`对全部企业启动「${policyType}」初筛，按规则逐项评估并生成分级结果。`);
}

/** 分发触达任务 */
export function dispatchTasks(grade: string, count: number) {
  sendChat(`为 ${count} 家 ${grade} 级企业创建走访触达任务，分配给对应项目经理并创建飞书日历和任务。`);
}

/** 订单匹配 */
export function matchOrder(query: string) {
  sendChat(query);
}

/** 导出飞书文档 */
export function exportToFeishu(enterpriseName: string, docType: string) {
  sendChat(`将「${enterpriseName}」的${docType}导出为飞书文档。`);
}
