/**
 * 走访记录列表
 * 
 * 统一规范：
 * - 头部：bg-white border-b → max-w-[1200px] mx-auto px-4 sm:px-6 py-4
 * - 内容：max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6
 * - 背景：min-h-screen bg-white
 * - 返回按钮：text-xs text-slate-500 hover:text-[#3370FF], ArrowLeft h-3.5
 */
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo, Suspense } from 'react';
import { ArrowLeft, Filter, CheckCircle2, AlertCircle, FileVideo, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVisitRecords } from '@/lib/mock-data';
import { VISIT_TYPE_LABELS } from '@/lib/schema';
import type { VisitType } from '@/lib/schema';

function VisitRecordsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const records = getVisitRecords();
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [deptFilter, setDeptFilter] = useState('');

  const departments = useMemo(() =>
    Array.from(new Set(records.map(r => r.visitor_department).filter(Boolean))) as string[],
    [records]
  );

  const filtered = useMemo(() => records.filter(r => {
    if (statusFilter === 'pending' && r.is_confirmed) return false;
    if (statusFilter === 'confirmed' && !r.is_confirmed) return false;
    if (deptFilter && r.visitor_department !== deptFilter) return false;
    return true;
  }), [records, statusFilter, deptFilter]);

  return (
    <div className="min-h-screen bg-white">
      {/* 头部 — 统一模板B */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回走访工作台
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900">走访记录</h1>
              <p className="text-xs text-slate-500 mt-0.5">共 {filtered.length} 条记录</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none sm:w-28 text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white focus:border-[#3370FF] focus:outline-none transition-colors"
              >
                <option value="">全部状态</option>
                <option value="pending">待确认</option>
                <option value="confirmed">已确认</option>
              </select>
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="flex-1 sm:flex-none sm:w-28 text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white focus:border-[#3370FF] focus:outline-none transition-colors"
              >
                <option value="">全部部门</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 内容 — 统一 max-w-[1200px] */}
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500">没有匹配的走访记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="dtable">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>企业</th>
                    <th>走访人</th>
                    <th>部门</th>
                    <th>类型</th>
                    <th>来源</th>
                    <th>状态</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(record => (
                    <tr
                      key={record.id}
                      className={cn(
                        'cursor-pointer transition-colors',
                        !record.is_confirmed && 'bg-amber-50/30 hover:bg-amber-50/50'
                      )}
                      onClick={() => router.push(`/visit/confirm/${record.id}`)}
                    >
                      <td className="font-mono text-slate-600 text-sm">{record.visit_date}</td>
                      <td className="font-semibold text-slate-900">{record.enterprise_name}</td>
                      <td className="text-slate-700">{record.visitor_name}</td>
                      <td className="text-slate-600">{record.visitor_department ?? '-'}</td>
                      <td>
                        {record.visit_type && (
                          <span className="tag tag-blue">
                            {VISIT_TYPE_LABELS[record.visit_type as VisitType] ?? record.visit_type}
                          </span>
                        )}
                      </td>
                      <td>
                        {record.feishu_minute_id ? (
                          <span className="flex items-center gap-1.5 text-sm text-slate-600">
                            <FileVideo className="h-4 w-4" /> 飞书妙记
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Clock className="h-4 w-4" /> 手动录入
                          </span>
                        )}
                      </td>
                      <td>
                        {record.is_confirmed ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" /> 已确认
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-600 text-sm font-medium">
                            <AlertCircle className="h-4 w-4" /> 待确认
                          </span>
                        )}
                      </td>
                      <td className="text-right" onClick={e => e.stopPropagation()}>
                        <button
                          className={cn('btn btn-sm', record.is_confirmed ? 'btn-default' : 'btn-primary')}
                          onClick={() => router.push(`/visit/confirm/${record.id}`)}
                        >
                          {record.is_confirmed ? '查看' : '确认'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VisitRecordsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
            <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    }>
      <VisitRecordsContent />
    </Suspense>
  );
}
