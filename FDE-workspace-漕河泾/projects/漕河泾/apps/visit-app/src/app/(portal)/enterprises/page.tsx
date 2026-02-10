/**
 * 企业画像库 — 功能页
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Search, ChevronRight, Building2, Filter, FileText, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEnterprises } from '@/lib/mock-data';

export default function EnterprisesPage() {
  const router = useRouter();
  const enterprises = getEnterprises();
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  const industries = useMemo(() => Array.from(new Set(enterprises.map(e => e.industry).filter(Boolean))) as string[], [enterprises]);
  const filtered = useMemo(() => enterprises.filter(e => {
    if (search && !e.name.includes(search) && !e.short_name?.includes(search)) return false;
    if (industryFilter && e.industry !== industryFilter) return false;
    return true;
  }), [enterprises, search, industryFilter]);

  return (
    <div className="min-h-full">
      {/* 页头 */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-[1200px] px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[20px] font-extrabold text-gray-900">企业画像库</h1>
              <p className="mt-1 text-[13px] text-gray-400">漕河泾开发区 {enterprises.length.toLocaleString()} 家企业</p>
            </div>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl grad-blue px-5 text-[13px] font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-500/30 hover:scale-[1.02] cursor-pointer">
              <FileText className="h-4 w-4" /> 生成背调报告
            </button>
          </div>
          {/* 搜索 */}
          <div className="mt-5 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
              <input type="text" placeholder="搜索企业名称…" value={search} onChange={e => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/80 pl-11 pr-4 text-[14px] text-gray-900 outline-none placeholder:text-gray-300 transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
                className="h-11 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 text-[13px] text-gray-700 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10">
                <option value="">全部赛道</option>
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 列表 */}
      <div className="mx-auto max-w-[1200px] px-8 py-6">
        <div className="space-y-3">
          {filtered.map((ent, idx) => (
            <div
              key={ent.id}
              onClick={() => router.push(`/enterprises/${ent.id}`)}
              className={cn(
                'group flex items-center gap-5 rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-200 cursor-pointer',
                'hover:border-blue-100 hover:shadow-card-hover hover:-translate-y-px',
                'animate-fade-in-up',
                idx === 0 ? '' : idx === 1 ? 'animate-delay-1' : idx === 2 ? 'animate-delay-2' : idx === 3 ? 'animate-delay-3' : 'animate-delay-4'
              )}
            >
              {/* 头像 */}
              <div className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold text-white shadow-lg',
                ent.is_incubated ? 'grad-purple shadow-purple-500/20' : 'grad-blue shadow-blue-500/20'
              )}>
                {(ent.short_name ?? ent.name).charAt(0)}
              </div>

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-bold text-gray-900 truncate">{ent.short_name ?? ent.name}</p>
                  {ent.is_incubated && (
                    <span className="shrink-0 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-600">孵化</span>
                  )}
                </div>
                <p className="mt-0.5 text-[12px] text-gray-400 truncate">{ent.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  {ent.industry && <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600">{ent.industry}</span>}
                  {ent.industry_sub && <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] text-gray-500">{ent.industry_sub}</span>}
                  {ent.development_stage && <span className="rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] text-gray-500">{ent.development_stage}</span>}
                </div>
              </div>

              {/* 右侧数据 */}
              <div className="shrink-0 text-right">
                <div className="flex items-center gap-4 text-[12px] text-gray-400">
                  {ent.employee_count && <span>{ent.employee_count.toLocaleString()} 人</span>}
                  <span>{ent.last_visited_at ?? '未走访'}</span>
                </div>
              </div>

              <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-200 transition-all duration-200 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-24 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
                <Building2 className="h-8 w-8 text-gray-200" />
              </div>
              <p className="text-[15px] font-medium text-gray-400">没有匹配的企业</p>
              <p className="mt-1 text-[13px] text-gray-300">尝试调整搜索条件</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
