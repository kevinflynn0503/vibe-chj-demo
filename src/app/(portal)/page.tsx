/**
 * 首页 — 员工今日工作台
 *
 * 设计：
 * - Hero 区极浅品牌色垂直渐变，底部自然过渡到白色
 * - 统计指标在 Hero 内，分隔线排列，关键数字品牌色
 * - hover 统一：卡片用 hover-card，列表行用 hover-row，无边框色变化
 * - 今日重点左侧色条区分优先级
 * - AI 动态时间线样式
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Briefcase, Shield, Rocket, Building2,
  AlertCircle, FileText,
  Bot, Calendar, Target, Clock, MessageSquare,
  Zap, ArrowRight, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VisitRecord, VisitDemand, PolicyAssessment, VisitStats } from '@/lib/schema';
import type { IncubatorStats } from '@/services/incubator';
import { Button, Tag, PageSkeleton } from '@/components/ui';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { fetchVisitStats, fetchVisitRecords, fetchDemands } from '@/services/visit';
import { fetchAssessments } from '@/services/policy';
import { fetchIncubatorStats } from '@/services/incubator';

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [incubatorStats, setIncubatorStats] = useState<IncubatorStats | null>(null);
  const [records, setRecords] = useState<VisitRecord[]>([]);
  const [demands, setDemands] = useState<VisitDemand[]>([]);
  const [assessments, setAssessments] = useState<PolicyAssessment[]>([]);

  useEffect(() => {
    async function load() {
      const [vs, recs, dems, asses, incStats] = await Promise.all([
        fetchVisitStats(),
        fetchVisitRecords(),
        fetchDemands(),
        fetchAssessments(),
        fetchIncubatorStats(),
      ]);
      setVisitStats(vs);
      setRecords(recs);
      setDemands(dems);
      setAssessments(asses);
      setIncubatorStats(incStats);
      setLoading(false);
    }
    load();
  }, []);

  const myTasks = assessments.filter(a => a.assigned_to === '薛坤');
  const pendingVisits = myTasks.filter(a => a.touch_status === 'pending' || a.touch_status === 'assigned');

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

  if (loading) return <PageSkeleton />;

  const todayFocus = [
    {
      priority: 'urgent' as const,
      title: '14:00 走访蔚来汽车',
      detail: '背调已就绪 · 沟通话术已生成 · 3 个必问问题',
      action: () => router.push('/visit/ent-002'),
      icon: Calendar,
    },
    {
      priority: 'high' as const,
      title: `${pendingVisits.length} 家企业待走访触达`,
      detail: '政策服务分配的高新认定企业',
      action: () => router.push('/policy'),
      icon: Target,
    },
    {
      priority: 'medium' as const,
      title: `${records.filter(r => !r.is_confirmed).length} 条走访记录待确认`,
      detail: 'AI 已提取关键信息，需你确认',
      action: () => router.push('/visit'),
      icon: FileText,
    },
  ];

  const priorityConfig = {
    urgent: { label: '紧急', tagVariant: 'red' as const },
    high: { label: '重要', tagVariant: 'amber' as const },
    medium: { label: '常规', tagVariant: 'gray' as const },
  };

  const aiActivities = [
    {
      icon: Bot,
      title: 'AI 生成了「蔚来汽车」背调报告',
      detail: '8 章节 · 5 必问问题 · 置信度 85%',
      time: '2分钟前',
      action: () => router.push('/enterprises/ent-002/report'),
      actionLabel: '审核',
    },
    {
      icon: FileText,
      title: 'AI 提取了走访记录（强生医疗）',
      detail: '3 条关键发现 · 2 条诉求',
      time: '30分钟前',
      action: () => router.push(`/visit/confirm/${records[0]?.id || 'rec-001'}`),
      actionLabel: '确认',
    },
    {
      icon: Target,
      title: 'AI 推荐了匹配：芯视科技 ↔ 蔚来',
      detail: '匹配度 95% · 传感器供应链',
      time: '1小时前',
      action: () => router.push('/incubator/match'),
      actionLabel: '查看',
    },
    {
      icon: Shield,
      title: 'AI 完成新一轮政策筛选',
      detail: '12 家 A 级 · 45 家 B 级',
      time: '2小时前',
      action: () => router.push('/policy/screening'),
      actionLabel: '查看',
    },
    {
      icon: AlertCircle,
      title: '芯视科技活跃度异常下降',
      detail: 'AI 检测到连续2周活跃度下降',
      time: '3小时前',
      action: () => router.push('/incubator/alerts'),
      actionLabel: '查看',
    },
  ];

  const scenarios = [
    {
      title: '客户拜访',
      desc: '走访全流程管理',
      icon: Briefcase,
      href: '/visit',
      stat: visitStats?.pending_confirmations ?? 0,
      statLabel: '待确认',
    },
    {
      title: '政策服务',
      desc: 'AI 筛选 + 触达',
      icon: Shield,
      href: '/policy',
      stat: myTasks.length,
      statLabel: '分配给我',
    },
    {
      title: '孵化管理',
      desc: '企业运营监控',
      icon: Rocket,
      href: '/incubator',
      stat: incubatorStats?.pending_orders ?? 0,
      statLabel: '待匹配',
    },
    {
      title: '企业库',
      desc: '园区企业画像',
      icon: Building2,
      href: '/enterprises',
      stat: '326',
      statLabel: '园区企业',
    },
  ];

  const stats = [
    { label: '待处理', value: aiActivities.length, icon: Clock, highlight: true },
    { label: '本月走访', value: records.length, icon: Briefcase, highlight: false },
    { label: '政策任务', value: myTasks.length, icon: Shield, highlight: false },
    { label: '需求跟进', value: demands.filter(d => d.status === 'pending').length, icon: MessageSquare, highlight: false },
  ];

  return (
    <div className="min-h-full">

      {/* ═══ Hero 区 ═══ */}
      <div className="relative animate-fade-in">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(51,112,255,0.04) 0%, rgba(255,255,255,0) 100%)',
          }}
        />

        <div className="relative page-container pb-0">
          {/* 问候 + 摘要 */}
          <div className="flex items-end justify-between pt-5 pb-6">
            <div>
              <h1 className="text-[22px] font-semibold text-text-primary tracking-tight leading-tight">{greeting}，薛坤</h1>
              <p className="text-xs text-text-muted mt-1.5">{today}</p>
            </div>
            <div className="flex items-center gap-6 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                <span className="text-text-primary font-semibold">{pendingVisits.length}</span> 走访任务
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                <span className="text-text-primary font-semibold">{records.filter(r => !r.is_confirmed).length}</span> 待确认
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                <span className="text-text-primary font-semibold">{demands.filter(d => d.status === 'pending').length}</span> 需求跟进
              </span>
            </div>
          </div>

          {/* 统计卡片 — Hero 区内部，用分隔线排列 */}
          <div className="grid grid-cols-4 gap-0 divide-x divide-line/50 pb-6">
            {stats.map((s, i) => (
              <div key={i} className={cn('flex flex-col', i === 0 ? 'pr-6' : 'px-6')}>
                <div className="flex items-center gap-1.5 mb-2">
                  <s.icon className="h-3.5 w-3.5 text-text-muted" />
                  <span className="text-xs text-text-muted">{s.label}</span>
                </div>
                <span className={cn(
                  'text-[28px] font-semibold font-mono leading-none tabular-nums',
                  s.highlight ? 'text-brand' : 'text-text-primary'
                )}>
                  {typeof s.value === 'number' ? <AnimatedNumber value={s.value} className="" /> : s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ 主体：左右两栏 ═══ */}
      <div className="page-container">
        <div className="grid grid-cols-3 gap-5 animate-fade-in" style={{ animationDelay: '80ms' }}>

          {/* ── 左栏：操作区（2/3） ── */}
          <div className="col-span-2 space-y-5">

            {/* 今日重点 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-[3px] h-4 bg-brand rounded-full" />
                <span className="text-sm font-semibold text-text-primary">今日重点</span>
                <span className="text-xs text-text-muted">{todayFocus.length} 项待办</span>
              </div>
              <div className="rounded-lg border border-line divide-y divide-line">
                {todayFocus.map((item, i) => {
                  const config = priorityConfig[item.priority];
                  return (
                    <div
                      key={i}
                      onClick={item.action}
                      className="flex items-center gap-4 px-4 py-3.5 cursor-pointer transition-colors duration-150 hover:bg-surface-hover-row first:rounded-t-lg last:rounded-b-lg"
                    >
                      <item.icon className="h-4 w-4 text-text-secondary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary leading-snug">{item.title}</p>
                        <p className="text-xs text-text-muted mt-0.5">{item.detail}</p>
                      </div>
                      <Tag variant={config.tagVariant}>{config.label}</Tag>
                      <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 场景入口 — 2x2 网格卡片 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-[3px] h-4 bg-brand rounded-full" />
                <span className="text-sm font-semibold text-text-primary">场景入口</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {scenarios.map(s => (
                  <div
                    key={s.title}
                    onClick={() => router.push(s.href)}
                    className="border border-line rounded-lg p-4 cursor-pointer transition-colors duration-150 hover:bg-surface-hover-card group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-subtle flex items-center justify-center">
                        <s.icon className="h-4 w-4 text-brand" />
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-sm font-medium text-text-primary">{s.title}</div>
                    <div className="text-xs text-text-muted mt-0.5">{s.desc}</div>
                    <div className="flex items-baseline gap-1 mt-2.5">
                      <span className="text-lg font-semibold font-mono text-text-primary tabular-nums">{s.stat}</span>
                      <span className="text-[11px] text-text-muted">{s.statLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── 右栏：AI 动态时间线（1/3） ── */}
          <div className="col-span-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-brand" />
                <span className="text-sm font-semibold text-text-primary">AI 动态</span>
              </div>
              <span className="text-xs text-text-muted">{aiActivities.length} 条</span>
            </div>

            <div className="relative pl-5">
              {/* 时间线竖线 */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-line" />

              {aiActivities.map((item, i) => (
                <div
                  key={i}
                  className="relative pb-5 last:pb-0 cursor-pointer group"
                  onClick={item.action}
                >
                  {/* 时间线圆点 */}
                  <div className={cn(
                    "absolute -left-5 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-white flex items-center justify-center",
                    i === 0 ? "bg-brand" : "bg-line"
                  )}>
                    {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>

                  <div className="ml-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] text-text-muted font-mono">{item.time}</span>
                    </div>
                    <p className="text-sm text-text-primary leading-snug group-hover:text-brand transition-colors duration-150">{item.title}</p>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{item.detail}</p>
                    <span className="inline-block mt-1.5 text-xs text-brand font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      {item.actionLabel} →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
