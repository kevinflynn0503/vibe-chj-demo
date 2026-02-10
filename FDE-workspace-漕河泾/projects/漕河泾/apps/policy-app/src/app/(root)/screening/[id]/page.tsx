/**
 * 初筛报告页
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  MessageSquare,
  Shield,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssessment } from '@/lib/mock-data';
import { GRADE_STYLES, TOUCH_STATUS_LABELS, type ScreeningDetail } from '@/lib/schema';

const RESULT_CFG: Record<string, { icon: React.ElementType; badge: string; border: string }> = {
  pass: { icon: CheckCircle2, badge: 'border-emerald-200 bg-emerald-50 text-emerald-700', border: 'border-l-emerald-500' },
  fail: { icon: XCircle, badge: 'border-red-200 bg-red-50 text-red-700', border: 'border-l-red-500' },
  pending: { icon: AlertTriangle, badge: 'border-amber-200 bg-amber-50 text-amber-700', border: 'border-l-amber-500' },
};

const CONF_CFG: Record<string, { label: string; cls: string }> = {
  high: { label: '高', cls: 'text-emerald-600' },
  medium: { label: '中', cls: 'text-amber-600' },
  low: { label: '低', cls: 'text-red-500' },
};

function RuleCard({ detail, index }: { detail: ScreeningDetail; index: number }) {
  const cfg = RESULT_CFG[detail.result] ?? RESULT_CFG.pending;
  const Icon = cfg.icon;
  const conf = detail.confidence ? CONF_CFG[detail.confidence] : null;

  return (
    <div className={cn('rounded-lg border border-border bg-card shadow-subtle border-l-[3px] transition-shadow duration-200 hover:shadow-elevated', cfg.border)}>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[11px] font-bold tabular-nums text-muted-foreground">{index}</span>
            <h4 className="text-[13px] font-medium text-foreground">{detail.rule_name}</h4>
            <span className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-medium', detail.rule_type === 'hard' ? 'border-red-200 bg-red-50 text-red-600' : 'border-blue-200 bg-blue-50 text-blue-600')}>
              {detail.rule_type === 'hard' ? '硬性' : '软性'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {conf && <span className={cn('text-xs', conf.cls)}>置信度 {conf.label}</span>}
            <div className="flex items-center gap-1.5">
              <Icon className="h-4 w-4" />
              <span className={cn('rounded-md border px-2 py-0.5 text-[11px] font-medium', cfg.badge)}>
                {detail.result === 'pass' ? '通过' : detail.result === 'fail' ? '不通过' : '待确认'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">企业数据</p>
            <p className={cn('mt-1 text-sm', detail.enterprise_value ? 'text-foreground' : 'italic text-muted-foreground/40')}>{detail.enterprise_value || '暂未获取'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">要求标准</p>
            <p className="mt-1 text-sm text-muted-foreground">{detail.required_value}</p>
          </div>
        </div>
        {(detail.data_source || detail.note) && (
          <div className="mt-3 flex items-center justify-between text-[11px]">
            {detail.data_source && <span className="text-muted-foreground">数据来源: {detail.data_source}</span>}
            {detail.note && <span className="text-amber-700">{detail.note}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScreeningDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const a = getAssessment(id);

  if (!a) return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      <p className="text-sm text-muted-foreground">评估记录不存在</p>
      <button onClick={() => router.push('/')} className="text-xs text-primary hover:underline">返回</button>
    </div>
  );

  const gs = GRADE_STYLES[a.grade];
  const passN = a.screening_details.filter(d => d.result === 'pass').length;
  const pendingN = a.screening_details.filter(d => d.result === 'pending').length;
  const failN = a.screening_details.filter(d => d.result === 'fail').length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto max-w-5xl px-8 py-3">
          <button onClick={() => router.push('/')} className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />政策工作台
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-semibold text-foreground">{a.enterprise_name}</h1>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{a.policy_type} · 初筛报告</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground hover:-translate-y-px">
                <MessageSquare className="h-3.5 w-3.5" />生成走访问题
              </button>
              <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-700 px-4 text-xs font-medium text-white shadow-sm transition-all duration-150 hover:bg-emerald-800 hover:-translate-y-px active:translate-y-0">
                <Send className="h-3.5 w-3.5" />分发走访任务
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-8 py-6">
        {/* 综合评级 */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-subtle">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className={cn('flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold shadow-sm', gs.bg, gs.text)}>
                {a.grade === 'unqualified' ? '-' : a.grade}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{gs.label}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">综合评分 <strong className="text-foreground">{a.grade_score}</strong> / 100</p>
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />{passN} 通过</span>
                  {pendingN > 0 && <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="h-3.5 w-3.5" />{pendingN} 待确认</span>}
                  {failN > 0 && <span className="flex items-center gap-1 text-red-600"><XCircle className="h-3.5 w-3.5" />{failN} 不通过</span>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">触达状态</p>
              <p className="mt-1 text-sm font-medium text-foreground">{TOUCH_STATUS_LABELS[a.touch_status]}</p>
              {a.assigned_to && <p className="mt-0.5 text-xs text-muted-foreground">负责人: {a.assigned_to}</p>}
              {a.task_feishu_id && (
                <p className="mt-1 flex items-center justify-end gap-1 text-xs text-blue-600"><Link2 className="h-3 w-3" />飞书任务已创建</p>
              )}
            </div>
          </div>
          {/* 评分条 */}
          <div className="mt-4 h-2 w-full rounded-full bg-muted">
            <div className={cn('h-2 rounded-full transition-all', a.grade_score >= 80 ? 'bg-emerald-500' : a.grade_score >= 60 ? 'bg-blue-500' : 'bg-amber-500')}
              style={{ width: `${a.grade_score}%` }} />
          </div>
          {pendingN > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3">
              <p className="text-xs font-medium text-amber-800">以下 {pendingN} 项数据不足，建议走访时重点确认:</p>
              <p className="mt-1 text-xs text-amber-700">{a.screening_details.filter(d => d.result === 'pending').map(d => d.rule_name).join('、')}</p>
            </div>
          )}
        </div>

        {/* 逐项 */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Shield className="h-4 w-4 text-muted-foreground" />逐项条件评估
          </h3>
          <div className="space-y-3">
            {a.screening_details.map((d, i) => <RuleCard key={i} detail={d} index={i + 1} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
