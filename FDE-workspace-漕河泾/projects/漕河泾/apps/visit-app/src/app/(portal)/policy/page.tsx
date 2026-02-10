/**
 * 政策服务 — 完整版工作台
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Shield, ChevronRight, Users, TrendingUp, Send, Award, AlertTriangle, BarChart3, Zap, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssessments, getPolicyStats, getPMProgress } from '@/lib/mock-data';
import { GRADE_STYLES, TOUCH_STATUS_LABELS, type Grade } from '@/lib/schema';

/* ──── 漏斗 ──── */
function Funnel() {
  const s = getPolicyStats();
  const steps = [
    { label: '已筛选', value: s.total_screened, color: 'from-slate-400 to-slate-500' },
    { label: 'A+B 级', value: s.grade_a + s.grade_b, color: 'from-blue-400 to-blue-600' },
    { label: '已分发', value: s.touch_assigned, color: 'from-indigo-400 to-indigo-600' },
    { label: '已走访', value: s.touch_visited, color: 'from-purple-400 to-purple-600' },
    { label: '有意愿', value: s.touch_willing, color: 'from-emerald-400 to-emerald-600' },
    { label: '已获批', value: s.approved, color: 'from-emerald-500 to-emerald-700' },
  ];
  const max = Math.max(...steps.map(x => x.value), 1);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg grad-green shadow-lg shadow-emerald-500/20">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-gray-900">触达漏斗</h3>
          <p className="text-[11px] text-gray-400">高新技术企业认定 · 2026</p>
        </div>
      </div>
      <div className="space-y-3">
        {steps.map(step => (
          <div key={step.label} className="flex items-center gap-3">
            <span className="w-12 text-right text-[12px] font-medium text-gray-400">{step.label}</span>
            <div className="flex-1">
              <div className={cn('flex h-8 items-center rounded-lg bg-gradient-to-r px-3 text-[12px] font-bold text-white shadow-sm', step.color)}
                style={{ width: `${Math.max((step.value / max) * 100, 5)}%`, transition: 'width 1s ease' }}>
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
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg grad-blue shadow-lg shadow-blue-500/20">
          <Users className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-gray-900">项目经理进度</h3>
          <p className="text-[11px] text-gray-400">触达任务分配与执行</p>
        </div>
      </div>
      <div className="space-y-4">
        {progress.map(pm => (
          <div key={pm.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-[11px] font-bold text-white">
                {pm.name.charAt(0)}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">{pm.name}</p>
                <div className="flex gap-2 text-[11px]">
                  <span className="text-gray-400">{pm.assigned} 分发</span>
                  <span className="text-blue-500">{pm.visited} 走访</span>
                  <span className="text-emerald-500">{pm.willing} 意愿</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-24 rounded-full bg-gray-100">
                <div className="h-2 rounded-full grad-blue transition-all duration-1000" style={{ width: `${pm.assigned > 0 ? (pm.visited / pm.assigned) * 100 : 0}%` }} />
              </div>
              <span className="w-10 text-right text-[12px] font-bold tabular-nums text-gray-500">
                {pm.assigned > 0 ? Math.round((pm.visited / pm.assigned) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──── 主页面 ──── */
export default function PolicyPage() {
  const router = useRouter();
  const [gradeFilter, setGradeFilter] = useState<Grade | ''>('');
  const s = getPolicyStats();
  const assessments = getAssessments(gradeFilter || undefined);

  const gradeCards = [
    { grade: 'A', count: s.grade_a, label: '高概率符合', grad: 'grad-green', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { grade: 'B', count: s.grade_b, label: '需补充材料', grad: 'grad-blue', shadow: 'shadow-blue-500/20', bg: 'bg-blue-50', text: 'text-blue-600' },
    { grade: 'C', count: s.grade_c, label: '待进一步评估', grad: 'grad-amber', shadow: 'shadow-amber-500/20', bg: 'bg-amber-50', text: 'text-amber-600' },
  ];

  return (
    <div className="min-h-full">
      {/* 页头 */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-[1200px] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl grad-green shadow-lg shadow-emerald-500/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-[20px] font-extrabold text-gray-900">政策服务</h1>
                <p className="text-[13px] text-gray-400">高新技术企业认定 · 2026 年度</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-[13px] font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                <Send className="h-3.5 w-3.5" />一键分发 A 级
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-xl grad-green px-5 text-[13px] font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-emerald-500/30 hover:scale-[1.02] cursor-pointer">
                开始新一轮筛选
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-8 py-6 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">已筛选</p>
            <p className="mt-2 text-[36px] font-extrabold tabular-nums text-gray-900 leading-none">{s.total_screened}</p>
            <p className="mt-1 text-[12px] text-gray-400">家企业</p>
          </div>
          {gradeCards.map(g => (
            <div key={g.grade} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-px cursor-pointer"
              onClick={() => setGradeFilter(g.grade as Grade)}>
              <div className={cn('inline-flex h-8 w-8 items-center justify-center rounded-lg text-[14px] font-extrabold text-white', g.grad)}>
                {g.grade}
              </div>
              <p className="mt-3 text-[28px] font-extrabold tabular-nums text-gray-900 leading-none">{g.count}</p>
              <p className="mt-1 text-[11px] text-gray-400">{g.label}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">有意愿</p>
            <p className="mt-2 text-[28px] font-extrabold tabular-nums text-emerald-600 leading-none">{s.touch_willing}</p>
            <p className="mt-1 text-[12px] text-gray-400">转化率 {s.touch_visited > 0 ? ((s.touch_willing / s.touch_visited) * 100).toFixed(0) : 0}%</p>
          </div>
        </div>

        {/* 漏斗 + PM */}
        <div className="grid grid-cols-2 gap-6">
          <Funnel />
          <PMTable />
        </div>

        {/* 筛选结果 */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-[16px] font-bold text-gray-900">筛选结果</h2>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">{assessments.length} 家</span>
            </div>
            <div className="flex gap-1.5">
              {(['', 'A', 'B', 'C'] as const).map(g => (
                <button key={g} onClick={() => setGradeFilter(g as Grade | '')}
                  className={cn(
                    'rounded-lg px-4 py-2 text-[12px] font-semibold transition-all duration-200 cursor-pointer',
                    gradeFilter === g
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  )}>
                  {g === '' ? '全部' : `${g} 级`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {assessments.map(a => {
              const gs = GRADE_STYLES[a.grade];
              const passRate = a.screening_details.length > 0 ? Math.round((a.screening_details.filter(d => d.result === 'pass').length / a.screening_details.length) * 100) : 0;
              const pendingN = a.screening_details.filter(d => d.result === 'pending').length;
              const gradeGrad = a.grade === 'A' ? 'grad-green' : a.grade === 'B' ? 'grad-blue' : 'grad-amber';
              const touchStyle = a.touch_status === 'willing' ? 'bg-emerald-50 text-emerald-600' : a.touch_status === 'assigned' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500';

              return (
                <div key={a.id} onClick={() => router.push(`/policy/screening/${a.id}`)}
                  className="group flex items-center gap-5 rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-200 cursor-pointer hover:border-blue-100 hover:shadow-card-hover hover:-translate-y-px">
                  {/* 评级 */}
                  <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[16px] font-extrabold text-white shadow-lg', gradeGrad)}>
                    {a.grade === 'unqualified' ? '-' : a.grade}
                  </div>

                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-bold text-gray-900 truncate">{a.enterprise_name?.replace(/上海|有限公司/g, '')}</p>
                      {pendingN > 0 && <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">{pendingN} 项待确认</span>}
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-[12px]">
                      <span className="text-gray-400">评分 <strong className="text-gray-700">{a.grade_score}</strong></span>
                      <span className="text-gray-400">通过率 <strong className="text-gray-700">{passRate}%</strong></span>
                      <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', touchStyle)}>
                        {TOUCH_STATUS_LABELS[a.touch_status]}
                      </span>
                      {a.assigned_to && <span className="text-gray-400">{a.assigned_to}</span>}
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="shrink-0 w-24">
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className={cn('h-2 rounded-full', a.grade_score >= 80 ? 'bg-emerald-500' : a.grade_score >= 60 ? 'bg-blue-500' : 'bg-amber-500')}
                        style={{ width: `${a.grade_score}%` }} />
                    </div>
                  </div>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-200 transition-all duration-200 group-hover:text-blue-500" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
