/**
 * 初筛报告详情页
 */
'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Send, Shield, FileText, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssessment } from '@/lib/mock-data';
import { GRADE_STYLES, TOUCH_STATUS_LABELS, type ScreeningDetail } from '@/lib/schema';

/* ── 结果样式映射 ── */
const RESULT_STYLES: Record<string, { icon: React.ElementType; badge: string; border: string; dot: string }> = {
  pass:    { icon: CheckCircle2,  badge: 'bg-emerald-50 text-emerald-600', border: 'border-l-emerald-500', dot: 'bg-emerald-500' },
  fail:    { icon: XCircle,       badge: 'bg-red-50 text-red-600',         border: 'border-l-red-500',     dot: 'bg-red-500' },
  pending: { icon: AlertTriangle, badge: 'bg-amber-50 text-amber-600',     border: 'border-l-amber-500',   dot: 'bg-amber-500' },
};

/* ── 规则卡片 ── */
function RuleCard({ d, i }: { d: ScreeningDetail; i: number }) {
  const rs = RESULT_STYLES[d.result] ?? RESULT_STYLES.pending;
  const Icon = rs.icon;
  return (
    <div className={cn(
      'rounded-2xl border border-gray-100 bg-white border-l-[3px] transition-all duration-200 hover:shadow-card-hover hover:-translate-y-px',
      rs.border
    )}>
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-[11px] font-bold text-gray-400">{i}</span>
            <h4 className="text-[14px] font-bold text-gray-900">{d.rule_name}</h4>
            <span className={cn(
              'rounded-lg px-2.5 py-0.5 text-[10px] font-semibold',
              d.rule_type === 'hard' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
            )}>
              {d.rule_type === 'hard' ? '硬性指标' : '软性指标'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {d.confidence && (
              <span className={cn(
                'text-[11px] font-semibold',
                d.confidence === 'high' ? 'text-emerald-500' : d.confidence === 'medium' ? 'text-amber-500' : 'text-red-500'
              )}>
                置信度{d.confidence === 'high' ? '高' : d.confidence === 'medium' ? '中' : '低'}
              </span>
            )}
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold', rs.badge)}>
              <Icon className="h-3 w-3" />
              {d.result === 'pass' ? '通过' : d.result === 'fail' ? '不通过' : '待确认'}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-6">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">企业数据</p>
            <p className={cn('text-[13px] leading-relaxed', d.enterprise_value ? 'text-gray-900 font-medium' : 'text-gray-300')}>
              {d.enterprise_value || '暂未获取'}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">要求标准</p>
            <p className="text-[13px] text-gray-600 leading-relaxed">{d.required_value}</p>
          </div>
        </div>

        {(d.data_source || d.note) && (
          <div className="mt-4 flex items-center justify-between text-[11px]">
            {d.data_source && <span className="text-gray-400">来源: {d.data_source}</span>}
            {d.note && <span className="font-semibold text-amber-500">{d.note}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 主页面 ── */
export default function ScreeningPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const a = getAssessment(id);

  if (!a) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-[14px] text-gray-400">评估记录不存在</p>
    </div>
  );

  const gs = GRADE_STYLES[a.grade];
  const passN = a.screening_details.filter(d => d.result === 'pass').length;
  const failN = a.screening_details.filter(d => d.result === 'fail').length;
  const pendN = a.screening_details.filter(d => d.result === 'pending').length;
  const gradeGrad = a.grade === 'A' ? 'grad-green' : a.grade === 'B' ? 'grad-blue' : 'grad-amber';
  const gradeGlow = a.grade === 'A' ? 'shadow-emerald-500/25' : a.grade === 'B' ? 'shadow-blue-500/25' : 'shadow-amber-500/25';

  return (
    <div className="min-h-full">
      {/* 页头 */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-[960px] px-8 py-6">
          <button onClick={() => router.push('/policy')} className="mb-4 flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" />政策服务
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl text-[20px] font-extrabold text-white shadow-lg', gradeGrad, gradeGlow)}>
                {a.grade === 'unqualified' ? '-' : a.grade}
              </div>
              <div>
                <h1 className="text-[20px] font-extrabold text-gray-900">{a.enterprise_name}</h1>
                <p className="mt-1 text-[13px] text-gray-400">{a.policy_type} · 初筛报告</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-[13px] font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                <FileText className="h-3.5 w-3.5" />生成走访问题
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-xl grad-green px-5 text-[13px] font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-emerald-500/30 hover:scale-[1.02] cursor-pointer">
                <Send className="h-3.5 w-3.5" />分发走访任务
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[960px] space-y-6 px-8 py-6">
        {/* 评级总览 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card animate-fade-in-up">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[16px] font-extrabold text-gray-900">{gs.label}</h2>
              <p className="mt-1 text-[14px] text-gray-400">
                综合评分 <strong className="text-gray-900 text-[18px]">{a.grade_score}</strong><span className="text-gray-300">/100</span>
              </p>
              <div className="mt-3 flex gap-4 text-[12px] font-medium">
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />{passN} 通过
                </span>
                {failN > 0 && (
                  <span className="flex items-center gap-1.5 text-red-500">
                    <XCircle className="h-3.5 w-3.5" />{failN} 不通过
                  </span>
                )}
                {pendN > 0 && (
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <AlertTriangle className="h-3.5 w-3.5" />{pendN} 待确认
                  </span>
                )}
              </div>
            </div>
            <div className="text-right text-[12px] text-gray-400">
              <p>触达状态: <strong className="text-gray-700">{TOUCH_STATUS_LABELS[a.touch_status]}</strong></p>
              {a.assigned_to && <p className="mt-1">负责人: <strong className="text-gray-700">{a.assigned_to}</strong></p>}
            </div>
          </div>

          {/* 评分进度条 */}
          <div className="mt-5 h-3 rounded-full bg-gray-100">
            <div
              className={cn(
                'h-3 rounded-full transition-all duration-1000',
                a.grade_score >= 80 ? 'grad-green' : a.grade_score >= 60 ? 'grad-blue' : 'grad-amber'
              )}
              style={{ width: `${a.grade_score}%` }}
            />
          </div>

          {pendN > 0 && (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-amber-50 px-5 py-3.5 text-[12px] font-medium text-amber-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              以下 {pendN} 项数据不足: {a.screening_details.filter(d => d.result === 'pending').map(d => d.rule_name).join('、')}
            </div>
          )}
        </div>

        {/* 逐项规则 */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <BarChart3 className="h-4 w-4 text-gray-500" />
            </div>
            <h2 className="text-[15px] font-bold text-gray-900">逐项审查 · {a.screening_details.length} 条规则</h2>
          </div>
          <div className="space-y-3">
            {a.screening_details.map((d, i) => <RuleCard key={i} d={d} i={i + 1} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
