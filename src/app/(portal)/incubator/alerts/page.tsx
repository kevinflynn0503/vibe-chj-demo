/**
 * 孵化器异常预警列表页
 * 
 * 展示所有活跃度异常企业，每条提供 AI 分析结果和建议
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft, AlertTriangle, TrendingDown, TrendingUp, Activity,
  Sparkles, Bot, ChevronRight, Building2, Clock, Lightbulb,
  CheckCircle2, XCircle, Minus
} from 'lucide-react';
import { getActivityReports, getIncubatorEnterprises } from '@/lib/mock-data';
import { sendChat } from '@/lib/host-api';
import { cn } from '@/lib/utils';

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
  const activityReports = getActivityReports();
  const enterprises = getIncubatorEnterprises();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

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

  return (
    <div className="min-h-full">
      {/* 头部 */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <button onClick={() => router.push('/incubator')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回孵化管理
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900">异常预警</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                AI 持续监测在孵企业活跃度 · {alerts.length} 个异常 · {warnings.length} 个需关注
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => sendChat('请对所有活跃度下降的在孵企业进行批量分析，给出风险排名和优先处理建议。')}
            >
              <Sparkles className="h-3.5 w-3.5" /> AI 批量分析
            </button>
          </div>
        </div>
      </div>

      <div className="page-container space-y-4">
        {/* 概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '异常（活跃度↓）', value: alerts.length, color: 'text-red-600', icon: AlertTriangle, iconColor: 'text-red-500' },
            { label: '需关注', value: warnings.length, color: 'text-amber-600', icon: Clock, iconColor: 'text-amber-500' },
            { label: '健康运行', value: healthy.length, color: 'text-emerald-600', icon: CheckCircle2, iconColor: 'text-emerald-500' },
            { label: '平均活跃度', value: Math.round(activityReports.reduce((s, r) => s + r.activity_score, 0) / activityReports.length), color: 'text-slate-900', icon: Activity, iconColor: 'text-slate-400' },
          ].map((c, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <c.icon className={cn("h-3.5 w-3.5", c.iconColor)} />
                <span className="text-xs text-slate-500">{c.label}</span>
              </div>
              <div className={cn("text-xl font-bold font-mono", c.color)}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* 异常列表 */}
        {alerts.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-red-50/50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h2 className="text-sm font-bold text-slate-900">异常企业</h2>
              <span className="text-xs text-red-500 bg-red-100 px-1.5 py-0.5 rounded">{alerts.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {alerts.map(r => {
                const ent = entMap[r.enterprise_id];
                const analysis = aiAnalysisResults[r.enterprise_id];
                const isExpanded = expandedId === r.enterprise_id;
                const isAnalyzing = analyzingId === r.enterprise_id;

                return (
                  <div key={r.enterprise_id}>
                    <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => { if (ent) router.push(`/incubator/${ent.id}`); }}>
                        <div className="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{r.name}</div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="text-red-600 flex items-center gap-0.5"><TrendingDown className="h-3 w-3" />活跃度 {r.activity_score}</span>
                            {ent?.location && <span>· {ent.location}</span>}
                            {ent?.funding_stage && <span>· {ent.funding_stage}</span>}
                          </div>
                          {r.signals && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {r.signals.map((s, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <button
                          className={cn(
                            "flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded border transition-colors",
                            isExpanded ? "bg-[#3370FF] text-white border-[#3370FF]" :
                            "text-[#3370FF] bg-blue-50 hover:bg-blue-100 border-blue-100"
                          )}
                          onClick={() => handleAiAnalyze(r.enterprise_id, r.name)}
                        >
                          {isAnalyzing ? (
                            <><Bot className="h-3.5 w-3.5 animate-pulse" /> 分析中...</>
                          ) : (
                            <><Sparkles className="h-3.5 w-3.5" /> {analysis ? (isExpanded ? '收起分析' : '查看 AI 分析') : 'AI 分析'}</>
                          )}
                        </button>
                        <ChevronRight className="h-4 w-4 text-slate-300 cursor-pointer"
                          onClick={() => { if (ent) router.push(`/incubator/${ent.id}`); }} />
                      </div>
                    </div>

                    {/* AI 分析展开区域 */}
                    {isExpanded && analysis && (
                      <div className="px-4 pb-4">
                        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 ml-12">
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="h-4 w-4 text-[#3370FF]" />
                            <span className="text-xs font-bold text-slate-900">AI 分析结果</span>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded",
                              analysis.risk_level === 'high' ? 'bg-red-100 text-red-600' :
                              analysis.risk_level === 'medium' ? 'bg-amber-100 text-amber-600' :
                              'bg-emerald-100 text-emerald-600'
                            )}>
                              风险: {analysis.risk_level === 'high' ? '高' : analysis.risk_level === 'medium' ? '中' : '低'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-900 mb-3">{analysis.summary}</p>
                          
                          <div className="mb-3">
                            <div className="text-xs font-semibold text-slate-500 mb-1.5">可能原因：</div>
                            <div className="space-y-1.5">
                              {analysis.causes.map((c, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                  <span className="text-[#3370FF] font-bold shrink-0">{i + 1}.</span>
                                  <span>{c}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white border border-blue-100 rounded p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                              <span className="text-xs font-semibold text-slate-900">建议措施</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{analysis.suggestion}</p>
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <button className="btn btn-primary btn-sm text-xs"
                              onClick={() => sendChat(`请为「${r.name}」安排异常干预走访，生成走访准备材料和问题清单。`)}>
                              <Sparkles className="h-3 w-3" /> AI 生成干预方案
                            </button>
                            <button className="btn btn-default btn-sm text-xs"
                              onClick={() => { if (ent) router.push(`/incubator/${ent.id}`); }}>
                              查看企业详情
                            </button>
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
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">需关注</h2>
              <span className="text-xs text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">{warnings.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {warnings.map(r => {
                const ent = entMap[r.enterprise_id];
                return (
                  <div key={r.enterprise_id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => { if (ent) router.push(`/incubator/${ent.id}`); }}>
                      <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{r.name}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="text-amber-600">活跃度 {r.activity_score}</span>
                          {r.signals?.[0] && <span>· {r.signals[0]}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-[#3370FF] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-100 transition-colors ml-2"
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
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900">健康运行</h2>
              <span className="text-xs text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">{healthy.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {healthy.map(r => {
                const ent = entMap[r.enterprise_id];
                return (
                  <div key={r.enterprise_id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => { if (ent) router.push(`/incubator/${ent.id}`); }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{r.name}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            {r.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                            活跃度 {r.activity_score}
                          </span>
                          {r.signals?.[0] && <span>· {r.signals[0]}</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
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
