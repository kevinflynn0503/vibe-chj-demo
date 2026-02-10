/**
 * 管理看板 — 管理者专属视图
 * 
 * 所有管理操作集中在这里：
 * 1. 全局 KPI
 * 2. 政策筛选审核（通过/降级/排除）
 * 3. 任务分配管理（AI 分配建议 + 手动分配）
 * 4. 团队效能 AI 分析
 * 5. AI 工作报告
 * 6. 关注事项
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Building2, Briefcase, Shield, Rocket, TrendingUp, TrendingDown,
  Users, Activity, ArrowRight, AlertTriangle, CheckCircle2, Bot,
  Sparkles, FileText, Target, BarChart3, ChevronRight, Clock,
  ThumbsUp, ThumbsDown, ArrowDownCircle, Lightbulb, MessageCircle,
  UserCheck, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendChat, dispatchTasks } from '@/lib/host-api';
import { toast } from 'sonner';
import {
  getStats, getPolicyStats, getIncubatorStats, getEnterprises,
  getPMProgress, getActivityReports, getAssessments
} from '@/lib/mock-data';
import { GRADE_STYLES } from '@/lib/schema';

// AI 分配建议
const AI_SUGGESTIONS: Record<string, { pm: string; reason: string }> = {
  'assess-001': { pm: '薛坤', reason: '历史高新转化率85%，熟悉生物医药' },
  'assess-002': { pm: '李婷', reason: '擅长芯片/集成电路赛道' },
  'assess-003': { pm: '薛坤', reason: '已走访过该企业，有历史背景' },
  'assess-004': { pm: '王磊', reason: '负责汽车制造赛道' },
  'assess-005': { pm: '李婷', reason: '该企业在她负责的片区内' },
};

type DashboardTab = 'overview' | 'screening' | 'allocation' | 'team';

export default function DashboardPage() {
  const router = useRouter();
  const visitStats = getStats();
  const policyStats = getPolicyStats();
  const incubatorStats = getIncubatorStats();
  const enterprises = getEnterprises();
  const pmProgress = getPMProgress();
  const activityReports = getActivityReports();
  const assessments = getAssessments();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [reviewedIds, setReviewedIds] = useState<Record<string, 'approved' | 'demoted' | 'excluded'>>({});

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const alerts = activityReports.filter(r => r.trend === 'down');

  // KPI
  const kpis = [
    { label: '园区企业', value: enterprises.length.toLocaleString(), change: '+2.3%', trend: 'up' as const, icon: Building2, color: 'text-slate-900' },
    { label: '本月走访', value: visitStats.total_visits, change: '+12.5%', trend: 'up' as const, icon: Briefcase, color: 'text-[#3370FF]' },
    { label: '政策筛选', value: policyStats.total_screened, change: '+8.7%', trend: 'up' as const, icon: Shield, color: 'text-emerald-600' },
    { label: '在孵活跃率', value: `${Math.round((incubatorStats.active_enterprises / incubatorStats.total_enterprises) * 100)}%`, change: '-2.1%', trend: 'down' as const, icon: Rocket, color: 'text-amber-600' },
  ];

  // 漏斗
  const pipeline = [
    { label: '全部企业', value: '17,000' },
    { label: '已筛选', value: policyStats.total_screened },
    { label: '已触达', value: policyStats.touch_visited + policyStats.touch_willing },
    { label: '有意愿', value: policyStats.touch_willing },
    { label: '已获批', value: policyStats.approved },
  ];

  // 需要审核的（A 级待审核）
  const needReview = assessments.filter(a => a.grade === 'A' && !reviewedIds[a.id]);
  const approvedCount = Object.values(reviewedIds).filter(v => v === 'approved').length;

  // 未分配任务
  const unassigned = assessments.filter(a => !a.assigned_to);

  // 团队分析
  const pmAnalysis = pmProgress.map(pm => {
    const convRate = pm.conversion_rate;
    const overdue = pm.assigned - pm.visited;
    const quality = convRate > 0.3 ? 'excellent' : convRate > 0.15 ? 'good' : 'needs_attention';
    const qualityLabel = quality === 'excellent' ? '优秀' : quality === 'good' ? '良好' : '需关注';
    const qualityColor = quality === 'excellent' ? 'text-emerald-600' : quality === 'good' ? 'text-blue-600' : 'text-amber-600';
    const qualityBg = quality === 'excellent' ? 'bg-emerald-50' : quality === 'good' ? 'bg-blue-50' : 'bg-amber-50';
    let suggestion = '';
    if (quality === 'needs_attention') suggestion = `转化率较低(${(convRate * 100).toFixed(0)}%)，建议复盘走访质量`;
    else if (overdue > 3) suggestion = `有 ${overdue} 个待处理，建议协助分担`;
    else if (quality === 'excellent') suggestion = `表现优异，可作为团队标杆`;
    return { ...pm, quality, qualityLabel, qualityColor, qualityBg, suggestion, overdue };
  });

  const tabs = [
    { key: 'overview' as const, label: '总览' },
    { key: 'screening' as const, label: '筛选审核', count: needReview.length },
    { key: 'allocation' as const, label: '任务分配', count: unassigned.length },
    { key: 'team' as const, label: '团队效能' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900">管理看板</h1>
              <p className="text-xs text-slate-500 mt-0.5">{today} · 管理者视图</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-default btn-sm"
                onClick={() => sendChat('请生成本周团队周报：走访完成情况、政策推进进度、孵化器运营要点、AI 处理统计。')}>
                <Bot className="h-3.5 w-3.5" /> AI 周报
              </button>
              <button className="btn btn-primary btn-sm"
                onClick={() => sendChat('请分析团队工作状况，给出管理优化建议：任务分配、员工关注、流程优化。')}>
                <Sparkles className="h-3.5 w-3.5" /> AI 建议
              </button>
            </div>
          </div>
          {/* 子 Tab */}
          <div className="flex items-center gap-6 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn("relative py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                  activeTab === tab.key ? 'text-[#3370FF] border-[#3370FF]' : 'text-slate-500 border-transparent hover:text-slate-900'
                )}>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1.5 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* ═══ 总览 ═══ */}
        {activeTab === 'overview' && (
          <>
            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {kpis.map((kpi, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">{kpi.label}</span>
                    <kpi.icon className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className={cn("text-2xl font-bold font-mono", kpi.color)}>{kpi.value}</div>
                  <div className={cn("text-xs font-medium mt-1 flex items-center gap-1",
                    kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                  )}>
                    {kpi.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {kpi.change}
                  </div>
                </div>
              ))}
            </div>

            {/* 政策漏斗 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900">政策转化漏斗</h2>
              </div>
              <div className="grid grid-cols-5 gap-0">
                {pipeline.map((s, i) => (
                  <div key={i} className="flex items-center">
                    <div className="flex-1 text-center py-2">
                      <div className={cn("text-2xl font-bold font-mono mb-1", i === 0 ? 'text-slate-400' : 'text-slate-900')}>{s.value}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                    {i < 4 && <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* 员工工作状态概览 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <h2 className="text-sm font-bold text-slate-900">员工工作状态</h2>
                </div>
                <button className="text-xs text-[#3370FF] hover:underline" onClick={() => setActiveTab('team')}>详细分析</button>
              </div>
              <div className="divide-y divide-slate-100">
                {pmAnalysis.map((pm, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", pm.qualityBg, pm.qualityColor)}>
                      {pm.name.charAt(pm.name.length - 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{pm.name}</span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border",
                          pm.quality === 'excellent' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          pm.quality === 'good' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        )}>{pm.qualityLabel}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>走访 {pm.visited}/{pm.assigned}</span>
                      <span>转化 {(pm.conversion_rate * 100).toFixed(0)}%</span>
                      {pm.overdue > 3 && <span className="text-red-500">{pm.overdue} 逾期</span>}
                    </div>
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-[#3370FF] rounded-full" style={{ width: `${(pm.visited / pm.assigned) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 需要关注 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">需要关注</h2>
                <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">2 紧急</span>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { level: 'high', text: '芯视科技活跃度下降至 35', href: '/incubator/alerts' },
                  { level: 'high', text: `${needReview.length} 家 A 级企业待审核`, href: '#', action: () => setActiveTab('screening') },
                  { level: 'medium', text: `${unassigned.length} 个任务待分配`, href: '#', action: () => setActiveTab('allocation') },
                  { level: 'medium', text: `${pmAnalysis.filter(p => p.quality === 'needs_attention').length} 名员工转化率偏低`, href: '#', action: () => setActiveTab('team') },
                  { level: 'low', text: '本月走访目标完成率 78%', href: '/visit/records' },
                ].map((item, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full shrink-0",
                      item.level === 'high' ? 'bg-red-500' : item.level === 'medium' ? 'bg-amber-400' : 'bg-blue-400'
                    )} />
                    <span className="text-xs text-slate-700 flex-1">{item.text}</span>
                    <button className="text-[10px] text-[#3370FF] hover:underline" onClick={() => {
                      if (item.action) item.action();
                      else if (item.href !== '#') router.push(item.href);
                    }}>处理</button>
                  </div>
                ))}
              </div>
            </div>

            {/* 孵化器概况 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-slate-400" />
                  <h2 className="text-sm font-bold text-slate-900">孵化器概况</h2>
                </div>
                <button className="text-xs text-[#3370FF] hover:underline flex items-center gap-1"
                  onClick={() => router.push('/incubator')}>进入孵化器 <ArrowRight className="h-3 w-3" /></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { v: incubatorStats.total_enterprises, l: '在孵企业', bg: 'bg-slate-50' },
                  { v: incubatorStats.active_enterprises, l: '高活跃', bg: 'bg-emerald-50' },
                  { v: alerts.length, l: '异常预警', bg: 'bg-red-50' },
                  { v: incubatorStats.total_orders, l: '本月匹配', bg: 'bg-blue-50' },
                  { v: incubatorStats.pending_orders, l: '待处理', bg: 'bg-amber-50' },
                ].map((s, i) => (
                  <div key={i} className={cn("text-center p-3 rounded-lg border border-slate-100", s.bg)}>
                    <div className="text-xl font-bold font-mono text-slate-900">{s.v}</div>
                    <div className="text-[10px] text-slate-500">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══ 筛选审核 ═══ */}
        {activeTab === 'screening' && (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-[#3370FF] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900 mb-1">AI 筛选审核</div>
                  <p className="text-xs text-slate-500">
                    AI 已完成第 3 轮高新筛选。以下是 A 级企业，请逐一审核：通过→进入触达、降级→等待更多数据、排除→不符合。
                  </p>
                </div>
              </div>
            </div>

            {approvedCount > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-emerald-700">已通过 <strong>{approvedCount}</strong> 家企业</span>
                <button className="btn btn-primary btn-sm" onClick={() => {
                  toast.success('已推入触达阶段，AI 正在生成分配方案');
                  setActiveTab('allocation');
                }}>
                  <Send className="h-3.5 w-3.5" /> 生成分配方案
                </button>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              {assessments.filter(a => a.grade === 'A').map(a => {
                const passCount = a.screening_details.filter(d => d.result === 'pass').length;
                const total = a.screening_details.length;
                const review = reviewedIds[a.id];
                return (
                  <div key={a.id} className={cn("px-4 py-3 border-b border-slate-100 last:border-b-0", review === 'excluded' && 'opacity-40')}>
                    <div className="flex items-center">
                      <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        onClick={() => router.push(`/policy/screening/${a.id}`)}>
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xs font-bold shrink-0">A</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{a.enterprise_name}</span>
                            {review && (
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium",
                                review === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                review === 'demoted' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-red-50 text-red-600 border-red-100'
                              )}>
                                {review === 'approved' ? '已通过' : review === 'demoted' ? '已降级' : '已排除'}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{a.policy_type} · {passCount}/{total} 项通过 · {a.grade_score}分</div>
                        </div>
                      </div>
                      {!review && (
                        <div className="flex items-center gap-1 shrink-0 ml-4">
                          <button onClick={() => { setReviewedIds(p => ({...p, [a.id]: 'approved'})); toast.success(`「${a.enterprise_name}」已通过`); }}
                            className="p-2 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors" title="通过">
                            <ThumbsUp className="h-4 w-4" />
                          </button>
                          <button onClick={() => { setReviewedIds(p => ({...p, [a.id]: 'demoted'})); toast.info(`「${a.enterprise_name}」已降级`); }}
                            className="p-2 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors" title="降级">
                            <ArrowDownCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => { setReviewedIds(p => ({...p, [a.id]: 'excluded'})); toast.info(`「${a.enterprise_name}」已排除`); }}
                            className="p-2 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="排除">
                            <ThumbsDown className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 ml-2 cursor-pointer" onClick={() => router.push(`/policy/screening/${a.id}`)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ═══ 任务分配 ═══ */}
        {activeTab === 'allocation' && (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-[#3370FF] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900 mb-1">AI 任务分配</div>
                  <p className="text-xs text-slate-500">
                    基于各 PM 的赛道专长、历史转化率和当前工作量，AI 为每个任务推荐了最佳负责人。
                    你可以逐个采纳，也可以一键全部采纳。
                  </p>
                </div>
                <button className="btn btn-primary btn-sm shrink-0" onClick={() => toast.success('已按 AI 建议批量分配全部任务')}>
                  <Sparkles className="h-3.5 w-3.5" /> 一键采纳全部
                </button>
              </div>
            </div>

            {/* PM 当前负荷 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {pmProgress.map((pm, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900">{pm.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{(pm.conversion_rate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-base font-bold font-mono text-slate-900">{pm.assigned}</div>
                      <div className="text-[10px] text-slate-500">分配</div>
                    </div>
                    <div>
                      <div className="text-base font-bold font-mono text-blue-600">{pm.visited}</div>
                      <div className="text-[10px] text-slate-500">走访</div>
                    </div>
                    <div>
                      <div className="text-base font-bold font-mono text-emerald-600">{pm.willing}</div>
                      <div className="text-[10px] text-slate-500">意愿</div>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#3370FF] rounded-full" style={{ width: `${(pm.visited / pm.assigned) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* 任务列表 */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="dtable">
                  <thead>
                    <tr>
                      <th>企业</th>
                      <th>分级</th>
                      <th>AI 建议分配</th>
                      <th>当前分配</th>
                      <th className="text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map(a => {
                      const suggestion = AI_SUGGESTIONS[a.id];
                      const gradeTag = a.grade === 'A' ? 'tag-green' : a.grade === 'B' ? 'tag-blue' : 'tag-orange';
                      const gradeLabel = GRADE_STYLES[a.grade]?.label ?? a.grade;
                      return (
                        <tr key={a.id}>
                          <td className="font-medium text-slate-900">{a.enterprise_name}</td>
                          <td><span className={cn('tag pill', gradeTag)}>{gradeLabel}</span></td>
                          <td>
                            {suggestion ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <Bot className="h-3 w-3 text-[#3370FF]" />
                                  <span className="text-xs font-medium text-[#3370FF]">{suggestion.pm}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 max-w-[180px] truncate">{suggestion.reason}</div>
                              </div>
                            ) : <span className="text-xs text-slate-400">—</span>}
                          </td>
                          <td className="text-slate-600">{a.assigned_to ?? <span className="text-slate-300">未分配</span>}</td>
                          <td className="text-right">
                            {!a.assigned_to && suggestion && (
                              <button className="btn btn-default btn-sm" onClick={() => toast.success(`已分配给 ${suggestion.pm}`)}>
                                <UserCheck className="h-3 w-3" /> 采纳
                              </button>
                            )}
                            {!a.assigned_to && !suggestion && (
                              <button className="btn btn-primary btn-sm" onClick={() => dispatchTasks(a.grade, 1)}>分发</button>
                            )}
                            {a.assigned_to && (
                              <span className="text-xs text-emerald-500">已分配</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ═══ 团队效能 ═══ */}
        {activeTab === 'team' && (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-[#3370FF] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong>AI 周评估：</strong>团队走访完成率 78%，政策转化率 22.3%（行业均值 15%），
                  {pmAnalysis.filter(p => p.quality === 'excellent').length} 人优秀，
                  {pmAnalysis.filter(p => p.quality === 'needs_attention').length} 人需关注。
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <h2 className="text-sm font-bold text-slate-900">团队成员效能</h2>
                  <span className="text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">✦ AI 评估</span>
                </div>
                <button className="text-xs text-[#3370FF] hover:underline flex items-center gap-1"
                  onClick={() => sendChat('请对团队每位成员做深度效能分析，从走访质量、转化效率、任务完成度评估。')}>
                  AI 深度分析 <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {pmAnalysis.map((pm, i) => (
                  <div key={i} className="px-4 py-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0", pm.qualityBg, pm.qualityColor)}>
                        {pm.name.charAt(pm.name.length - 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-slate-900">{pm.name}</span>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium",
                            pm.quality === 'excellent' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            pm.quality === 'good' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          )}>{pm.qualityLabel}</span>
                          {pm.overdue > 3 && <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded border border-red-100">{pm.overdue} 项逾期</span>}
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-2">
                          <div><div className="text-[10px] text-slate-400">分配/完成</div><div className="text-sm font-bold font-mono">{pm.visited}/{pm.assigned}</div></div>
                          <div><div className="text-[10px] text-slate-400">转化率</div><div className={cn("text-sm font-bold font-mono", pm.qualityColor)}>{(pm.conversion_rate * 100).toFixed(0)}%</div></div>
                          <div><div className="text-[10px] text-slate-400">有意愿</div><div className="text-sm font-bold font-mono text-emerald-600">{pm.willing}</div></div>
                          <div><div className="text-[10px] text-slate-400">待处理</div><div className={cn("text-sm font-bold font-mono", pm.overdue > 3 ? 'text-red-600' : 'text-slate-500')}>{pm.overdue}</div></div>
                        </div>
                        <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-slate-100 mb-2">
                          <div className="bg-emerald-500 rounded-full" style={{ width: `${(pm.willing / pm.assigned) * 100}%` }} />
                          <div className="bg-blue-500 rounded-full" style={{ width: `${((pm.visited - pm.willing) / pm.assigned) * 100}%` }} />
                        </div>
                        {pm.suggestion && (
                          <div className="flex items-start gap-2 p-2.5 bg-blue-50/60 border border-blue-100 rounded-lg">
                            <Lightbulb className="h-3.5 w-3.5 text-[#3370FF] shrink-0 mt-0.5" />
                            <span className="text-[11px] text-slate-600">{pm.suggestion}</span>
                          </div>
                        )}
                      </div>
                      <button className="text-[10px] text-[#3370FF] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-100 shrink-0"
                        onClick={() => sendChat(`分析 ${pm.name} 近期工作，转化率 ${(pm.conversion_rate * 100).toFixed(0)}%，给出改进建议。`)}>
                        <Bot className="h-3 w-3 inline" /> AI 分析
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
