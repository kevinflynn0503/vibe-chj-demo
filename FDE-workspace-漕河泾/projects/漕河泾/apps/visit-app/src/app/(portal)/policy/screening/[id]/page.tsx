/**
 * 政策初筛详情
 * 
 * 统一规范：
 * - 头部：bg-white border-b → max-w-[1200px] mx-auto px-4 sm:px-6 py-4
 * - 返回按钮：text-xs text-slate-500 hover:text-[#3370FF], ArrowLeft h-3.5, mb-3
 * - 标题：text-lg font-bold text-slate-900
 * - 内容：max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6
 * - 背景：min-h-screen bg-[#F5F6F7]
 */
'use client';

import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquare,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssessment } from '@/lib/mock-data';
import { GRADE_STYLES, TOUCH_STATUS_LABELS } from '@/lib/schema';
import { sendChat, dispatchTasks } from '@/lib/host-api';

const GRADE_TAG_MAP: Record<string, string> = {
  A: 'tag-green',
  B: 'tag-blue',
  C: 'tag-orange',
  unqualified: 'tag-gray',
};

export default function ScreeningDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const assessment = getAssessment(id);

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#F5F6F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-slate-500">未找到评估记录 {id}</p>
          <button className="btn btn-primary btn-sm mt-4" onClick={() => router.back()}>返回</button>
        </div>
      </div>
    );
  }

  const gradeTag = GRADE_TAG_MAP[assessment.grade] ?? 'tag-gray';
  const gradeLabel = GRADE_STYLES[assessment.grade]?.label ?? assessment.grade;
  const passCount = assessment.screening_details.filter((d) => d.result === 'pass').length;
  const pendingCount = assessment.screening_details.filter((d) => d.result === 'pending').length;
  const failCount = assessment.screening_details.filter((d) => d.result === 'fail').length;
  const missingFields = assessment.screening_details.filter((d) => d.result === 'pending');

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 — 统一模板B */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回政策服务
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900">
                  {assessment.enterprise_name} · {assessment.policy_type}
                </h1>
                <span className={cn('tag pill', gradeTag)}>{gradeLabel}</span>
                <span className="text-xs text-slate-500 font-mono">{assessment.grade_score}分</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="tag tag-gray pill">{TOUCH_STATUS_LABELS[assessment.touch_status]}</span>
                {assessment.assigned_to && (
                  <span>分配: {assessment.assigned_to}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                className="btn btn-default btn-sm"
                onClick={() =>
                  sendChat(
                    `为「${assessment.enterprise_name}」的${assessment.policy_type}生成走访问题，重点确认：${missingFields.map((f) => f.rule_name).join('、')}`
                  )
                }
              >
                <MessageSquare className="h-3.5 w-3.5" /> 生成走访问题
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => dispatchTasks(assessment.grade, 1)}
              >
                <Send className="h-3.5 w-3.5" /> 分发任务
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 内容 — 统一 max-w-[1200px] */}
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* 缺失数据提示 */}
        {pendingCount > 0 && (
          <div className="alert-bar alert-bar-warning">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="text-sm">
              {pendingCount} 项待确认：{missingFields.map((f) => f.rule_name).join('、')}
            </span>
          </div>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <div>
              <div className="text-xs text-slate-500">通过</div>
              <div className="text-xl font-bold font-mono text-emerald-600">{passCount}</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <div>
              <div className="text-xs text-slate-500">待确认</div>
              <div className="text-xl font-bold font-mono text-amber-600">{pendingCount}</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3">
            <XCircle className="h-4 w-4 text-red-600" />
            <div>
              <div className="text-xs text-slate-500">不符合</div>
              <div className="text-xl font-bold font-mono text-red-600">{failCount}</div>
            </div>
          </div>
        </div>

        {/* 逐项审查表 */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-900">逐项审查</span>
          </div>
          <div className="overflow-x-auto">
            <table className="dtable">
              <thead>
                <tr>
                  <th style={{ width: '32px' }}>#</th>
                  <th>条件</th>
                  <th>类型</th>
                  <th>企业值</th>
                  <th>要求</th>
                  <th>结果</th>
                  <th>来源</th>
                  <th>置信</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                {assessment.screening_details.map((d, i) => (
                  <tr
                    key={i}
                    className={cn(d.result === 'pending' && 'bg-amber-50/50')}
                  >
                    <td className="text-center text-slate-500 font-mono">{i + 1}</td>
                    <td className="font-medium text-slate-900">{d.rule_name}</td>
                    <td>
                      <span
                        className={cn(
                          'tag pill',
                          d.rule_type === 'hard' ? 'tag-red' : 'tag-gray'
                        )}
                      >
                        {d.rule_type === 'hard' ? '硬性' : '加分'}
                      </span>
                    </td>
                    <td>
                      {d.enterprise_value || (
                        <span className="text-slate-400 italic">未获取</span>
                      )}
                    </td>
                    <td className="text-slate-600">{d.required_value}</td>
                    <td>
                      {d.result === 'pass' && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                      {d.result === 'fail' && (
                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                      )}
                      {d.result === 'pending' && (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      )}
                    </td>
                    <td>
                      <span className="source-tag">{d.data_source || '-'}</span>
                    </td>
                    <td>
                      {d.confidence && (
                        <span
                          className={cn(
                            'tag pill',
                            d.confidence === 'high'
                              ? 'tag-green'
                              : d.confidence === 'medium'
                                ? 'tag-orange'
                                : 'tag-red'
                          )}
                        >
                          {d.confidence === 'high'
                            ? '高'
                            : d.confidence === 'medium'
                              ? '中'
                              : '低'}
                        </span>
                      )}
                    </td>
                    <td className="text-xs text-slate-500 max-w-[140px]">{d.note ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
