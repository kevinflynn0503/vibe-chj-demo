/**
 * 走访跟进详情页
 * 
 * 展示 AI 跟进建议、需求处理进度、AI 分析功能
 * 而非简单跳转到企业库
 */
'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import {
  ArrowLeft, Sparkles, Bot, CheckCircle2, Clock, AlertTriangle,
  Building2, Phone, Send, FileText, Target, TrendingUp,
  Lightbulb, ArrowRight, ChevronRight, MessageSquare
} from 'lucide-react';
import { getEnterprise, getVisitRecords, getDemands, getBackgroundReport } from '@/lib/mock-data';
import { sendChat } from '@/lib/host-api';
import { cn } from '@/lib/utils';

function FollowPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const enterpriseId = params.id as string;
  const demandId = searchParams.get('demand');

  const enterprise = getEnterprise(enterpriseId);
  const allDemands = getDemands(enterpriseId);
  const records = getVisitRecords(enterpriseId);
  const report = getBackgroundReport(enterpriseId);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // 当前聚焦的需求
  const focusDemand = demandId ? allDemands.find(d => d.id === demandId) : allDemands[0];

  // AI 生成的跟进建议（mock）
  const aiSuggestions = [
    {
      type: 'action' as const,
      title: '建议联系对接部门跟进',
      content: focusDemand?.assigned_department
        ? `${focusDemand.assigned_department}已分配此需求，建议本周内联系确认处理进展并反馈给企业。`
        : '该需求尚未分配对口部门，建议优先确认需求类型并分配。',
      priority: 'high' as const,
    },
    {
      type: 'insight' as const,
      title: '企业背景分析',
      content: enterprise?.ai_summary || `${enterprise?.short_name ?? enterprise?.name}近期有业务扩展迹象，建议借此次跟进机会了解更多合作可能。`,
      priority: 'medium' as const,
    },
    {
      type: 'timing' as const,
      title: '最佳跟进时机',
      content: '根据历史走访数据，该企业偏好周三/四下午沟通。上次走访距今已超过2周，建议尽快安排。',
      priority: 'medium' as const,
    },
    {
      type: 'risk' as const,
      title: '潜在风险提示',
      content: '该需求已超过5个工作日未处理，若持续拖延可能影响企业满意度和后续合作意愿。',
      priority: 'high' as const,
    },
  ];

  if (!enterprise) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 text-sm">企业不存在</div>
          <button className="text-[#3370FF] text-sm mt-2" onClick={() => router.push('/visit')}>返回看板</button>
        </div>
      </div>
    );
  }

  const handleAiAnalyze = () => {
    setAiAnalyzing(true);
    sendChat(`请对「${enterprise.short_name ?? enterprise.name}」的需求「${focusDemand?.demand_content}」进行深度分析，给出跟进策略建议和风险评估。`);
    setTimeout(() => setAiAnalyzing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.push('/visit')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回走访看板
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{enterprise.short_name ?? enterprise.name}</h1>
                <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100">跟进中</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {allDemands.length} 条需求待跟进 · 已走访 {records.length} 次
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-default btn-sm"
                onClick={() => router.push(`/enterprises/${enterpriseId}`)}
              >
                <Building2 className="h-3.5 w-3.5" /> 企业详情
              </button>
              <button
                className={cn("btn btn-primary btn-sm", aiAnalyzing && "opacity-60")}
                onClick={handleAiAnalyze}
                disabled={aiAnalyzing}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {aiAnalyzing ? 'AI 分析中...' : 'AI 深度分析'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 左栏 3/5：需求 + AI 建议 */}
          <div className="lg:col-span-3 space-y-4">
            {/* 当前聚焦需求 */}
            {focusDemand && (
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-[#3370FF]" />
                  <h2 className="text-sm font-bold text-slate-900">当前跟进需求</h2>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded",
                    focusDemand.status === 'pending' ? 'bg-red-50 text-red-600 border border-red-100' :
                    focusDemand.status === 'processing' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  )}>
                    {focusDemand.status === 'pending' ? '待处理' : focusDemand.status === 'processing' ? '处理中' : '已完成'}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-3">
                  <p className="text-sm text-slate-700 leading-relaxed">{focusDemand.demand_content}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {focusDemand.demand_type && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />类型: {focusDemand.demand_type}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />分配: {focusDemand.assigned_department || '待分配'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />提出: {new Date(focusDemand.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            )}

            {/* AI 跟进建议 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-4 w-4 text-[#3370FF]" />
                <h2 className="text-sm font-bold text-slate-900">AI 跟进建议</h2>
                <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-[#3370FF] rounded">✦ AI 生成</span>
              </div>
              <div className="space-y-3">
                {aiSuggestions.map((s, i) => (
                  <div key={i} className={cn("rounded-lg p-3 border", 
                    s.priority === 'high' ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      {s.type === 'action' && <Send className="h-3.5 w-3.5 text-[#3370FF]" />}
                      {s.type === 'insight' && <Lightbulb className="h-3.5 w-3.5 text-amber-500" />}
                      {s.type === 'timing' && <Clock className="h-3.5 w-3.5 text-emerald-500" />}
                      {s.type === 'risk' && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                      <span className="text-xs font-semibold text-slate-900">{s.title}</span>
                      {s.priority === 'high' && (
                        <span className="text-[10px] px-1 py-0.5 bg-red-100 text-red-600 rounded">重要</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-5">{s.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 所有需求列表 */}
            {allDemands.length > 1 && (
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h2 className="text-sm font-bold text-slate-900 mb-3">全部需求 ({allDemands.length})</h2>
                <div className="space-y-2">
                  {allDemands.map(d => (
                    <div key={d.id} className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer",
                      d.id === focusDemand?.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-slate-300'
                    )} onClick={() => router.push(`/visit/${enterpriseId}/follow?demand=${d.id}`)}>
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                        d.status === 'pending' ? 'bg-red-400' : d.status === 'processing' ? 'bg-blue-400' : 'bg-emerald-400'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 truncate">{d.demand_content}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{d.demand_type || '未分类'}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右栏 2/5：走访历史 + 快捷操作 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 快捷操作 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">快捷操作</h3>
              <div className="space-y-2">
                <button
                  className="w-full flex items-center gap-2 p-2.5 text-xs rounded-lg border border-slate-200 hover:border-[#3370FF] hover:bg-blue-50/50 transition-colors text-left"
                  onClick={() => sendChat(`请为「${enterprise.short_name ?? enterprise.name}」的需求「${focusDemand?.demand_content}」草拟一封跟进邮件/消息。`)}
                >
                  <MessageSquare className="h-4 w-4 text-[#3370FF] shrink-0" />
                  <div>
                    <div className="font-medium text-slate-700">AI 草拟跟进消息</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">自动生成邮件/消息模板</div>
                  </div>
                </button>
                <button
                  className="w-full flex items-center gap-2 p-2.5 text-xs rounded-lg border border-slate-200 hover:border-[#3370FF] hover:bg-blue-50/50 transition-colors text-left"
                  onClick={() => sendChat(`请分析「${enterprise.short_name ?? enterprise.name}」的需求，推荐最适合对接的园区企业或资源。`)}
                >
                  <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-700">AI 匹配资源</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">匹配园区内可对接的企业/资源</div>
                  </div>
                </button>
                <button
                  className="w-full flex items-center gap-2 p-2.5 text-xs rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors text-left"
                  onClick={() => sendChat(`请为「${enterprise.short_name ?? enterprise.name}」安排下次走访日程，并生成走访问题清单。`)}
                >
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-700">AI 安排下次走访</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">自动生成日程和问题清单</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 走访历史摘要 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                走访历史 ({records.length})
              </h3>
              {records.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">暂无走访记录</div>
              ) : (
                <div className="space-y-3">
                  {records.slice(0, 4).map(r => (
                    <div key={r.id} className="flex gap-3 cursor-pointer hover:bg-slate-50 -mx-1 px-1 py-1.5 rounded transition-colors"
                      onClick={() => router.push(`/visit/confirm/${r.id}`)}>
                      <div className="flex flex-col items-center shrink-0">
                        <div className={cn("w-2 h-2 rounded-full mt-1", r.is_confirmed ? 'bg-emerald-400' : 'bg-amber-400')} />
                        <div className="w-px flex-1 bg-slate-200 mt-1" />
                      </div>
                      <div className="flex-1 min-w-0 pb-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-medium text-slate-700">{r.visit_date}</span>
                          <span className={cn("text-[10px] px-1 py-0.5 rounded",
                            r.is_confirmed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          )}>{r.is_confirmed ? '已确认' : '待确认'}</span>
                        </div>
                        {r.key_findings && r.key_findings[0] && (
                          <p className="text-[11px] text-slate-500 line-clamp-2">{r.key_findings[0]}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI 背景分析 */}
            {report && (
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="h-3.5 w-3.5 text-[#3370FF]" />
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI 背景摘要</h3>
                </div>
                {Object.entries(report.report_content).slice(0, 3).map(([key, section]) => (
                  <div key={key} className="mb-2 last:mb-0">
                    <div className="text-[10px] font-semibold text-slate-500 mb-0.5">{section.title}</div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{section.content}</p>
                  </div>
                ))}
                <button
                  className="mt-2 text-xs text-[#3370FF] hover:underline flex items-center gap-1"
                  onClick={() => router.push(`/enterprises/${enterpriseId}/report`)}
                >
                  查看完整背调报告 <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FollowPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="text-sm text-slate-400">加载中...</div></div>}>
      <FollowPageContent />
    </Suspense>
  );
}
