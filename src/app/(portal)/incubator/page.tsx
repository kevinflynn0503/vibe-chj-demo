/**
 * 孵化器运营
 *
 * Impeccable 重构：
 * - 运营指标用 inline divider 替代 6 个等尺寸卡片
 * - 去掉 font-mono，用 tabular-nums
 * - 场景入口卡片去掉嵌套 footer
 * - 企业名录：微型进度条改为可读数字
 * - stagger 入场
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Rocket, TrendingDown, TrendingUp, Zap, Building2, Activity,
  ChevronRight, ArrowRight, MapPin, AlertTriangle, Sparkles, Bot,
  Clock, CheckCircle2, Target, Handshake
} from 'lucide-react';
import { sendChat } from '@/lib/host-api';
import { cn } from '@/lib/utils';
import { fetchIncubatorStats, fetchIncubatorEnterprises, fetchActivityReports } from '@/services/incubator';
import type { IncubatorEnterprise } from '@/lib/schema';
import { Card, CardStandard, Tag, Button, PageSkeleton } from '@/components/ui';

export default function IncubatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchIncubatorStats>> | null>(null);
  const [enterprises, setEnterprises] = useState<IncubatorEnterprise[]>([]);
  const [activityReports, setActivityReports] = useState<Awaited<ReturnType<typeof fetchActivityReports>>>([]);

  useEffect(() => {
    async function load() {
      const [statsData, enterprisesData, reportsData] = await Promise.all([
        fetchIncubatorStats(),
        fetchIncubatorEnterprises(),
        fetchActivityReports(),
      ]);
      setStats(statsData);
      setEnterprises(enterprisesData);
      setActivityReports(reportsData);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <PageSkeleton />;

  const statsResolved = stats!;
  const alerts = activityReports.filter(r => r.trend === 'down');
  const topActive = activityReports.filter(r => r.trend === 'up').slice(0, 3);
  const entIdToIncId = Object.fromEntries(enterprises.map(e => [e.enterprise_id, e.id]));

  return (
    <div className="min-h-full">
      {/* ═══ 头部区 ═══ */}
      <div className="page-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-sp-6 pb-sp-5">
          <div>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">孵化器运营</h1>
            <p className="text-xs text-text-muted mt-1">A6 奇岱松校友中心 · {statsResolved.total_enterprises} 家在孵</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => router.push('/incubator/match')}>
            <Sparkles className="h-3.5 w-3.5" /> AI 订单匹配
          </Button>
        </div>
      </div>

      <div className="page-container space-y-sp-7 stagger-in">

        {/* ═══ 运营指标 — inline divider ═══ */}
        <div className="grid grid-cols-6 gap-0 divide-x divide-line border border-line rounded-lg py-4">
          {[
            { v: statsResolved.total_enterprises, l: '在孵企业', icon: Building2 },
            { v: topActive.length, l: '高活跃', icon: TrendingUp, color: 'text-success' },
            { v: alerts.length, l: '异常预警', icon: AlertTriangle, color: 'text-error' },
            { v: 156, l: '本周会议', icon: Clock },
            { v: 89, l: '本周访客', icon: Activity },
            { v: '92%', l: '工位使用率', icon: MapPin },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center px-sp-3">
              <div className="flex items-center gap-1 mb-1.5">
                <s.icon className="h-3 w-3 text-text-muted" />
                <span className="text-tag text-text-muted">{s.l}</span>
              </div>
              <span className={cn("text-xl font-semibold tabular-nums", s.color || "text-text-primary")}>{s.v}</span>
            </div>
          ))}
        </div>

        {/* ═══ 三大场景入口 — 去掉嵌套 footer ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: '异常预警', icon: AlertTriangle, href: '/incubator/alerts',
              desc: alerts.length > 0
                ? alerts.slice(0, 2).map(r => `${r.name} 活跃度 ${r.activity_score}`).join(' · ')
                : '暂无异常',
              badge: alerts.length > 0 ? String(alerts.length) : undefined,
              badgeColor: 'red' as const,
              hint: 'AI 持续监测活跃度，自动检测异常',
            },
            {
              title: 'AI 订单匹配', icon: Rocket, href: '/incubator/match',
              desc: `待处理 ${statsResolved.pending_orders} 个 · 本月匹配 ${statsResolved.total_orders} 次`,
              hint: 'AI 自动拆解需求 + 语义匹配企业能力',
            },
            {
              title: 'AI 反向推荐', icon: Zap, href: '/incubator/recommend',
              desc: '3 条新推荐待审 · 本月推荐 8 条',
              hint: 'AI 监测变化信号（融资/新产品/团队扩张）',
            },
          ].map(s => (
            <div
              key={s.title}
              onClick={() => router.push(s.href)}
              className="border border-line rounded-lg p-4 cursor-pointer transition-all duration-normal ease-out-expo hover:shadow-card-hover hover:border-line-hover group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <s.icon className="h-4 w-4 text-text-muted" />
                  <h2 className="text-sm font-semibold text-text-primary">{s.title}</h2>
                  {s.badge && <Tag variant={s.badgeColor!} className="rounded-full">{s.badge}</Tag>}
                </div>
                <ChevronRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-normal" />
              </div>
              <p className="text-xs text-text-secondary mb-2">{s.desc}</p>
              <p className="text-tag text-text-muted">{s.hint}</p>
            </div>
          ))}
        </div>

        {/* ═══ 两栏 ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-sp-5">
          {/* 高活跃企业 */}
          <Card className="p-0">
            <div className="px-4 py-3.5 border-b border-line flex items-center gap-2">
              <Activity className="h-4 w-4 text-text-muted" />
              <h2 className="text-sm font-semibold text-text-primary">高活跃企业</h2>
            </div>
            <div className="divide-y divide-line-light">
              {topActive.map(r => (
                <div key={r.enterprise_id} className="px-4 py-3.5 flex items-center justify-between hover:bg-surface-hover-row transition-colors duration-normal ease-out-expo cursor-pointer group"
                  onClick={() => { const incId = entIdToIncId[r.enterprise_id]; if (incId) router.push(`/incubator/${incId}`); }}>
                  <div>
                    <div className="text-sm font-medium text-text-primary group-hover:text-brand transition-colors duration-normal">{r.name}</div>
                    <div className="text-xs text-success mt-0.5 tabular-nums">
                      活跃度 {r.activity_score} · {r.signals?.[0] || '会议频次上升'}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-normal" />
                </div>
              ))}
              {topActive.length === 0 && <div className="px-4 py-8 text-center text-xs text-text-muted">暂无高活跃企业</div>}
            </div>
          </Card>

          {/* 最近动态 */}
          <Card className="p-0">
            <div className="px-4 py-3.5 border-b border-line flex items-center gap-2">
              <Clock className="h-4 w-4 text-text-muted" />
              <h2 className="text-sm font-semibold text-text-primary">最近动态</h2>
            </div>
            <div className="divide-y divide-line-light">
              {[
                { text: 'AI 完成「仪电-自动洗车」需求匹配，推荐 3 家', time: '10分钟前', color: 'text-brand' },
                { text: '芯视科技活跃度下降至 35，触发预警', time: '2小时前', color: 'text-error' },
                { text: 'AI 检测到微纳智造完成 Pre-A 融资', time: '昨天', color: 'text-success' },
                { text: '你采纳了「传感器供应商」匹配方案', time: '昨天', color: 'text-brand' },
                { text: '清洁智造走访完成，AI 已提取走访记录', time: '2天前', color: 'text-success' },
              ].map((item, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-surface-hover-row transition-colors duration-normal ease-out-expo">
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", item.color.replace('text-', 'bg-'))} />
                  <p className="text-sm text-text-primary flex-1 min-w-0 truncate">{item.text}</p>
                  <span className="text-tag text-text-muted shrink-0 tabular-nums">{item.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ═══ 在孵企业名录 — 活跃度用数字+色彩，不用微型进度条 ═══ */}
        <div>
          <div className="flex items-center justify-between mb-sp-4">
            <h2 className="text-sm font-semibold text-text-primary">在孵企业名录</h2>
            <span className="text-xs text-text-muted">{enterprises.length} 家</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger-in">
            {enterprises.map(ent => (
              <div key={ent.id}
                onClick={() => router.push(`/incubator/${ent.id}`)}
                className="border border-line rounded-lg p-4 cursor-pointer transition-all duration-normal ease-out-expo hover:shadow-card-hover hover:border-line-hover group">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary truncate group-hover:text-brand transition-colors duration-normal">{ent.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {ent.funding_stage && <Tag variant="orange">{ent.funding_stage}</Tag>}
                      {ent.employee_count && <span className="text-tag text-text-muted">{ent.employee_count}人</span>}
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-semibold tabular-nums shrink-0",
                    ent.activity_score >= 80 ? "text-success" : ent.activity_score >= 50 ? "text-brand" : "text-error"
                  )}>
                    {ent.activity_score}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ent.products.slice(0, 3).map((p, i) => (
                    <Tag key={i} variant="blue">{p}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
