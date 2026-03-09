/**
 * 走访跟进详情页
 * 
 * 展示 AI 跟进建议、需求处理进度、AI 分析功能
 * 而非简单跳转到企业库
 */
'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import {
  ArrowLeft, Sparkles, Bot, CheckCircle2, Clock, AlertTriangle,
  Building2, Phone, Send, FileText, Target, TrendingUp,
  Lightbulb, ArrowRight, ChevronRight, MessageSquare
} from 'lucide-react';
import { fetchEnterprise, fetchBackgroundReport } from '@/services/enterprise';
import { fetchVisitRecords, fetchDemands } from '@/services/visit';
import { sendChat } from '@/lib/host-api';
import { cn } from '@/lib/utils';
import { Button, DetailSkeleton } from '@/components/ui';
import type { Enterprise, BackgroundReport, VisitRecord, VisitDemand } from '@/lib/schema';

function FollowPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const enterpriseId = params.id as string;
  const demandId = searchParams.get('demand');

  const [loading, setLoading] = useState(true);
  const [enterprise, setEnterprise] = useState<Enterprise | undefined>(undefined);
  const [allDemands, setAllDemands] = useState<VisitDemand[]>([]);
  const [records, setRecords] = useState<VisitRecord[]>([]);
  const [report, setReport] = useState<BackgroundReport | undefined>(undefined);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  useEffect(() => {
    async function load() {
      const [ent, dems, recs, rpt] = await Promise.all([
        fetchEnterprise(enterpriseId),
        fetchDemands(enterpriseId),
        fetchVisitRecords(enterpriseId),
        fetchBackgroundReport(enterpriseId),
      ]);
      setEnterprise(ent);
      setAllDemands(dems);
      setRecords(recs);
      setReport(rpt);
      setLoading(false);
    }
    load();
  }, [enterpriseId]);

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

  if (loading) return <DetailSkeleton />;

  if (!enterprise) {
    return (
      <div className="min-h-screen bg-surface-card flex items-center justify-center">
        <div className="text-center">
          <div className="text-text-muted text-sm">企业不存在</div>
          <Button variant="link" size="sm" className="mt-2" onClick={() => router.push('/visit')}>返回看板</Button>
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
    <div className="min-h-full bg-surface-card">
      {/* 头部 */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <Button variant="ghost" size="sm" onClick={() => router.push('/visit')} className="mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> 返回走访看板
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-text-primary">{enterprise.short_name ?? enterprise.name}</h1>
                <span className="text-xs px-2 py-0.5 bg-neutral-50 text-success rounded border border-line-light">跟进中</span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {allDemands.length} 条需求待跟进 · 已走访 {records.length} 次
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push(`/enterprises/${enterpriseId}`)}
              >
                <Building2 className="h-3.5 w-3.5" /> 企业详情
              </Button>
              <Button
                variant="primary"
                size="sm"
                className={cn(aiAnalyzing && "opacity-60")}
                onClick={handleAiAnalyze}
                disabled={aiAnalyzing}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {aiAnalyzing ? 'AI 分析中...' : 'AI 深度分析'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 左栏 3/5：需求 + AI 建议 */}
          <div className="lg:col-span-3 space-y-4">
            {/* 当前聚焦需求 */}
            {focusDemand && (
              <div className="bg-surface-card border border-line rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-brand" />
                  <h2 className="text-sm font-semibold text-text-primary">当前跟进需求</h2>
                  <span className={cn("text-tag px-1.5 py-0.5 rounded",
                    focusDemand.status === 'pending' ? 'bg-neutral-50 text-error border border-line-light' :
                    focusDemand.status === 'processing' ? 'bg-neutral-50 text-brand border border-line-light' :
                    'bg-neutral-50 text-success border border-line-light'
                  )}>
                    {focusDemand.status === 'pending' ? '待处理' : focusDemand.status === 'processing' ? '处理中' : '已完成'}
                  </span>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3 border border-line-light mb-3">
                  <p className="text-sm text-text-secondary leading-relaxed">{focusDemand.demand_content}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
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
            <div className="bg-surface-card border border-line rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-4 w-4 text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">AI 跟进建议</h2>
                <span className="text-tag px-1.5 py-0.5 bg-neutral-50 text-brand rounded">✦ AI 生成</span>
              </div>
              <div className="space-y-3">
                {aiSuggestions.map((s, i) => (
                  <div key={i} className={cn("rounded-lg p-3 border", 
                    s.priority === 'high' ? 'bg-neutral-50 border-line-light' : 'bg-neutral-50 border-line-light'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      {s.type === 'action' && <Send className="h-3.5 w-3.5 text-brand" />}
                      {s.type === 'insight' && <Lightbulb className="h-3.5 w-3.5 text-warning" />}
                      {s.type === 'timing' && <Clock className="h-3.5 w-3.5 text-success" />}
                      {s.type === 'risk' && <AlertTriangle className="h-3.5 w-3.5 text-error" />}
                      <span className="text-xs font-semibold text-text-primary">{s.title}</span>
                      {s.priority === 'high' && (
                        <span className="text-tag px-1 py-0.5 bg-neutral-50 text-error rounded">重要</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed pl-5">{s.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 所有需求列表 */}
            {allDemands.length > 1 && (
              <div className="bg-surface-card border border-line rounded-lg p-4">
                <h2 className="text-sm font-semibold text-text-primary mb-3">全部需求 ({allDemands.length})</h2>
                <div className="space-y-2">
                  {allDemands.map(d => (
                    <div key={d.id} className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer",
                      d.id === focusDemand?.id ? 'bg-neutral-50 border-line' : 'bg-surface-card border-line-light hover:border-line-hover'
                    )} onClick={() => router.push(`/visit/${enterpriseId}/follow?demand=${d.id}`)}>
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                        d.status === 'pending' ? 'bg-error' : d.status === 'processing' ? 'bg-brand' : 'bg-success'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-secondary truncate">{d.demand_content}</p>
                      </div>
                      <span className="text-tag text-text-muted shrink-0">{d.demand_type || '未分类'}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右栏 2/5：走访历史 + 快捷操作 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 快捷操作 */}
            <div className="bg-surface-card border border-line rounded-lg p-4">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">快捷操作</h3>
              <div className="space-y-2">
                <button
                  className="w-full flex items-center gap-2 p-2.5 text-xs rounded-lg border border-line hover:border-brand hover:bg-surface-hover-row transition-colors text-left"
                  onClick={() => sendChat(`请为「${enterprise.short_name ?? enterprise.name}」的需求「${focusDemand?.demand_content}」草拟一封跟进邮件/消息。`)}
                >
                  <MessageSquare className="h-4 w-4 text-brand shrink-0" />
                  <div>
                    <div className="font-medium text-text-secondary">AI 草拟跟进消息</div>
                    <div className="text-tag text-text-muted mt-0.5">自动生成邮件/消息模板</div>
                  </div>
                </button>
                <button
                  className="w-full flex items-center gap-2 p-2.5 text-xs rounded-lg border border-line hover:border-brand hover:bg-surface-hover-row transition-colors text-left"
                  onClick={() => sendChat(`请分析「${enterprise.short_name ?? enterprise.name}」的需求，推荐最适合对接的园区企业或资源。`)}
                >
                  <TrendingUp className="h-4 w-4 text-success shrink-0" />
                  <div>
                    <div className="font-medium text-text-secondary">AI 匹配资源</div>
                    <div className="text-tag text-text-muted mt-0.5">匹配园区内可对接的企业/资源</div>
                  </div>
                </button>
                <button
                  className="w-full flex items-center gap-2 p-2.5 text-xs rounded-lg border border-line hover:border-success hover:bg-surface-hover-row transition-colors text-left"
                  onClick={() => sendChat(`请为「${enterprise.short_name ?? enterprise.name}」安排下次走访日程，并生成走访问题清单。`)}
                >
                  <Sparkles className="h-4 w-4 text-warning shrink-0" />
                  <div>
                    <div className="font-medium text-text-secondary">AI 安排下次走访</div>
                    <div className="text-tag text-text-muted mt-0.5">自动生成日程和问题清单</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 走访历史摘要 */}
            <div className="bg-surface-card border border-line rounded-lg p-4">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                走访历史 ({records.length})
              </h3>
              {records.length === 0 ? (
                <div className="text-xs text-text-muted py-4 text-center">暂无走访记录</div>
              ) : (
                <div className="space-y-3">
                  {records.slice(0, 4).map(r => (
                    <div key={r.id} className="flex gap-3 cursor-pointer hover:bg-surface-hover-row -mx-1 px-1 py-1.5 rounded transition-colors"
                      onClick={() => router.push(`/visit/confirm/${r.id}`)}>
                      <div className="flex flex-col items-center shrink-0">
                        <div className={cn("w-2 h-2 rounded-full mt-1", r.is_confirmed ? 'bg-success' : 'bg-warning')} />
                        <div className="w-px flex-1 bg-line mt-1" />
                      </div>
                      <div className="flex-1 min-w-0 pb-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-medium text-text-secondary">{r.visit_date}</span>
                          <span className={cn("text-tag px-1 py-0.5 rounded",
                            r.is_confirmed ? 'bg-neutral-50 text-success' : 'bg-neutral-50 text-warning'
                          )}>{r.is_confirmed ? '已确认' : '待确认'}</span>
                        </div>
                        {r.key_findings && r.key_findings[0] && (
                          <p className="text-[11px] text-text-muted line-clamp-2">{r.key_findings[0]}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI 背景分析 */}
            {report && (
              <div className="bg-surface-card border border-line rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="h-3.5 w-3.5 text-brand" />
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">AI 背景摘要</h3>
                </div>
                {Object.entries(report.report_content).slice(0, 3).map(([key, section]) => (
                  <div key={key} className="mb-2 last:mb-0">
                    <div className="text-tag font-semibold text-text-muted mb-0.5">{section.title}</div>
                    <p className="text-[11px] text-text-secondary line-clamp-2">{section.content}</p>
                  </div>
                ))}
                <button
                  className="mt-2 text-xs text-brand hover:underline flex items-center gap-1"
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
    <Suspense fallback={<div className="min-h-screen bg-surface-card flex items-center justify-center"><div className="text-sm text-text-muted">加载中...</div></div>}>
      <FollowPageContent />
    </Suspense>
  );
}
