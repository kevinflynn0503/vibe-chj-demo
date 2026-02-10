/**
 * 政策筛选结果列表页
 * 
 * 展示 AI 自动筛选的企业列表（按评级分组），点击进入单企业筛选详情
 * 对应需求：UR-201 政策筛选
 */
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Filter, ChevronRight, Building2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssessments, getPolicyStats } from '@/lib/mock-data';

type GradeFilter = 'all' | 'A' | 'B' | 'C';
type StatusFilter = 'all' | 'pass' | 'pending' | 'fail';

export default function ScreeningListPage() {
  const router = useRouter();
  const assessments = getAssessments();
  const stats = getPolicyStats();

  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return assessments.filter(a => {
      if (gradeFilter !== 'all' && a.grade !== gradeFilter) return false;
      if (statusFilter !== 'all' && a.screening_result !== statusFilter) return false;
      if (search && !a.enterprise_name.includes(search)) return false;
      return true;
    });
  }, [assessments, gradeFilter, statusFilter, search]);

  const gradeColors: Record<string, string> = {
    A: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    B: 'bg-blue-50 text-blue-600 border-blue-100',
    C: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pass: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
    pending: <Clock className="h-3.5 w-3.5 text-amber-500" />,
    fail: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
  };

  const statusLabels: Record<string, string> = {
    pass: '通过', pending: '待确认', fail: '不通过',
  };

  const touchLabels: Record<string, { label: string; cls: string }> = {
    willing: { label: '有意愿', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    assigned: { label: '已分发', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
    pending: { label: '待触达', cls: 'bg-slate-50 text-slate-500 border-slate-100' },
    visited: { label: '已走访', cls: 'bg-violet-50 text-violet-600 border-violet-100' },
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.push('/policy')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回政策服务
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900">政策筛选结果</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                已筛选 {stats.total_screened} 家企业 · A级 {stats.grade_a} / B级 {stats.grade_b} / C级 {stats.grade_c}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="搜索企业..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded hover:border-slate-300 focus:border-[#3370FF] focus:outline-none transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-4">

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900 font-mono">{stats.total_screened}</div>
            <div className="text-xs text-slate-500 mt-0.5">总筛选</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 font-mono">{stats.grade_a}</div>
            <div className="text-xs text-slate-500 mt-0.5">A 级（高匹配）</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 font-mono">{stats.grade_b}</div>
            <div className="text-xs text-slate-500 mt-0.5">B 级（中匹配）</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 font-mono">{stats.grade_c}</div>
            <div className="text-xs text-slate-500 mt-0.5">C 级（低匹配）</div>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">评级：</span>
          {(['all', 'A', 'B', 'C'] as GradeFilter[]).map(g => (
            <button key={g} onClick={() => setGradeFilter(g)}
              className={cn(
                "text-xs px-2.5 py-1 rounded border transition-colors",
                gradeFilter === g ? "bg-[#3370FF] text-white border-[#3370FF]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}>
              {g === 'all' ? '全部' : `${g} 级`}
            </button>
          ))}
          <span className="text-xs text-slate-500 ml-2">状态：</span>
          {(['all', 'pass', 'pending'] as StatusFilter[]).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn(
                "text-xs px-2.5 py-1 rounded border transition-colors",
                statusFilter === s ? "bg-[#3370FF] text-white border-[#3370FF]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}>
              {s === 'all' ? '全部' : statusLabels[s]}
            </button>
          ))}
        </div>

        {/* 列表 */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-slate-400">暂无匹配的筛选结果</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map(a => {
                const passCount = a.screening_details.filter(d => d.result === 'pass').length;
                const total = a.screening_details.length;
                const touch = a.touch_status ? touchLabels[a.touch_status] : null;
                return (
                  <div key={a.id}
                    className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/policy/screening/${a.id}`)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border", gradeColors[a.grade] || 'bg-slate-50 text-slate-400 border-slate-100')}>
                        {a.grade}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900">{a.enterprise_name}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{a.policy_type}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            {statusIcons[a.screening_result]}
                            {passCount}/{total} 项通过
                          </span>
                          {a.assigned_to && (
                            <>
                              <span>·</span>
                              <span>负责人: {a.assigned_to}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {touch && (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", touch.cls)}>{touch.label}</span>
                      )}
                      <div className="text-xs font-mono text-slate-400">{a.grade_score}分</div>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
