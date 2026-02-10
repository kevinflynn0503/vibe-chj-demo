/**
 * 企业画像库 — 卡片网格布局（类企查查）
 * 移动端1列 / Pad 2列 / PC 3列
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Search, Filter, Building2, MapPin, Users, Calendar, Briefcase, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEnterprises } from '@/lib/mock-data';
import { generateReport } from '@/lib/host-api';

export default function EnterprisesPage() {
  const router = useRouter();
  const enterprises = getEnterprises();
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  const industries = useMemo(() => {
    const all = enterprises.map(e => e.industry).filter(Boolean) as string[];
    return Array.from(new Set(all));
  }, [enterprises]);

  const filtered = useMemo(() => enterprises.filter(e => {
    if (search && !e.name.includes(search) && !e.short_name?.includes(search)) return false;
    if (industryFilter && e.industry !== industryFilter) return false;
    return true;
  }), [enterprises, search, industryFilter]);

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 搜索区域 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">企业画像库</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">共 {enterprises.length} 家园区企业</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="搜索企业名称..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-[#3370FF] transition-colors"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="relative w-full sm:w-44">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select className="w-full pl-10 pr-8 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-[#3370FF] appearance-none bg-white"
                value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}>
                <option value="">全部赛道</option>
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 卡片网格 */}
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ent => (
            <div
              key={ent.id}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:border-[#3370FF] transition-colors cursor-pointer group"
              onClick={() => router.push(`/enterprises/${ent.id}`)}
            >
              {/* 头部：Logo + 名称 + 状态 */}
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
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border",
                      ent.is_incubated ? "bg-violet-50 text-violet-600 border-violet-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                      {ent.is_incubated ? '在孵' : '存续'}
                    </span>
                    {ent.development_stage && <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100">{ent.development_stage}</span>}
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
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span>成立: <span className="text-slate-700">{ent.established_date || '-'}</span></span>
                </div>
                {ent.employee_count && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 shrink-0" />
                    <span>员工: <span className="text-slate-700">{ent.employee_count.toLocaleString()} 人</span></span>
                  </div>
                )}
              </div>

              {/* 底部：最近走访 + 操作 */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  {ent.last_visited_at ? `最近走访 ${ent.last_visited_at}` : '暂无走访'}
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#3370FF] transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-500">未找到匹配企业</p>
          </div>
        )}
      </div>
    </div>
  );
}
