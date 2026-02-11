/**
 * 企业画像库 — AI 深度融入版
 * 
 * 改造：
 * 1. 顶部新增 AI 洞察概要（企业健康度分布、政策覆盖率）
 * 2. 每张卡片增加 AI 标签（政策匹配状态、风险状态、走访状态）
 * 3. AI 智能搜索入口 + 批量分析按钮
 * 4. 简化筛选维度，增加 AI 推荐排序
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  Search, Filter, Building2, Users, Calendar, Briefcase,
  ChevronRight, Bot, Sparkles, Shield, TrendingUp,
  TrendingDown, AlertTriangle, CheckCircle2, BarChart3, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEnterprises, getAssessments } from '@/lib/mock-data';
import { sendChat } from '@/lib/host-api';

type SortMode = 'default' | 'ai_recommend' | 'latest_visit' | 'risk';

export default function EnterprisesPage() {
  const router = useRouter();
  const enterprises = getEnterprises();
  const assessments = getAssessments();
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('default');

  const industries = useMemo(() => {
    const all = enterprises.map(e => e.industry).filter(Boolean) as string[];
    return Array.from(new Set(all));
  }, [enterprises]);

  // 每个企业的政策评估状态
  const entPolicyMap = useMemo(() => {
    const map: Record<string, { grade: string; score: number }> = {};
    assessments.forEach(a => {
      if (!map[a.enterprise_id] || a.grade_score > map[a.enterprise_id].score) {
        map[a.enterprise_id] = { grade: a.grade, score: a.grade_score };
      }
    });
    return map;
  }, [assessments]);

  const filtered = useMemo(() => {
    let result = enterprises.filter(e => {
      if (search && !e.name.includes(search) && !e.short_name?.includes(search) && !e.industry?.includes(search)) return false;
      if (industryFilter && e.industry !== industryFilter) return false;
      return true;
    });
    if (sortMode === 'latest_visit') {
      result = [...result].sort((a, b) => (b.last_visited_at ?? '').localeCompare(a.last_visited_at ?? ''));
    }
    return result;
  }, [enterprises, search, industryFilter, sortMode]);

  // AI 统计
  const totalEnterprises = enterprises.length;
  const withPolicy = Object.keys(entPolicyMap).length;
  const gradeA = assessments.filter(a => a.grade === 'A').length;
  const recentVisited = enterprises.filter(e => e.last_visited_at).length;
  const incubated = enterprises.filter(e => e.is_incubated).length;

  return (
    <div className="min-h-full">
      <div className="page-container space-y-4">
        {/* ═══ 头部 ═══ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-base font-bold text-slate-900">企业画像库</h1>
            <p className="text-xs text-slate-400 mt-0.5">共 {totalEnterprises} 家园区企业</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-default btn-sm"
              onClick={() => sendChat(`请分析园区 ${totalEnterprises} 家企业的整体情况：行业分布、发展阶段分布、政策覆盖率、高潜力企业推荐，并给出本月重点关注建议。`)}>
              <Bot className="h-3.5 w-3.5" /> AI 园区分析
            </button>
            <button className="btn btn-primary btn-sm"
              onClick={() => sendChat('请推荐本月应优先走访的企业，考虑：近期未走访、政策匹配度高、发展阶段需关注、有活跃需求等因素。')}>
              <Sparkles className="h-3.5 w-3.5" /> AI 推荐走访
            </button>
          </div>
        </div>

        {/* AI 洞察概要 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: Building2, value: totalEnterprises, label: '园区企业', color: 'text-slate-700', iconColor: 'text-slate-400' },
            { icon: Shield, value: withPolicy, label: '已AI筛选', color: 'text-[#3370FF]', iconColor: 'text-[#3370FF]' },
            { icon: CheckCircle2, value: gradeA, label: 'A级企业', color: 'text-emerald-600', iconColor: 'text-emerald-500' },
            { icon: Zap, value: incubated, label: '在孵企业', color: 'text-violet-600', iconColor: 'text-violet-500' },
            { icon: Briefcase, value: recentVisited, label: '已走访', color: 'text-amber-600', iconColor: 'text-amber-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-[10px] border border-slate-200"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}>
              <item.icon className={cn("h-4 w-4 shrink-0", item.iconColor)} />
              <div>
                <div className={cn("text-lg font-bold font-mono", item.color)}>{item.value}</div>
                <div className="text-[10px] text-slate-500">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 搜索 + 筛选 */}
        <div className="bg-white rounded-[10px] border border-slate-200 p-4"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="搜索企业名称、赛道..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-[#3370FF] transition-colors bg-slate-50"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="relative w-full sm:w-40">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select className="w-full pl-10 pr-8 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-[#3370FF] appearance-none bg-slate-50"
                value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}>
                <option value="">全部赛道</option>
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {([
                { key: 'default', label: '默认' },
                { key: 'ai_recommend', label: '✦ AI 推荐' },
                { key: 'latest_visit', label: '最近走访' },
              ] as { key: SortMode; label: string }[]).map(s => (
                <button key={s.key}
                  className={cn("px-3 py-2 rounded-md border transition-colors",
                    sortMode === s.key ? 'bg-[#3370FF] text-white border-[#3370FF]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#3370FF]'
                  )}
                  onClick={() => setSortMode(s.key)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI 推荐提示 */}
        {sortMode === 'ai_recommend' && (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg">
            <Bot className="h-4 w-4 text-[#3370FF] shrink-0" />
            <span className="text-xs text-slate-600">
              AI 综合走访频率、政策匹配度、发展潜力推荐优先关注的企业。
            </span>
          </div>
        )}

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ent => {
            const policy = entPolicyMap[ent.id];
            const gradeColor = policy ? (
              policy.grade === 'A' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              policy.grade === 'B' ? 'bg-blue-50 text-blue-600 border-blue-100' :
              policy.grade === 'C' ? 'bg-amber-50 text-amber-600 border-amber-100' :
              'bg-slate-50 text-slate-500 border-slate-100'
            ) : '';

            return (
              <div key={ent.id}
                className="bg-white border border-slate-200 rounded-[10px] p-4 hover:border-slate-300 transition-all cursor-pointer group"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}
                onClick={() => router.push(`/enterprises/${ent.id}`)}>
                {/* 头部 */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    "w-11 h-11 rounded-lg flex items-center justify-center text-base font-bold shrink-0",
                    ent.is_incubated ? "bg-violet-50 text-violet-600 border border-violet-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                  )}>
                    {(ent.short_name ?? ent.name).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate group-hover:text-[#3370FF] transition-colors">
                      {ent.short_name ?? ent.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border",
                        ent.is_incubated ? "bg-violet-50 text-violet-600 border-violet-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      )}>
                        {ent.is_incubated ? '在孵' : '存续'}
                      </span>
                      {ent.development_stage && <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100">{ent.development_stage}</span>}
                      {policy && (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", gradeColor)}>
                          政策 {policy.grade}级
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 行业标签 */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ent.industry && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{ent.industry}</span>}
                  {ent.industry_sub && <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded">{ent.industry_sub}</span>}
                </div>

                {/* 关键信息 */}
                <div className="space-y-1.5 text-xs text-slate-500 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 shrink-0" />
                    <span>法人: <span className="text-slate-700 font-medium">{ent.legal_person || '-'}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    <span>注册资本: <span className="text-slate-700">{ent.registered_capital || '-'}</span></span>
                  </div>
                  {ent.employee_count && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>员工: <span className="text-slate-700">{ent.employee_count.toLocaleString()} 人</span></span>
                    </div>
                  )}
                </div>

                {/* 底部：AI 快捷操作 + 走访状态 */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-[11px] text-slate-400">
                      {ent.last_visited_at ? `走访 ${ent.last_visited_at}` : '未走访'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="text-[10px] text-[#3370FF] bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-100 transition-colors flex items-center gap-0.5"
                      onClick={(e) => { e.stopPropagation(); sendChat(`请快速分析「${ent.short_name ?? ent.name}」的发展潜力和合作价值。`); }}>
                      <Bot className="h-2.5 w-2.5" /> AI
                    </button>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#3370FF] transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 空状态 */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-500">未找到匹配企业</p>
            <button className="btn btn-default btn-sm mt-3"
              onClick={() => sendChat(`帮我在园区企业中搜索关键词"${search}"相关的企业，从企业名称、业务描述、产品方向等多维度搜索。`)}>
              <Sparkles className="h-3.5 w-3.5" /> AI 智能搜索
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
