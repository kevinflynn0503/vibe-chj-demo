/**
 * 政策服务首页 — 工作台
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Shield,
  BarChart3,
  Users,
  ChevronRight,
  Zap,
  Send,
  TrendingUp,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssessments, getPolicyStats, getPMProgress } from '@/lib/mock-data';
import { GRADE_STYLES, TOUCH_STATUS_LABELS, type PolicyAssessment, type Grade } from '@/lib/schema';

/* ──── 统计概览 ──── */

function StatsGrid() {
  const s = getPolicyStats();
  const items = [
    { icon: BarChart3, label: '已筛选', value: s.total_screened, sub: '家企业', color: '' },
    { icon: Award, label: 'A 级', value: s.grade_a, sub: '高概率符合', color: 'text-emerald-700' },
    { icon: Shield, label: 'B 级', value: s.grade_b, sub: '需补充材料', color: 'text-blue-700' },
    { icon: AlertTriangle, label: 'C 级', value: s.grade_c, sub: '待进一步评估', color: 'text-amber-700' },
    { icon: Send, label: '已触达', value: s.touch_visited, sub: `/ ${s.touch_assigned} 已分发`, color: '' },
    { icon: Zap, label: '有意愿', value: s.touch_willing, sub: `转化率 ${s.touch_visited > 0 ? ((s.touch_willing / s.touch_visited) * 100).toFixed(0) : 0}%`, color: 'text-emerald-700' },
  ];

  return (
    <div className="grid grid-cols-6 gap-4">
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

/* ──── 漏斗 ──── */

function Funnel() {
  const s = getPolicyStats();
  const steps = [
    { label: '已筛选', value: s.total_screened, color: 'bg-muted-foreground' },
    { label: 'A+B 级', value: s.grade_a + s.grade_b, color: 'bg-blue-500' },
    { label: '已分发', value: s.touch_assigned, color: 'bg-blue-600' },
    { label: '已走访', value: s.touch_visited, color: 'bg-purple-500' },
    { label: '有意愿', value: s.touch_willing, color: 'bg-emerald-500' },
    { label: '已获批', value: s.approved, color: 'bg-emerald-700' },
  ];
  const max = Math.max(...steps.map(x => x.value), 1);

  return (
    <div className="rounded-lg border border-border bg-card shadow-subtle">
      <div className="flex items-center gap-2 border-b px-5 py-3">
        <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
        <div>
          <h3 className="text-xs font-semibold text-foreground">触达漏斗</h3>
          <p className="text-[11px] text-muted-foreground">高新技术企业认定 · 2026年度</p>
        </div>
      </div>
      <div className="space-y-2.5 px-5 py-4">
        {steps.map(step => (
          <div key={step.label} className="flex items-center gap-3">
            <span className="w-14 text-right text-xs text-muted-foreground">{step.label}</span>
            <div className="flex-1">
              <div className={cn('flex h-7 items-center rounded-md px-3 text-xs font-medium text-white transition-all', step.color)}
                style={{ width: `${Math.max((step.value / max) * 100, 6)}%` }}>
                {step.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──── PM 进度 ──── */

function PMTable() {
  const progress = getPMProgress();
  return (
    <div className="rounded-lg border border-border bg-card shadow-subtle">
      <div className="flex items-center gap-2 border-b px-5 py-3">
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        <div>
          <h3 className="text-xs font-semibold text-foreground">项目经理工作进度</h3>
          <p className="text-[11px] text-muted-foreground">触达任务分配与执行</p>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">姓名</th>
            <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">分发</th>
            <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">走访</th>
            <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">意愿</th>
            <th className="px-5 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">进度</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {progress.map(pm => (
            <tr key={pm.name} className="transition-colors hover:bg-accent/30">
              <td className="px-5 py-3 text-sm font-medium text-foreground">{pm.name}</td>
              <td className="px-3 py-3 text-right text-sm tabular-nums text-muted-foreground">{pm.assigned}</td>
              <td className="px-3 py-3 text-right text-sm tabular-nums text-muted-foreground">{pm.visited}</td>
              <td className="px-3 py-3 text-right text-sm tabular-nums text-emerald-600">{pm.willing}</td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pm.assigned > 0 ? (pm.visited / pm.assigned) * 100 : 0}%` }} />
                  </div>
                  <span className="text-[11px] tabular-nums text-muted-foreground">{pm.assigned > 0 ? Math.round((pm.visited / pm.assigned) * 100) : 0}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──── 筛选结果表 ──── */

function ResultsTable({ data, onSelect }: { data: PolicyAssessment[]; onSelect: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-12 px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">级别</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">企业名称</th>
            <th className="w-20 px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">评分</th>
            <th className="w-20 px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">通过率</th>
            <th className="w-24 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">触达状态</th>
            <th className="w-24 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">负责人</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map(a => {
            const gs = GRADE_STYLES[a.grade];
            const passRate = a.screening_details.length > 0 ? Math.round((a.screening_details.filter(d => d.result === 'pass').length / a.screening_details.length) * 100) : 0;
            const pendingN = a.screening_details.filter(d => d.result === 'pending').length;
            const touchCls = a.touch_status === 'willing' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : a.touch_status === 'assigned' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-border bg-muted text-muted-foreground';

            return (
              <tr key={a.id} onClick={() => onSelect(a.id)} className="cursor-pointer transition-colors duration-150 hover:bg-accent/50">
                <td className="px-5 py-3.5">
                  <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold', gs.bg, gs.text)}>{a.grade === 'unqualified' ? '-' : a.grade}</span>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-sm font-medium text-foreground">{a.enterprise_name?.replace(/上海|有限公司/g, '')}</p>
                  {pendingN > 0 && <p className="text-[11px] text-amber-600">{pendingN} 项待确认</p>}
                </td>
                <td className="px-4 py-3.5 text-right text-sm tabular-nums font-medium text-foreground">{a.grade_score}</td>
                <td className="px-4 py-3.5 text-right text-sm tabular-nums text-muted-foreground">{passRate}%</td>
                <td className="px-4 py-3.5"><span className={cn('inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium', touchCls)}>{TOUCH_STATUS_LABELS[a.touch_status]}</span></td>
                <td className="px-4 py-3.5 text-xs text-muted-foreground">{a.assigned_to ?? '—'}</td>
                <td className="pr-4"><ChevronRight className="h-4 w-4 text-muted-foreground/40" /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ──── 主页面 ──── */

export default function PolicyHomePage() {
  const router = useRouter();
  const [gradeFilter, setGradeFilter] = useState<Grade | ''>('');
  const assessments = getAssessments(gradeFilter || undefined);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-xs font-bold text-white">策</div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">政策服务</h1>
              <p className="text-[11px] text-muted-foreground">高新技术企业认定 · 2026 年度</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground hover:-translate-y-px">
              <Send className="h-3.5 w-3.5" />一键分发 A 级
            </button>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-700 px-4 text-xs font-medium text-white shadow-sm transition-all duration-150 hover:bg-emerald-800 hover:-translate-y-px active:translate-y-0">
              开始新一轮筛选
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-8 py-6">
        <StatsGrid />
        <div className="grid grid-cols-2 gap-6"><Funnel /><PMTable /></div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-foreground">筛选结果</h2><span className="text-xs text-muted-foreground">{assessments.length} 家</span></div>
            <div className="flex gap-1">
              {(['', 'A', 'B', 'C'] as const).map(g => (
                <button key={g} onClick={() => setGradeFilter(g as Grade | '')}
                  className={cn('rounded-md px-3 py-1 text-xs font-medium transition-all duration-150', gradeFilter === g ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent')}>
                  {g === '' ? '全部' : `${g} 级`}
                </button>
              ))}
            </div>
          </div>
          <ResultsTable data={assessments} onSelect={id => router.push(`/screening/${id}`)} />
        </div>
      </div>
    </div>
  );
}
