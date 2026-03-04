/**
 * 走访记录列表
 * 
 * 统一规范：
 * - 头部：bg-white border-b → max-w-[1200px] mx-auto px-4 sm:px-6 py-4
 * - 内容：max-w-[1200px] mx-auto px-4 sm:px-6 py-4 space-y-4
 * - 背景：min-h-screen（父级布局提供 #F7F8FA）
 * - 返回按钮：text-xs text-slate-500 hover:text-brand, ArrowLeft h-3.5
 */
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { ArrowLeft, Filter, CheckCircle2, AlertCircle, FileVideo, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchVisitRecords } from '@/services/visit';
import { VISIT_TYPE_LABELS } from '@/lib/schema';
import type { VisitType, VisitRecord } from '@/lib/schema';
import { Button, PageSkeleton, Tag } from '@/components/ui';

function VisitRecordsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<VisitRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [deptFilter, setDeptFilter] = useState('');

  useEffect(() => {
    async function load() {
      const data = await fetchVisitRecords();
      setRecords(data);
      setLoading(false);
    }
    load();
  }, []);

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

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-full">
      {/* 头部 — 统一模板B */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> 返回走访工作台
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-text-primary">走访记录</h1>
              <p className="text-xs text-text-muted mt-0.5">共 {filtered.length} 条记录</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none sm:w-28 text-xs px-2.5 py-1.5 border border-line rounded bg-surface-card focus:border-brand focus:outline-none transition-colors"
              >
                <option value="">全部状态</option>
                <option value="pending">待确认</option>
                <option value="confirmed">已确认</option>
              </select>
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="flex-1 sm:flex-none sm:w-28 text-xs px-2.5 py-1.5 border border-line rounded bg-surface-card focus:border-brand focus:outline-none transition-colors"
              >
                <option value="">全部部门</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 内容 — 统一 max-w-[1200px] */}
      <div className="page-container space-y-6">
        <div className="bg-surface-card border border-line rounded-lg overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-muted">没有匹配的走访记录</p>
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
                        !record.is_confirmed && 'bg-[rgba(27,27,27,0.06)] hover:bg-surface-hover-row'
                      )}
                      onClick={() => router.push(`/visit/confirm/${record.id}`)}
                    >
                      <td className="font-mono text-text-secondary text-sm">{record.visit_date}</td>
                      <td className="font-semibold text-text-primary">{record.enterprise_name}</td>
                      <td className="text-text-secondary">{record.visitor_name}</td>
                      <td className="text-text-secondary">{record.visitor_department ?? '-'}</td>
                      <td>
                        {record.visit_type && (
                          <Tag variant="blue">
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
                          <span className="flex items-center gap-1.5 text-success text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" /> 已确认
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-warning text-sm font-medium">
                            <AlertCircle className="h-4 w-4" /> 待确认
                          </span>
                        )}
                      </td>
                      <td className="text-right" onClick={e => e.stopPropagation()}>
                        <Button
                          variant={record.is_confirmed ? 'default' : 'primary'}
                          size="sm"
                          onClick={() => router.push(`/visit/confirm/${record.id}`)}
                        >
                          {record.is_confirmed ? '查看' : '确认'}
                        </Button>
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
      <div className="min-h-screen">
        <div className="bg-surface-card border-b border-line">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
            <div className="h-4 w-24 bg-[rgba(27,27,27,0.06)] rounded animate-pulse" />
          </div>
        </div>
      </div>
    }>
      <VisitRecordsContent />
    </Suspense>
  );
}
