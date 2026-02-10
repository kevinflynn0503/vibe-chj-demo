/**
 * 政策筛选结果 — 员工只读视图
 * 
 * 员工可以查看 AI 筛选结果和自己负责的企业
 * 审核操作（通过/降级/排除）全部在管理看板
 */
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Filter, ChevronRight, CheckCircle2, AlertCircle, Clock, Bot, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssessments, getPolicyStats } from '@/lib/mock-data';

type GradeFilter = 'all' | 'A' | 'B' | 'C';
type ViewFilter = 'all' | 'mine';

export default function ScreeningListPage() {
  const router = useRouter();
  const assessments = getAssessments();
  const stats = getPolicyStats();

  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('mine');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return assessments.filter(a => {
      if (gradeFilter !== 'all' && a.grade !== gradeFilter) return false;
      if (viewFilter === 'mine' && a.assigned_to !== '薛坤') return false;
      if (search && !a.enterprise_name.includes(search)) return false;
      return true;
    });
  }, [assessments, gradeFilter, viewFilter, search]);

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

  const touchLabels: Record<string, { label: string; cls: string }> = {
    willing: { label: '有意愿', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    assigned: { label: '待走访', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
    pending: { label: '待触达', cls: 'bg-slate-50 text-slate-500 border-slate-100' },
    visited: { label: '已走访', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.push('/policy')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> 返回政策服务
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">AI 筛选结果</h1>
                <span className="flex items-center gap-1 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">
                  <Bot className="h-3 w-3" /> AI 自动筛选
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                已筛选 {stats.total_screened} 家 · A级 {stats.grade_a} / B级 {stats.grade_b} / C级 {stats.grade_c}
              </p>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="搜索企业..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded hover:border-slate-300 focus:border-[#3370FF] focus:outline-none transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-4">

        {/* AI 概要 */}
        <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Bot className="h-5 w-5 text-[#3370FF] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong>AI 第 3 轮筛选完成</strong> — 从 17,000+ 企业数据库中自动评估高新认定条件。
              数据来源：企业工商信息 + 知识产权数据库 + AI Deep Research 补齐。
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900 font-mono">{stats.total_screened}</div>
            <div className="text-xs text-slate-500 mt-0.5">总筛选</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 font-mono">{stats.grade_a}</div>
            <div className="text-xs text-slate-500 mt-0.5">A 级</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 font-mono">{stats.grade_b}</div>
            <div className="text-xs text-slate-500 mt-0.5">B 级</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 font-mono">{stats.grade_c}</div>
            <div className="text-xs text-slate-500 mt-0.5">C 级</div>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">视图：</span>
          {([
            { key: 'mine' as ViewFilter, label: '我负责的' },
            { key: 'all' as ViewFilter, label: '全部企业' },
          ]).map(v => (
            <button key={v.key} onClick={() => setViewFilter(v.key)}
              className={cn("text-xs px-2.5 py-1 rounded border transition-colors",
                viewFilter === v.key ? "bg-[#3370FF] text-white border-[#3370FF]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}>{v.label}</button>
          ))}
          <span className="text-xs text-slate-500 ml-2">评级：</span>
          {(['all', 'A', 'B', 'C'] as GradeFilter[]).map(g => (
            <button key={g} onClick={() => setGradeFilter(g)}
              className={cn("text-xs px-2.5 py-1 rounded border transition-colors",
                gradeFilter === g ? "bg-[#3370FF] text-white border-[#3370FF]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}>{g === 'all' ? '全部' : `${g} 级`}</button>
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
                const isMine = a.assigned_to === '薛坤';
                return (
                  <div key={a.id}
                    className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/policy/screening/${a.id}`)}
                  >
                    <div className="flex items-center">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border",
                          gradeColors[a.grade] || 'bg-slate-50 text-slate-400 border-slate-100'
                        )}>{a.grade}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{a.enterprise_name}</span>
                            {isMine && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-[#3370FF] rounded border border-blue-100">我负责</span>
                            )}
                          </div>
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
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        {touch && (
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", touch.cls)}>{touch.label}</span>
                        )}
                        <div className="text-xs font-mono text-slate-400">{a.grade_score}分</div>
                        {isMine && (a.touch_status === 'assigned' || a.touch_status === 'pending') && (
                          <button className="btn btn-primary btn-sm ml-1"
                            onClick={(e) => { e.stopPropagation(); router.push(`/visit/${a.enterprise_id}?from=policy&policy=高新技术企业认定`); }}>
                            <Briefcase className="h-3 w-3" /> 去走访
                          </button>
                        )}
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </div>
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
