/**
 * 首页 — 员工今日工作台
 *
 * 优化：
 * - Hero 区加品牌浅底色背景，消除空旷感
 * - 右栏 sticky 定位，长内容时 AI 动态始终可见
 * - 场景入口视觉层次：主场景拉大、副场景收敛
 * - prefers-reduced-motion 支持
 * - focus-visible 键盘导航
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Briefcase, Shield, Rocket, Building2,
  AlertCircle, FileText,
  Bot, Calendar, Target,
  Zap, ChevronRight, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VisitRecord, VisitDemand, PolicyAssessment, VisitStats } from '@/lib/schema';
import type { IncubatorStats } from '@/services/incubator';
import { Button, Tag, PageSkeleton } from '@/components/ui';
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
      title: 'AI 生成了「蔚来汽车」背调报告',
      detail: '8 章节 · 5 必问问题 · 置信度 85%',
      time: '2分钟前',
      action: () => router.push('/enterprises/ent-002/report'),
      actionLabel: '审核',
    },
    {
      title: 'AI 提取了走访记录（强生医疗）',
      detail: '3 条关键发现 · 2 条诉求',
      time: '30分钟前',
      action: () => router.push(`/visit/confirm/${records[0]?.id || 'rec-001'}`),
      actionLabel: '确认',
    },
    {
      title: 'AI 推荐了匹配：芯视科技 ↔ 蔚来',
      detail: '匹配度 95% · 传感器供应链',
      time: '1小时前',
      action: () => router.push('/incubator/match'),
      actionLabel: '查看',
    },
    {
      title: 'AI 完成新一轮政策筛选',
      detail: '12 家 A 级 · 45 家 B 级',
      time: '2小时前',
      action: () => router.push('/policy/screening'),
      actionLabel: '查看',
    },
    {
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

  return (
    <div className="min-h-full hero-page">

      {/* ═══ Hero 区 — 问候 + 速览数字（背景由 .hero-page 统一处理） ═══ */}
      <div className="animate-fade-in">
        <div className="page-container pb-0">
          <div className="pt-sp-6 pb-sp-6">
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight leading-tight">
              {greeting}，薛坤
            </h1>
            <p className="text-sm text-text-secondary mt-2">{today}</p>

            {/* 速览数字 — 只在 Hero 中展示一次，不在下方重复 */}
            <div className="flex items-center gap-sp-6 mt-sp-5">
              {[
                { v: todayFocus.filter(f => f.priority === 'urgent').length, l: '紧急事项', color: 'text-error' },
                { v: visitStats?.pending_confirmations ?? 0, l: '待确认', color: 'text-brand' },
                { v: myTasks.length, l: '我的任务', color: 'text-text-primary' },
                { v: aiActivities.length, l: 'AI 处理中', color: 'text-brand' },
              ].map((s, i) => (
                <div key={i} className="flex items-baseline gap-1.5">
                  <span className={cn("text-xl font-semibold tabular-nums", s.color)}>{s.v}</span>
                  <span className="text-xs text-text-muted">{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 主体：左右两栏 ═══ */}
      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-sp-6 animate-fade-in" style={{ animationDelay: '80ms' }}>

          {/* ── 左栏 ── */}
          <div className="space-y-sp-7 min-w-0">

            {/* 今日重点 */}
            <section>
              <div className="flex items-center justify-between mb-sp-3">
                <h2 className="text-sm font-semibold text-text-primary tracking-tight">今日重点</h2>
                <span className="text-tag text-text-muted">{todayFocus.length} 项</span>
              </div>
              <div className="rounded-lg border border-line divide-y divide-line stagger-in">
                {todayFocus.map((item, i) => {
                  const config = priorityConfig[item.priority];
                  return (
                    <div
                      key={i}
                      onClick={item.action}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 cursor-pointer group",
                        "transition-all duration-normal ease-out-expo",
                        "hover:bg-surface-hover-row",
                        "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand focus-visible:rounded-sm",
                        "first:rounded-t-lg last:rounded-b-lg",
                      )}
                      tabIndex={0}
                      role="button"
                      onKeyDown={e => e.key === 'Enter' && item.action()}
                    >
                      <item.icon className="h-4 w-4 text-text-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary leading-snug">{item.title}</p>
                        <p className="text-xs text-text-muted mt-0.5">{item.detail}</p>
                      </div>
                      <Tag variant={config.tagVariant}>{config.label}</Tag>
                      <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-normal" />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 场景入口 — 主场景拉大 + 3 副场景 */}
            <section>
              <h2 className="text-sm font-semibold text-text-primary tracking-tight mb-sp-3">场景入口</h2>
              <div className="space-y-3 stagger-in">
                {/* 主场景：客户拜访 — 视觉更突出 */}
                <div
                  onClick={() => router.push(scenarios[0].href)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => e.key === 'Enter' && router.push(scenarios[0].href)}
                  className={cn(
                    "border border-line rounded-lg p-5 cursor-pointer group",
                    "bg-brand-subtle",
                    "transition-all duration-normal ease-out-expo",
                    "hover:shadow-card-hover hover:border-brand-alpha-25",
                    "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2",
                    "flex items-center justify-between"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <Briefcase className="h-5 w-5 text-brand" />
                    <div>
                      <div className="text-base font-semibold text-text-primary">{scenarios[0].title}</div>
                      <div className="text-xs text-text-secondary mt-0.5">{scenarios[0].desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-2xl font-semibold text-brand tabular-nums">{scenarios[0].stat}</span>
                      <span className="text-xs text-text-muted ml-1.5">{scenarios[0].statLabel}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-brand opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-normal ease-out-expo" />
                  </div>
                </div>

                {/* 副场景：三列 */}
                <div className="grid grid-cols-3 gap-3">
                  {scenarios.slice(1).map(s => (
                    <div
                      key={s.title}
                      onClick={() => router.push(s.href)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={e => e.key === 'Enter' && router.push(s.href)}
                      className={cn(
                        "border border-line rounded-lg px-4 py-3.5 cursor-pointer group",
                        "transition-all duration-normal ease-out-expo",
                        "hover:shadow-card-hover hover:border-line-hover",
                        "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-text-primary">{s.title}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-normal" />
                      </div>
                      <div className="text-xs text-text-muted mb-2.5">{s.desc}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-semibold text-text-primary tabular-nums">{s.stat}</span>
                        <span className="text-tag text-text-muted">{s.statLabel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* ── 右栏：AI 动态时间线 — sticky ── */}
          <aside className="lg:sticky lg:top-0 lg:self-start min-w-0">
            <div className="flex items-center justify-between mb-sp-3 pt-0.5">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-brand" />
                <h2 className="text-sm font-semibold text-text-primary tracking-tight">AI 动态</h2>
              </div>
              <span className="text-tag text-text-muted">{aiActivities.length} 条</span>
            </div>

            <div className="relative pl-5 stagger-in">
              {/* 时间线竖线 */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-line" />

              {aiActivities.map((item, i) => (
                <div
                  key={i}
                  className="relative pb-5 last:pb-0 cursor-pointer group"
                  onClick={item.action}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => e.key === 'Enter' && item.action()}
                >
                  <div className={cn(
                    "absolute -left-5 top-1.5 w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center",
                    i === 0
                      ? "bg-brand border-brand-light"
                      : "bg-neutral-200 border-surface-card"
                  )}>
                    {i === 0 && <div className="w-1 h-1 rounded-full bg-surface-card" />}
                  </div>

                  <div className="ml-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-tag text-text-muted tabular-nums">{item.time}</span>
                    </div>
                    <p className="text-sm text-text-primary leading-snug group-hover:text-brand transition-colors duration-normal ease-out-expo">
                      {item.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{item.detail}</p>
                    <span className="inline-block mt-1.5 text-xs text-brand font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-normal">
                      {item.actionLabel} →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <div className="h-sp-8" />
    </div>
  );
}
