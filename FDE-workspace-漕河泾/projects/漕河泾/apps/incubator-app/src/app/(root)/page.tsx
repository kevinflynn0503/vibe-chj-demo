/**
 * 孵化器管理首页 — 运营概览
 */

'use client';

import { useRouter } from 'next/navigation';
import {
  Building,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Zap,
  Link2,
  Cpu,
  Code2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIncubatorEnterprises, getActivityReports } from '@/lib/mock-data';

/* ──── 概况卡片 ──── */

function StatsRow() {
  const ents = getIncubatorEnterprises();
  const reports = getActivityReports();
  const highActive = reports.filter(r => r.activity_score >= 80).length;
  const declining = reports.filter(r => r.trend === 'down').length;
  const totalEmp = ents.reduce((s, e) => s + (e.employee_count ?? 0), 0);
  const avgScore = reports.length > 0 ? Math.round(reports.reduce((s, r) => s + r.activity_score, 0) / reports.length) : 0;

  const items = [
    { icon: Building, label: '在孵企业', value: ents.length, sub: 'A6 奇岱松校友中心', color: '' },
    { icon: Users, label: '员工总数', value: totalEmp, sub: '在孵企业合计', color: '' },
    { icon: Zap, label: '高活跃', value: highActive, sub: '活跃度 ≥ 80', color: 'text-emerald-700' },
    { icon: AlertTriangle, label: '需关注', value: declining, sub: '活跃度下降中', color: 'text-amber-700' },
    { icon: TrendingUp, label: '平均活跃度', value: avgScore, sub: '本周', color: '' },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {items.map(item => (
        <div key={item.label} className="rounded-lg border border-border bg-card p-4 shadow-subtle transition-all duration-200 hover:shadow-elevated hover:-translate-y-px">
          <div className="flex items-center gap-2">
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{item.label}</p>
          </div>
          <p className={cn('mt-2 text-xl font-semibold tabular-nums', item.color || 'text-foreground')}>{item.value}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}

/* ──── 企业列表 ──── */

function EnterpriseList() {
  const ents = getIncubatorEnterprises();
  return (
    <div className="rounded-lg border border-border bg-card shadow-subtle">
      <div className="flex items-center gap-2 border-b px-5 py-3">
        <Building className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold text-foreground">孵化企业</h3>
        <span className="text-[11px] text-muted-foreground">{ents.length} 家</span>
      </div>
      <div className="divide-y divide-border">
        {ents.map(ent => (
          <div key={ent.id} className="px-5 py-4 transition-colors duration-150 hover:bg-accent/30">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                  {ent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-foreground">{ent.name}</p>
                    <span className="rounded-md border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">{ent.funding_stage}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{ent.bp_summary}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ent.products.map(p => (
                      <span key={p} className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-foreground">{p}</span>
                    ))}
                    {ent.tech_stack.slice(0, 3).map(t => (
                      <span key={t} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />{ent.location}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{ent.employee_count} 人</p>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />入孵 {ent.entered_at}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──── 活跃度排行 ──── */

function ActivityRanking() {
  const reports = getActivityReports();
  const TrendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus };

  return (
    <div className="rounded-lg border border-border bg-card shadow-subtle">
      <div className="flex items-center gap-2 border-b px-5 py-3">
        <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
        <div>
          <h3 className="text-xs font-semibold text-foreground">活跃度排行</h3>
          <p className="text-[11px] text-muted-foreground">基于门禁 / 会议室 / 访客</p>
        </div>
      </div>
      <div className="divide-y divide-border">
        {reports.map((r, i) => {
          const Icon = TrendIcon[r.trend];
          const trendCls = r.trend === 'up' ? 'text-emerald-600' : r.trend === 'down' ? 'text-red-500' : 'text-muted-foreground';
          const barCls = r.activity_score >= 80 ? 'bg-emerald-500' : r.activity_score >= 60 ? 'bg-blue-500' : r.activity_score >= 40 ? 'bg-amber-400' : 'bg-muted-foreground/30';

          return (
            <div key={r.enterprise_id} className="flex items-center justify-between px-5 py-3.5 transition-colors duration-150 hover:bg-accent/30">
              <div className="flex items-center gap-3">
                <span className={cn('flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold tabular-nums', i < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{r.name}</p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                    <Icon className={cn('h-3 w-3', trendCls)} />
                    <span className="text-muted-foreground">{r.signals[0]}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-20 rounded-full bg-muted">
                  <div className={cn('h-1.5 rounded-full transition-all', barCls)} style={{ width: `${r.activity_score}%` }} />
                </div>
                <span className="w-8 text-right text-xs tabular-nums font-medium text-foreground">{r.activity_score}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──── 主页面 ──── */

export default function IncubatorHomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-700 text-xs font-bold text-white">孵</div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">孵化器管理</h1>
              <p className="text-[11px] text-muted-foreground">A6 奇岱松校友中心</p>
            </div>
          </div>
          <button onClick={() => router.push('/match')}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-purple-700 px-4 text-[13px] font-medium text-white shadow-sm transition-all duration-150 hover:bg-purple-800 hover:-translate-y-px active:translate-y-0">
            <Link2 className="h-4 w-4" />订单匹配
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-8 py-6">
        <StatsRow />
        <div className="grid grid-cols-[1fr_380px] gap-6">
          <EnterpriseList />
          <ActivityRanking />
        </div>
      </div>
    </div>
  );
}
