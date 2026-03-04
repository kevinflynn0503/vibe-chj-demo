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
import { useState, useEffect } from 'react';
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
import { Card, CardCompact, Tag, Button, PageSkeleton } from '@/components/ui';
import { fetchEnterprises } from '@/services/enterprise';
import { fetchVisitStats } from '@/services/visit';
import { fetchPolicyStats, fetchPMProgress, fetchAssessments } from '@/services/policy';
import { fetchIncubatorStats, fetchActivityReports } from '@/services/incubator';
import { GRADE_STYLES } from '@/lib/schema';
import type { VisitStats, PolicyStats, ProjectManagerProgress, PolicyAssessment, Enterprise, ActivityReport } from '@/lib/schema';

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
  const [loading, setLoading] = useState(true);
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [policyStats, setPolicyStats] = useState<PolicyStats | null>(null);
  const [incubatorStats, setIncubatorStats] = useState<{ total_enterprises: number; active_enterprises: number; total_orders: number; pending_orders: number } | null>(null);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [pmProgress, setPmProgress] = useState<ProjectManagerProgress[]>([]);
  const [activityReports, setActivityReports] = useState<ActivityReport[]>([]);
  const [assessments, setAssessments] = useState<PolicyAssessment[]>([]);

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [reviewedIds, setReviewedIds] = useState<Record<string, 'approved' | 'demoted' | 'excluded'>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [stats, policy, incubator, ents, pm, reports, assess] = await Promise.all([
          fetchVisitStats(),
          fetchPolicyStats(),
          fetchIncubatorStats(),
          fetchEnterprises(),
          fetchPMProgress(),
          fetchActivityReports(),
          fetchAssessments(),
        ]);
        if (!cancelled) {
          setVisitStats(stats);
          setPolicyStats(policy);
          setIncubatorStats(incubator);
          setEnterprises(ents);
          setPmProgress(pm);
          setActivityReports(reports);
          setAssessments(assess);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const alerts = activityReports.filter(r => r.trend === 'down');

  if (loading) return <PageSkeleton />;

  const vs = visitStats!;
  const ps = policyStats!;
  const inc = incubatorStats!;

  const kpis = [
    { label: '园区企业', value: enterprises.length.toLocaleString(), change: '+2.3%', trend: 'up' as const, icon: Building2 },
    { label: '本月走访', value: vs.total_visits, change: '+12.5%', trend: 'up' as const, icon: Briefcase },
    { label: '政策筛选', value: ps.total_screened, change: '+8.7%', trend: 'up' as const, icon: Shield },
    { label: '在孵活跃率', value: `${Math.round((inc.active_enterprises / inc.total_enterprises) * 100)}%`, change: '-2.1%', trend: 'down' as const, icon: Rocket },
  ];

  // 漏斗
  const pipeline = [
    { label: '全部企业', value: '17,000' },
    { label: '已筛选', value: ps.total_screened },
    { label: '已触达', value: ps.touch_visited + ps.touch_willing },
    { label: '有意愿', value: ps.touch_willing },
    { label: '已获批', value: ps.approved },
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
    const qualityColor = quality === 'excellent' ? 'text-success' : quality === 'good' ? 'text-brand' : 'text-warning';
    const qualityBg = quality === 'excellent' ? 'bg-[rgba(27,27,27,0.06)]' : quality === 'good' ? 'bg-[rgba(27,27,27,0.06)]' : 'bg-[rgba(27,27,27,0.06)]';
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
    <div className="min-h-full">
      {/* ═══ 头部渐变区 ═══ */}
      <div className="relative">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(51,112,255,0.04) 0%, rgba(255,255,255,0) 100%)' }} />
        <div className="relative page-container">
          <div className="flex items-center justify-between pt-5 pb-5">
            <div>
              <h1 className="text-lg font-semibold text-text-primary tracking-tight">管理看板</h1>
              <p className="text-xs text-text-muted mt-1">{today} · 管理者视图</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm"
                onClick={() => sendChat('请生成本周团队周报：走访完成情况、政策推进进度、孵化器运营要点、AI 处理统计。')}
                icon={<Bot className="h-3.5 w-3.5" />}>
                AI 周报
              </Button>
              <Button variant="primary" size="sm"
                onClick={() => sendChat('请分析团队工作状况，给出管理优化建议：任务分配、员工关注、流程优化。')}
                icon={<Sparkles className="h-3.5 w-3.5" />}>
                AI 建议
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container space-y-6">
        {/* 子 Tab */}
        <div className="flex items-center gap-1 border-b border-line">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn("relative px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap",
                activeTab === tab.key ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
              )}>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-error text-white">{tab.count}</span>
              )}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ═══ 总览 ═══ */}
        {activeTab === 'overview' && (
          <>
            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpis.map((kpi, i) => (
              <CardCompact key={i}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-text-muted">{kpi.label}</span>
                    <kpi.icon className="h-3.5 w-3.5 text-text-muted" />
                  </div>
                  <div className="text-2xl font-semibold font-mono text-text-primary">{kpi.value}</div>
                  <div className={cn("text-xs font-medium mt-1 flex items-center gap-1",
                    kpi.trend === 'up' ? 'text-success' : 'text-error'
                  )}>
                    {kpi.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {kpi.change}
                  </div>
                </CardCompact>
              ))}
            </div>

            {/* 政策漏斗 */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-text-muted" />
                <h2 className="text-sm font-semibold text-text-primary">政策转化漏斗</h2>
              </div>
              <div className="grid grid-cols-5 gap-0">
                {pipeline.map((s, i) => (
                  <div key={i} className="flex items-center">
                    <div className="flex-1 text-center py-2">
                      <div className={cn("text-2xl font-bold font-mono mb-1", i === 0 ? 'text-text-muted' : 'text-text-primary')}>{s.value}</div>
                      <div className="text-xs text-text-secondary">{s.label}</div>
                    </div>
                    {i < 4 && <ArrowRight className="h-4 w-4 text-text-muted shrink-0" />}
                  </div>
                ))}
              </div>
            </Card>

            {/* 员工工作状态概览 */}
            <Card className="p-0">
              <div className="px-4 py-3 border-b border-line flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-text-muted" />
                  <h2 className="text-sm font-semibold text-text-primary">员工工作状态</h2>
                </div>
                <Button variant="link" size="sm" onClick={() => setActiveTab('team')}>详细分析</Button>
              </div>
              <div className="divide-y divide-line-light">
                {pmAnalysis.map((pm, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-4 transition-colors duration-150 hover:bg-surface-hover-row">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", pm.qualityBg, pm.qualityColor)}>
                      {pm.name.charAt(pm.name.length - 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{pm.name}</span>
                        <Tag variant={pm.quality === 'excellent' ? 'emerald' : pm.quality === 'good' ? 'blue' : 'orange'}>
                          {pm.qualityLabel}
                        </Tag>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span>走访 {pm.visited}/{pm.assigned}</span>
                      <span>转化 {(pm.conversion_rate * 100).toFixed(0)}%</span>
                      {pm.overdue > 3 && <span className="text-error">{pm.overdue} 逾期</span>}
                    </div>
                    <div className="w-20 h-1.5 bg-[rgba(27,27,27,0.06)] rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-brand rounded-full" style={{ width: `${(pm.visited / pm.assigned) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 需要关注 */}
            <Card className="p-0">
              <div className="px-4 py-3 border-b border-line flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-text-muted" />
                <h2 className="text-sm font-semibold text-text-primary">需要关注</h2>
                <Tag variant="red">2 紧急</Tag>
              </div>
              <div className="divide-y divide-line-light">
                {[
                  { level: 'high', text: '芯视科技活跃度下降至 35', href: '/incubator/alerts' },
                  { level: 'high', text: `${needReview.length} 家 A 级企业待审核`, href: '#', action: () => setActiveTab('screening') },
                  { level: 'medium', text: `${unassigned.length} 个任务待分配`, href: '#', action: () => setActiveTab('allocation') },
                  { level: 'medium', text: `${pmAnalysis.filter(p => p.quality === 'needs_attention').length} 名员工转化率偏低`, href: '#', action: () => setActiveTab('team') },
                  { level: 'low', text: '本月走访目标完成率 78%', href: '/visit/records' },
                ].map((item, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3 transition-colors duration-150 hover:bg-surface-hover-row cursor-pointer">
                    <div className={cn("w-2 h-2 rounded-full shrink-0",
                      item.level === 'high' ? 'bg-error' : item.level === 'medium' ? 'bg-warning' : 'bg-brand'
                    )} />
                    <span className="text-xs text-text-primary flex-1">{item.text}</span>
                    <Button variant="link" size="sm" onClick={() => {
                      if (item.action) item.action();
                      else if (item.href !== '#') router.push(item.href);
                    }}>处理</Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* 孵化器概况 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-text-muted" />
                  <h2 className="text-sm font-semibold text-text-primary">孵化器概况</h2>
                </div>
                <Button variant="link" size="sm" onClick={() => router.push('/incubator')}>
                  进入孵化器 <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { v: inc.total_enterprises, l: '在孵企业', bg: 'bg-[rgba(27,27,27,0.06)]' },
                  { v: inc.active_enterprises, l: '高活跃', bg: 'bg-[rgba(27,27,27,0.06)]' },
                  { v: alerts.length, l: '异常预警', bg: 'bg-[rgba(27,27,27,0.06)]' },
                  { v: inc.total_orders, l: '本月匹配', bg: 'bg-[rgba(27,27,27,0.06)]' },
                  { v: inc.pending_orders, l: '待处理', bg: 'bg-[rgba(27,27,27,0.06)]' },
                ].map((s, i) => (
                  <div key={i} className={cn("text-center p-3 rounded-lg", s.bg)}>
                    <div className="text-xl font-bold font-mono text-text-primary">{s.v}</div>
                    <div className="text-tag text-text-secondary">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══ 筛选审核 ═══ */}
        {activeTab === 'screening' && (
          <>
            <div className="bg-surface-card border border-line rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-text-primary mb-1">AI 筛选审核</div>
                  <p className="text-xs text-text-secondary">
                    AI 已完成第 3 轮高新筛选。以下是 A 级企业，请逐一审核：通过→进入触达、降级→等待更多数据、排除→不符合。
                  </p>
                </div>
              </div>
            </div>

            {approvedCount > 0 && (
              <div className="bg-[rgba(27,27,27,0.06)] border border-line rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-text-secondary">已通过 <strong>{approvedCount}</strong> 家企业</span>
                <Button variant="primary" size="sm" onClick={() => {
                  toast.success('已推入触达阶段，AI 正在生成分配方案');
                  setActiveTab('allocation');
                }}
                  icon={<Send className="h-3.5 w-3.5" />}>
                  生成分配方案
                </Button>
              </div>
            )}

            <Card className="p-0 overflow-hidden">
              {assessments.filter(a => a.grade === 'A').map(a => {
                const passCount = a.screening_details.filter(d => d.result === 'pass').length;
                const total = a.screening_details.length;
                const review = reviewedIds[a.id];
                return (
                  <div key={a.id} className={cn("px-4 py-3 border-b border-line last:border-b-0", review === 'excluded' && 'opacity-40')}>
                    <div className="flex items-center">
                      <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        onClick={() => router.push(`/policy/screening/${a.id}`)}>
                        <div className="w-9 h-9 rounded-lg bg-[rgba(27,27,27,0.06)] text-success border border-line flex items-center justify-center text-xs font-bold shrink-0">A</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-text-primary">{a.enterprise_name}</span>
                            {review && (
                              <Tag variant={review === 'approved' ? 'emerald' : review === 'demoted' ? 'orange' : 'red'}>
                                {review === 'approved' ? '已通过' : review === 'demoted' ? '已降级' : '已排除'}
                              </Tag>
                            )}
                          </div>
                          <div className="text-xs text-text-secondary mt-0.5">{a.policy_type} · {passCount}/{total} 项通过 · {a.grade_score}分</div>
                        </div>
                      </div>
                      {!review && (
                        <div className="flex items-center gap-1 shrink-0 ml-4">
                          <Button variant="ghost" size="icon" title="通过"
                            className="text-text-muted hover:text-success"
                            onClick={() => { setReviewedIds(p => ({...p, [a.id]: 'approved'})); toast.success(`「${a.enterprise_name}」已通过`); }}>
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="降级"
                            className="text-text-muted hover:text-warning"
                            onClick={() => { setReviewedIds(p => ({...p, [a.id]: 'demoted'})); toast.info(`「${a.enterprise_name}」已降级`); }}>
                            <ArrowDownCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="排除"
                            className="text-text-muted hover:text-error"
                            onClick={() => { setReviewedIds(p => ({...p, [a.id]: 'excluded'})); toast.info(`「${a.enterprise_name}」已排除`); }}>
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <ChevronRight className="h-4 w-4 text-text-muted shrink-0 ml-2 cursor-pointer" onClick={() => router.push(`/policy/screening/${a.id}`)} />
                    </div>
                  </div>
                );
              })}
            </Card>
          </>
        )}

        {/* ═══ 任务分配 ═══ */}
        {activeTab === 'allocation' && (
          <>
            <div className="bg-surface-card border border-line rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-text-primary mb-1">AI 任务分配</div>
                  <p className="text-xs text-text-secondary">
                    基于各 PM 的赛道专长、历史转化率和当前工作量，AI 为每个任务推荐了最佳负责人。
                    你可以逐个采纳，也可以一键全部采纳。
                  </p>
                </div>
                <Button variant="primary" size="sm" className="shrink-0" onClick={() => toast.success('已按 AI 建议批量分配全部任务')}
                  icon={<Sparkles className="h-3.5 w-3.5" />}>
                  一键采纳全部
                </Button>
              </div>
            </div>

            {/* PM 当前负荷 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {pmProgress.map((pm, i) => (
                <CardCompact key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text-primary">{pm.name}</span>
                    <span className="text-xs text-text-muted font-mono">{(pm.conversion_rate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-base font-bold font-mono text-text-primary">{pm.assigned}</div>
                      <div className="text-tag text-text-secondary">分配</div>
                    </div>
                    <div>
                      <div className="text-base font-bold font-mono text-brand">{pm.visited}</div>
                      <div className="text-tag text-text-secondary">走访</div>
                    </div>
                    <div>
                      <div className="text-base font-bold font-mono text-success">{pm.willing}</div>
                      <div className="text-tag text-text-secondary">意愿</div>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-[rgba(27,27,27,0.06)] rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-brand rounded-full" style={{ width: `${(pm.visited / pm.assigned) * 100}%` }} />
                  </div>
                </CardCompact>
              ))}
            </div>

            {/* 任务列表 */}
            <Card className="p-0 overflow-hidden">
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
                      const gradeVariant = a.grade === 'A' ? 'emerald' : a.grade === 'B' ? 'blue' : 'amber';
                      const gradeLabel = GRADE_STYLES[a.grade]?.label ?? a.grade;
                      return (
                        <tr key={a.id}>
                          <td className="font-medium text-text-primary">{a.enterprise_name}</td>
                          <td><Tag variant={gradeVariant as 'emerald' | 'blue' | 'amber'} withBorder>{gradeLabel}</Tag></td>
                          <td>
                            {suggestion ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <Bot className="h-3 w-3 text-brand" />
                                  <span className="text-xs font-medium text-brand">{suggestion.pm}</span>
                                </div>
                                <div className="text-tag text-text-muted mt-0.5 max-w-[180px] truncate">{suggestion.reason}</div>
                              </div>
                            ) : <span className="text-xs text-text-muted">—</span>}
                          </td>
                          <td className="text-text-secondary">{a.assigned_to ?? <span className="text-text-muted">未分配</span>}</td>
                          <td className="text-right">
                            {!a.assigned_to && suggestion && (
                              <Button size="sm" onClick={() => toast.success(`已分配给 ${suggestion.pm}`)}
                                icon={<UserCheck className="h-3 w-3" />}>
                                采纳
                              </Button>
                            )}
                            {!a.assigned_to && !suggestion && (
                              <Button variant="primary" size="sm" onClick={() => dispatchTasks(a.grade, 1)}>分发</Button>
                            )}
                            {a.assigned_to && (
                              <span className="text-xs text-success">已分配</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* ═══ 团队效能 ═══ */}
        {activeTab === 'team' && (
          <>
            <div className="bg-surface-card border border-line rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <div className="text-xs text-text-secondary leading-relaxed">
                  <strong>AI 周评估：</strong>团队走访完成率 78%，政策转化率 22.3%（行业均值 15%），
                  {pmAnalysis.filter(p => p.quality === 'excellent').length} 人优秀，
                  {pmAnalysis.filter(p => p.quality === 'needs_attention').length} 人需关注。
                </div>
              </div>
            </div>

            <Card className="p-0">
              <div className="px-4 py-3 border-b border-line flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-text-muted" />
                  <h2 className="text-sm font-semibold text-text-primary">团队成员效能</h2>
                  <Tag variant="blue">✦ AI 评估</Tag>
                </div>
                <Button variant="text" size="sm"
                  onClick={() => sendChat('请对团队每位成员做深度效能分析，从走访质量、转化效率、任务完成度评估。')}>
                  AI 深度分析 <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
              <div className="divide-y divide-line-light">
                {pmAnalysis.map((pm, i) => (
                  <div key={i} className="px-4 py-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0", pm.qualityBg, pm.qualityColor)}>
                        {pm.name.charAt(pm.name.length - 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-text-primary">{pm.name}</span>
                          <Tag variant={pm.quality === 'excellent' ? 'emerald' : pm.quality === 'good' ? 'blue' : 'orange'}>
                            {pm.qualityLabel}
                          </Tag>
                          {pm.overdue > 3 && <Tag variant="red">{pm.overdue} 项逾期</Tag>}
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-2">
                          <div><div className="text-tag text-text-muted">分配/完成</div><div className="text-sm font-bold font-mono">{pm.visited}/{pm.assigned}</div></div>
                          <div><div className="text-tag text-text-muted">转化率</div><div className={cn("text-sm font-bold font-mono", pm.qualityColor)}>{(pm.conversion_rate * 100).toFixed(0)}%</div></div>
                          <div><div className="text-tag text-text-muted">有意愿</div><div className="text-sm font-bold font-mono text-success">{pm.willing}</div></div>
                          <div><div className="text-tag text-text-muted">待处理</div><div className={cn("text-sm font-bold font-mono", pm.overdue > 3 ? 'text-error' : 'text-text-secondary')}>{pm.overdue}</div></div>
                        </div>
                        <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-[rgba(27,27,27,0.06)] mb-2">
                          <div className="bg-[rgba(27,27,27,0.06)] rounded-full" style={{ width: `${(pm.willing / pm.assigned) * 100}%` }} />
                          <div className="bg-[rgba(27,27,27,0.06)] rounded-full" style={{ width: `${((pm.visited - pm.willing) / pm.assigned) * 100}%` }} />
                        </div>
                        {pm.suggestion && (
                          <div className="flex items-start gap-2 p-2.5 bg-[rgba(27,27,27,0.036)] border border-line rounded-lg">
                            <Lightbulb className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
                            <span className="text-xs text-text-secondary">{pm.suggestion}</span>
                          </div>
                        )}
                      </div>
                      <Button variant="text" size="sm"
                        icon={<Bot className="h-3 w-3" />}
                        onClick={() => sendChat(`分析 ${pm.name} 近期工作，转化率 ${(pm.conversion_rate * 100).toFixed(0)}%，给出改进建议。`)}>
                        AI 分析
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
