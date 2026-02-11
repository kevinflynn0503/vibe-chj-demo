/**
 * 走访记录列表
 * 
 * 统一规范：
 * - 头部：bg-white border-b → max-w-[1200px] mx-auto px-4 sm:px-6 py-4
 * - 内容：max-w-[1200px] mx-auto px-4 sm:px-6 py-4 space-y-4
 * - 背景：min-h-screen（由父 layout 提供 #F7F8FA）
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
import { Card, Tag, FilterSelect } from '@/components/ui';

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
    <div className="min-h-full">
      {/* 头部 — 统一模板B */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-brand transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回走访工作台
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-text-primary">走访记录</h1>
              <p className="text-xs text-text-secondary mt-0.5">共 {filtered.length} 条记录</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'pending', label: '待确认' },
                  { value: 'confirmed', label: '已确认' }
                ]}
                placeholder="全部状态"
                className="flex-1 sm:flex-none sm:w-28"
              />
              <FilterSelect
                value={deptFilter}
                onChange={setDeptFilter}
                options={departments.map(d => ({ value: d, label: d }))}
                placeholder="全部部门"
                className="flex-1 sm:flex-none sm:w-28"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 内容 — 统一 max-w-[1200px] */}
      <div className="page-container space-y-4">
        <Card className="p-0 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-text-secondary">没有匹配的走访记录</p>
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
                      <td className="font-mono text-text-secondary text-sm">{record.visit_date}</td>
                      <td className="font-semibold text-text-primary">{record.enterprise_name}</td>
                      <td className="text-text-primary">{record.visitor_name}</td>
                      <td className="text-text-secondary">{record.visitor_department ?? '-'}</td>
                      <td>
                        {record.visit_type && (
                          <Tag variant="primary">
                            {VISIT_TYPE_LABELS[record.visit_type as VisitType] ?? record.visit_type}
                          </Tag>
                        )}
                      </td>
                      <td>
                        {record.feishu_minute_id ? (
                          <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                            <FileVideo className="h-4 w-4" /> 飞书妙记
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm text-text-secondary">
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
        </Card>
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
