/**
 * 政策初筛详情 — AI 深度融入版
 * 
 * 改造：
 * 1. 增加 AI 分析摘要（一段话总结评估结果）
 * 2. 待确认项增加"AI 补齐数据"按钮
 * 3. 增加 AI 下一步建议
 * 4. 简化布局，聚焦关键信息
 */
'use client';

import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, AlertCircle, XCircle, MessageSquare,
  Send, AlertTriangle, Bot, Sparkles, Search, ChevronRight, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssessment, getEnterprise } from '@/lib/mock-data';
import { GRADE_STYLES, TOUCH_STATUS_LABELS } from '@/lib/schema';
import { sendChat, dispatchTasks } from '@/lib/host-api';

const GRADE_TAG_MAP: Record<string, string> = {
  A: 'tag-green', B: 'tag-blue', C: 'tag-orange', unqualified: 'tag-gray',
};

export default function ScreeningDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const assessment = getAssessment(id);
  const enterprise = assessment ? getEnterprise(assessment.enterprise_id) : null;

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

  const name = enterprise?.short_name ?? enterprise?.name ?? assessment.enterprise_name;
  const gradeTag = GRADE_TAG_MAP[assessment.grade] ?? 'tag-gray';
  const gradeLabel = GRADE_STYLES[assessment.grade]?.label ?? assessment.grade;
  const passCount = assessment.screening_details.filter(d => d.result === 'pass').length;
  const pendingCount = assessment.screening_details.filter(d => d.result === 'pending').length;
  const failCount = assessment.screening_details.filter(d => d.result === 'fail').length;
  const total = assessment.screening_details.length;
  const missingFields = assessment.screening_details.filter(d => d.result === 'pending');

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> 返回
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900">{name} · 初筛详情</h1>
                <span className={cn('tag pill', gradeTag)}>{gradeLabel}</span>
                <span className="text-xs text-slate-500 font-mono">{assessment.grade_score}分</span>
                <span className="flex items-center gap-1 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">
                  <Bot className="h-3 w-3" /> AI 初筛
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="tag tag-gray pill">{TOUCH_STATUS_LABELS[assessment.touch_status]}</span>
                {assessment.assigned_to && <span>负责人: {assessment.assigned_to}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="btn btn-default btn-sm"
                onClick={() => router.push(`/enterprises/${assessment.enterprise_id}`)}>
                企业画像
              </button>
              {assessment.touch_status === 'willing' && (
                <button className="btn btn-default btn-sm text-emerald-600"
                  onClick={() => router.push(`/policy/diagnosis/${id}`)}>
                  进入诊断
                </button>
              )}
              <button className="btn btn-primary btn-sm"
                onClick={() => sendChat(`请对「${name}」进行 Deep Research，补齐以下缺失数据：${missingFields.map(f => f.rule_name).join('、')}`)}>
                <Sparkles className="h-3.5 w-3.5" /> AI 补齐数据
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* AI 分析摘要 */}
        <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Bot className="h-5 w-5 text-[#3370FF] shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-900">AI 分析摘要</span>
                <span className="text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">✦ AI 生成</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                「{name}」经 AI 评估 {total} 项高新认定条件，{passCount} 项通过、{pendingCount} 项待确认、{failCount} 项不符合，
                综合评分 {assessment.grade_score} 分，评级 {gradeLabel}。
                {assessment.grade === 'A' && '各项硬性条件基本满足，建议尽快安排触达走访，确认申报意愿。'}
                {assessment.grade === 'B' && `需要进一步确认 ${missingFields.map(f => f.rule_name).join('、')}，建议通过走访或 AI Deep Research 补齐数据。`}
                {assessment.grade === 'C' && '多项关键数据缺失，建议先通过 AI Deep Research 补齐信息后重新评估。'}
                数据来源包括企业工商信息库、知识产权数据库{pendingCount > 0 ? '，部分数据由 AI 从公开资料推测（置信度标注于表中）' : ''}。
              </p>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold font-mono text-slate-900">{total}</div>
            <div className="text-xs text-slate-500 mt-0.5">评估项</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold font-mono text-emerald-600">{passCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">通过</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold font-mono text-amber-600">{pendingCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">待确认</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold font-mono text-red-600">{failCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">不符合</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 左：逐项审查 */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">逐项审查</span>
                <span className="flex items-center gap-0.5 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded"><Bot className="h-3 w-3" /> AI 自动评估</span>
              </div>
              <div className="divide-y divide-slate-100">
                {assessment.screening_details.map((d, i) => (
                  <div key={i} className={cn("px-4 py-3", d.result === 'pending' && 'bg-amber-50/30')}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {d.result === 'pass' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                        {d.result === 'fail' && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                        {d.result === 'pending' && <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                        <span className="text-sm font-medium text-slate-900">{d.rule_name}</span>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded border',
                          d.rule_type === 'hard' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                        )}>{d.rule_type === 'hard' ? '硬性' : '加分'}</span>
                      </div>
                      {d.confidence && (
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded border',
                          d.confidence === 'high' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          d.confidence === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                        )}>置信 {d.confidence === 'high' ? '高' : d.confidence === 'medium' ? '中' : '低'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 pl-5.5">
                      <span>企业值: <span className="text-slate-700 font-medium">{d.enterprise_value || '未获取'}</span></span>
                      <span>要求: <span className="text-slate-700">{d.required_value || '-'}</span></span>
                      {d.data_source && <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 rounded">来源: {d.data_source}</span>}
                    </div>
                    {d.result === 'pending' && (
                      <div className="flex items-center gap-2 mt-2 pl-5.5">
                        <button className="flex items-center gap-1 text-[10px] font-medium text-[#3370FF] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-100 transition-colors"
                          onClick={() => sendChat(`请通过 Deep Research 查找「${name}」的「${d.rule_name}」相关数据，从公开年报、新闻、知识产权数据库中搜集。`)}>
                          <Search className="h-3 w-3" /> AI 补齐此项
                        </button>
                        <button className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-[#3370FF] px-2 py-1 transition-colors"
                          onClick={() => sendChat(`为「${name}」生成走访问题，重点确认「${d.rule_name}」`)}>
                          <MessageSquare className="h-3 w-3" /> 生成走访问题
                        </button>
                      </div>
                    )}
                    {d.note && <div className="text-[10px] text-slate-400 mt-1 pl-5.5">{d.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右：AI 建议 + 操作 */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI 下一步建议 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#3370FF]" />
                <h2 className="text-sm font-bold text-slate-900">AI 建议下一步</h2>
              </div>
              <div className="p-4 space-y-3">
                {assessment.grade === 'A' && (
                  <>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700 leading-relaxed">
                      <strong>建议立即触达：</strong>该企业各项指标表现优异，A 级企业优先安排走访，时效要求 3 天内。
                    </div>
                    <button className="w-full btn btn-primary btn-sm justify-center" onClick={() => dispatchTasks(assessment.grade, 1)}>
                      <Send className="h-3.5 w-3.5" /> 分发走访任务
                    </button>
                  </>
                )}
                {assessment.grade === 'B' && (
                  <>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 leading-relaxed">
                      <strong>建议先补齐数据：</strong>{missingFields.map(f => f.rule_name).join('、')} 待确认，可通过 AI Deep Research 或走访补齐。
                    </div>
                    <button className="w-full btn btn-default btn-sm justify-center"
                      onClick={() => sendChat(`请对「${name}」进行 Deep Research，补齐：${missingFields.map(f => f.rule_name).join('、')}`)}>
                      <Search className="h-3.5 w-3.5" /> AI 批量补齐数据
                    </button>
                  </>
                )}
                {assessment.grade === 'C' && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 leading-relaxed">
                    <strong>建议持续关注：</strong>当前条件不充分，建议关注该企业后续发展，下轮筛选时重新评估。
                  </div>
                )}
                <button className="w-full btn btn-default btn-sm justify-center"
                  onClick={() => sendChat(`请对「${name}」的高新技术企业认定资质进行深度分析，逐条评估各项条件，给出详细的改进建议和可行性评估。`)}>
                  <Sparkles className="h-3.5 w-3.5" /> AI 深度分析
                </button>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">快捷操作</h2>
              </div>
              <div className="divide-y divide-slate-100">
                <button onClick={() => router.push(`/enterprises/${assessment.enterprise_id}`)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                  <span>查看企业画像</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                {assessment.touch_status === 'willing' && (
                  <button onClick={() => router.push(`/policy/diagnosis/${id}`)}
                    className="w-full flex items-center justify-between px-4 py-3 text-xs text-emerald-600 font-medium hover:bg-slate-50 transition-colors">
                    <span>进入申报诊断</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
                <button onClick={() => {
                  const entId = assessment.enterprise_id;
                  router.push(`/visit/${entId}?from=policy&policy=高新技术企业认定`);
                }}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs text-[#3370FF] font-medium hover:bg-slate-50 transition-colors">
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> 准备走访（带政策问题）</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
