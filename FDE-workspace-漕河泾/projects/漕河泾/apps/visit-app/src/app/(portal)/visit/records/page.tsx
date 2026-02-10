/**
 * 走访记录列表
 * 筛选/确认/管理走访记录
 */
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { ArrowLeft, Filter, CheckCircle2, Clock, AlertTriangle, FileVideo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVisitRecords } from '@/lib/mock-data';
import { VISIT_TYPE_LABELS } from '@/lib/schema';

export default function VisitRecordsPage() {
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
    <div className="p-5 space-y-4">
      {/* 顶部 */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="btn btn-default btn-sm">
          <ArrowLeft className="h-3.5 w-3.5" />
          返回
        </button>
        <h1 className="text-[16px] font-semibold">走访记录</h1>
        <span className="tag tag-gray">{filtered.length} 条</span>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-secondary" />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input w-auto min-w-[120px] cursor-pointer"
        >
          <option value="">全部状态</option>
          <option value="pending">待确认</option>
          <option value="confirmed">已确认</option>
        </select>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="input w-auto min-w-[120px] cursor-pointer"
        >
          <option value="">全部部门</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* 记录表格 */}
      <div className="card overflow-hidden">
        <table className="ftable">
          <thead>
            <tr>
              <th>走访日期</th>
              <th>企业名称</th>
              <th>走访人</th>
              <th>部门</th>
              <th>类型</th>
              <th>来源</th>
              <th className="text-center">状态</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(record => (
              <tr
                key={record.id}
                className={cn(
                  'cursor-pointer',
                  !record.is_confirmed && 'bg-[var(--warning-light)]'
                )}
              >
                <td className="tabular-nums">{record.visit_date}</td>
                <td className="font-medium">{record.enterprise_name}</td>
                <td>{record.visitor_name}</td>
                <td className="text-secondary">{record.visitor_department ?? '-'}</td>
                <td>
                  {record.visit_type && (
                    <span className="tag tag-blue">
                      {VISIT_TYPE_LABELS[record.visit_type]}
                    </span>
                  )}
                </td>
                <td>
                  {record.feishu_minute_id ? (
                    <span className="source-tag">
                      <FileVideo className="h-3 w-3" />
                      飞书妙记
                    </span>
                  ) : (
                    <span className="source-tag">
                      <Clock className="h-3 w-3" />
                      手动录入
                    </span>
                  )}
                </td>
                <td className="text-center">
                  {record.is_confirmed ? (
                    <span className="tag tag-green">
                      <CheckCircle2 className="h-3 w-3" />
                      已确认
                    </span>
                  ) : (
                    <span className="tag tag-orange">
                      <AlertTriangle className="h-3 w-3" />
                      待确认
                    </span>
                  )}
                </td>
                <td className="text-right">
                  {!record.is_confirmed ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => router.push(`/visit/confirm/${record.id}`)}
                    >
                      去确认
                    </button>
                  ) : (
                    <button
                      className="btn btn-text btn-sm"
                      onClick={() => router.push(`/visit/confirm/${record.id}`)}
                    >
                      查看
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-state">
            <p className="text-[14px]">没有匹配的走访记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
