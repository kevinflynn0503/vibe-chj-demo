/**
 * 客户拜访 — 企业列表（首页）
 * 操作导向：搜索/筛选企业 → 生成背调 / 查看画像 / 新建走访
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Search, Filter, AlertCircle, FileText, Eye, Plus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEnterprises, getStats } from '@/lib/mock-data';
import { generateReport } from '@/lib/host-api';

export default function VisitPage() {
  const router = useRouter();
  const enterprises = getEnterprises();
  const stats = getStats();
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  const industries = useMemo(() =>
    Array.from(new Set(enterprises.map(e => e.industry).filter(Boolean))) as string[],
    [enterprises]
  );

  const filtered = useMemo(() => enterprises.filter(e => {
    if (search && !e.name.includes(search) && !e.short_name?.includes(search)) return false;
    if (industryFilter && e.industry !== industryFilter) return false;
    return true;
  }), [enterprises, search, industryFilter]);

  const hasPending = stats.pending_confirmations > 0 || stats.pending_demands > 0;

  return (
    <div className="p-5 space-y-4">
      {/* 待办提醒栏 */}
      {hasPending && (
        <div className="alert-bar alert-bar-warning">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <div className="flex items-center gap-4 text-[13px]">
            {stats.pending_confirmations > 0 && (
              <button
                onClick={() => router.push('/visit/records?status=pending')}
                className="font-medium underline underline-offset-2 cursor-pointer hover:opacity-80"
              >
                {stats.pending_confirmations} 条走访记录待确认
              </button>
            )}
            {stats.pending_demands > 0 && (
              <span className="font-medium">
                {stats.pending_demands} 条企业需求待处理
              </span>
            )}
          </div>
        </div>
      )}

      {/* 搜索筛选栏 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-placeholder)]" />
          <input
            type="text"
            placeholder="搜索企业名称..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-secondary" />
          <select
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
            className="input w-auto min-w-[120px] cursor-pointer"
          >
            <option value="">全部赛道</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      {/* 企业列表 — 表格 */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-semibold text-primary">企业列表</h2>
            <span className="tag tag-gray">{filtered.length} 家</span>
          </div>
          <button
            onClick={() => router.push('/visit/records')}
            className="btn btn-text btn-sm"
          >
            走访记录
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <table className="ftable">
          <thead>
            <tr>
              <th>企业名称</th>
              <th>赛道</th>
              <th className="text-right">员工</th>
              <th>最近走访</th>
              <th className="text-center">走访次数</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ent => (
              <tr key={ent.id} className="cursor-pointer" onClick={() => router.push(`/enterprises/${ent.id}`)}>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary">{ent.short_name ?? ent.name}</span>
                    {ent.is_incubated && <span className="tag tag-blue">孵化</span>}
                  </div>
                  {ent.short_name && (
                    <div className="text-[12px] text-secondary mt-0.5">{ent.name}</div>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    {ent.industry && <span className="tag tag-blue">{ent.industry}</span>}
                    {ent.industry_sub && <span className="tag tag-gray">{ent.industry_sub}</span>}
                  </div>
                </td>
                <td className="text-right tabular-nums text-secondary">
                  {ent.employee_count?.toLocaleString() ?? '-'}
                </td>
                <td className="text-secondary text-[13px]">
                  {ent.last_visited_at ?? <span className="text-placeholder">未走访</span>}
                </td>
                <td className="text-center tabular-nums">
                  -
                </td>
                <td className="text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      className="btn btn-text btn-sm"
                      onClick={() => router.push(`/enterprises/${ent.id}`)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      画像
                    </button>
                    <button
                      className="btn btn-text btn-sm"
                      onClick={() => generateReport(ent.short_name ?? ent.name)}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      背调
                    </button>
                    <button
                      className="btn btn-text btn-sm"
                      onClick={() => router.push(`/visit/records`)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      走访
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-state">
            <p className="text-[14px]">没有匹配的企业</p>
            <p className="text-[12px] mt-1">尝试调整搜索条件</p>
          </div>
        )}
      </div>
    </div>
  );
}
