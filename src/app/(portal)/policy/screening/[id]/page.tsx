/**
 * 孵化器异常预警列表页
 * 
 * 展示所有活跃度异常企业，每条提供 AI 分析结果和建议
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft, ChevronLeft, AlertTriangle, TrendingDown, TrendingUp, Activity,
  Sparkles, Bot, ChevronRight, Building2, Clock, Lightbulb,
  CheckCircle2, XCircle, Minus
} from 'lucide-react';
import { fetchActivityReports, fetchIncubatorEnterprises } from '@/services/incubator';
import { sendChat } from '@/lib/host-api';
import { cn } from '@/lib/utils';
import { Button, PageSkeleton } from '@/components/ui';
import type { ActivityReport, IncubatorEnterprise } from '@/lib/schema';

// AI 分析结果（mock）
const aiAnalysisResults: Record<string, {
  summary: string;
  causes: string[];
  suggestion: string;
  risk_level: 'high' | 'medium' | 'low';
}> = {
  'inc-ent-004': {
    summary: '智码科技活跃度持续下降，疑似核心团队变动',
    causes: [
      '近2周会议室预约减少50%，可能团队在远程办公或外出',
      'CEO上月参加了外地创业大赛，可能在考虑其他园区',
      '种子轮资金可能即将用尽（入孵已10个月）',
    ],
    suggestion: '建议本周安排运营人员走访了解情况，重点确认团队稳定性和资金状况。如有搬迁风险，提前准备留存方案（如对接投资人或减租）。',
    risk_level: 'high',
  },
  'inc-ent-005': {
    summary: '清洁智造连续2周无活动迹象，可能已停止运营',
    causes: [
      '连续2周无会议室预约、无用电异常',
      '企业官网上次更新在3个月前',
      '天使轮融资后无后续融资信息',
    ],
    suggestion: '建议立即电话联系创始人确认运营状态。如已停运，启动退孵流程并释放工位资源。',
    risk_level: 'high',
  },
};

export default function AlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activityReports, setActivityReports] = useState<ActivityReport[]>([]);
  const [enterprises, setEnterprises] = useState<IncubatorEnterprise[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [reports, ents] = await Promise.all([
        fetchActivityReports(),
        fetchIncubatorEnterprises(),
      ]);
      setActivityReports(reports);
      setEnterprises(ents);
      setLoading(false);
    }
    load();
  }, []);

  // 所有企业按异常程度排序
  const sortedReports = [...activityReports].sort((a, b) => {
    const trendOrder = { down: 0, stable: 1, up: 2 };
    if (trendOrder[a.trend] !== trendOrder[b.trend]) return trendOrder[a.trend] - trendOrder[b.trend];
    return a.activity_score - b.activity_score;
  });

  const alerts = sortedReports.filter(r => r.trend === 'down');
  const warnings = sortedReports.filter(r => r.activity_score < 70 && r.trend !== 'down');
  const healthy = sortedReports.filter(r => r.activity_score >= 70 && r.trend !== 'down');

  const entMap = Object.fromEntries(enterprises.map(e => [e.enterprise_id, e]));

  const handleAiAnalyze = (enterpriseId: string, name: string) => {
    if (aiAnalysisResults[enterpriseId]) {
      setExpandedId(expandedId === enterpriseId ? null : enterpriseId);
    } else {
      setAnalyzingId(enterpriseId);
      sendChat(`请深度分析「${name}」的活跃度变化原因，结合工商数据、会议记录、用电数据等信号，给出风险评估和建议干预措施。`);
      setTimeout(() => setAnalyzingId(null), 2000);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-full">
      {/* 头部 */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <Button variant="ghost" size="sm" onClick={() => router.push('/incubator')} className="mb-3">
            <ChevronLeft className="h-3.5 w-3.5" />
            返回孵化管理
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-text-primary">异常预警</h1>
              <p className="text-xs text-text-muted mt-0.5">
                AI 持续监测在孵企业活跃度 · {alerts.length} 个异常 · {warnings.length} 个需关注
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => sendChat('请对所有活跃度下降的在孵企业进行批量分析，给出风险排名和优先处理建议。')}
            >
              <Sparkles className="h-3.5 w-3.5" /> AI 批量分析
            </Button>
          </div>
        </div>
      </div>

      <div className="page-container space-y-6">
        {/* 概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '异常（活跃度↓）', value: alerts.length, color: 'text-error', icon: AlertTriangle, iconColor: 'text-error' },
            { label: '需关注', value: warnings.length, color: 'text-warning', icon: Clock, iconColor: 'text-warning' },
            { label: '健康运行', value: healthy.length, color: 'text-success', icon: CheckCircle2, iconColor: 'text-success' },
            { label: '平均活跃度', value: activityReports.length > 0 ? Math.round(activityReports.reduce((s, r) => s + r.activity_score, 0) / activityReports.length) : 0, color: 'text-text-primary', icon: Activity, iconColor: 'text-text-muted' },
          ].map((c, i) => (
            <div key={i} className="bg-surface-card border border-line rounded-lg p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <c.icon className={cn("h-3.5 w-3.5", c.iconColor)} />
                <span className="text-xs text-text-muted">{c.label}</span>
              </div>
              <div className={cn("text-xl font-bold tabular-nums", c.color)}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* 异常列表 */}
        {alerts.length > 0 && (
          <div className="bg-surface-card border border-line rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-line-light flex items-center gap-2 bg-neutral-50">
              <AlertTriangle className="h-4 w-4 text-error" />
              <h2 className="text-sm font-semibold text-text-primary">异常企业</h2>
              <span className="text-xs text-error bg-neutral-50 px-1.5 py-0.5 rounded">{alerts.length}</span>
            </div>
            <div className="divide-y divide-line-light">
              {alerts.map(r => {
                const ent = entMap[r.enterprise_id];
                const analysis = aiAnalysisResults[r.enterprise_id];
                const isExpanded = expandedId === r.enterprise_id;
                const isAnalyzing = analyzingId === r.enterprise_id;

                return (
                  <div key={r.enterprise_id}>
                    <div className="px-4 py-3 flex items-center justify-between hover:bg-surface-hover-row transition-colors">
                      <div className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => { if (ent) router.push(`/incubator/${ent.id}`); }}>
                        <div className="w-9 h-9 bg-neutral-50 text-error rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">{r.name}</div>
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <span className="text-error flex items-center gap-0.5"><TrendingDown className="h-3 w-3" />活跃度 {r.activity_score}</span>
                            {ent?.location && <span>· {ent.location}</span>}
                            {ent?.funding_stage && <span>· {ent.funding_stage}</span>}
                          </div>
                          {r.signals && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {r.signals.map((s, i) => (
                                <span key={i} className="text-tag px-1.5 py-0.5 bg-neutral-50 text-error rounded">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <button
                          className={cn(
                            "flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded border transition-colors",
                            isExpanded ? "bg-brand text-white border-brand" :
                            "text-brand bg-neutral-50 hover:bg-surface-hover-btn border-line-light"
                          )}
                          onClick={() => handleAiAnalyze(r.enterprise_id, r.name)}
                        >
                          {isAnalyzing ? (
                            <><Bot className="h-3.5 w-3.5 animate-pulse" /> 分析中...</>
                          ) : (
                            <><Sparkles className="h-3.5 w-3.5" /> {analysis ? (isExpanded ? '收起分析' : '查看 AI 分析') : 'AI 分析'}</>
                          )}
                        </button>
                        <ChevronRight className="h-4 w-4 text-text-muted cursor-pointer"
                          onClick={() => { if (ent) router.push(`/incubator/${ent.id}`); }} />
                      </div>
                    </div>

                    {/* AI 分析展开区域 */}
                    {isExpanded && analysis && (
                      <div className="px-4 pb-4">
                        <div className="bg-neutral-50 border border-line-light rounded-lg p-4 ml-12">
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="h-4 w-4 text-brand" />
                            <span className="text-xs font-semibold text-text-primary">AI 分析结果</span>
                            <span className={cn("text-tag px-1.5 py-0.5 rounded",
                              analysis.risk_level === 'high' ? 'bg-neutral-50 text-error' :
                              analysis.risk_level === 'medium' ? 'bg-neutral-50 text-warning' :
                              'bg-neutral-50 text-success'
                            )}>
                              风险: {analysis.risk_level === 'high' ? '高' : analysis.risk_level === 'medium' ? '中' : '低'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-text-primary mb-3">{analysis.summary}</p>
                          
                          <div className="mb-3">
                            <div className="text-xs font-semibold text-text-muted mb-1.5">可能原因：</div>
                            <div className="space-y-1.5">
                              {analysis.causes.map((c, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                                  <span className="text-brand font-bold shrink-0">{i + 1}.</span>
                                  <span>{c}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-surface-card border border-line-light rounded p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Lightbulb className="h-3.5 w-3.5 text-warning" />
                              <span className="text-xs font-semibold text-text-primary">建议措施</span>
                            </div>
                            <p className="text-xs text-text-secondary leading-relaxed">{analysis.suggestion}</p>
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <Button variant="primary" size="sm" className="text-xs"
                              onClick={() => sendChat(`请为「${r.name}」安排异常干预走访，生成走访准备材料和问题清单。`)}>
                              <Sparkles className="h-3 w-3" /> AI 生成干预方案
                            </Button>
                            <Button variant="default" size="sm" className="text-xs"
                              onClick={() => { if (ent) router.push(`/incubator/${ent.id}`); }}>
                              查看企业详情
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 需关注列表 */}
        {warnings.length > 0 && (
          <div className="bg-surface-card border border-line rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-line-light flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <h2 className="text-sm font-semibold text-text-primary">需关注</h2>
              <span className="text-xs text-warning bg-neutral-50 px-1.5 py-0.5 rounded">{warnings.length}</span>
            </div>
            <div className="divide-y divide-line-light">
              {warnings.map(r => {
                const ent = entMap[r.enterprise_id];
                return (
                  <div key={r.enterprise_id} className="px-4 py-3 flex items-center justify-between hover:bg-surface-hover-row transition-colors">
                    <div className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => { if (ent) router.push(`/incubator/${ent.id}`); }}>
                      <div className="w-9 h-9 bg-neutral-50 text-warning rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{r.name}</div>
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <span className="text-warning">活跃度 {r.activity_score}</span>
                          {r.signals?.[0] && <span>· {r.signals[0]}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      className="shrink-0 flex items-center gap-1 text-tag font-medium text-brand bg-neutral-50 hover:bg-surface-hover-btn px-2 py-1 rounded border border-line-light transition-colors ml-2"
                      onClick={() => sendChat(`请分析「${r.name}」的活跃度变化趋势，评估是否需要干预。`)}
                    >
                      <Sparkles className="h-3 w-3" /> AI 分析
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 健康运行 */}
        {healthy.length > 0 && (
          <div className="bg-surface-card border border-line rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-line-light flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <h2 className="text-sm font-semibold text-text-primary">健康运行</h2>
              <span className="text-xs text-success bg-neutral-50 px-1.5 py-0.5 rounded">{healthy.length}</span>
            </div>
            <div className="divide-y divide-line-light">
              {healthy.map(r => {
                const ent = entMap[r.enterprise_id];
                return (
                  <div key={r.enterprise_id} className="px-4 py-3 flex items-center justify-between hover:bg-surface-hover-row transition-colors cursor-pointer"
                    onClick={() => { if (ent) router.push(`/incubator/${ent.id}`); }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-neutral-50 text-success rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{r.name}</div>
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <span className="text-success flex items-center gap-0.5">
                            {r.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                            活跃度 {r.activity_score}
                          </span>
                          {r.signals?.[0] && <span>· {r.signals[0]}</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-text-muted" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
