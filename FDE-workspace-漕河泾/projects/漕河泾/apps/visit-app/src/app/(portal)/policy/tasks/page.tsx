/**
 * 触达任务管理
 * 
 * 统一规范：
 * - 头部：bg-white border-b → max-w-[1200px] mx-auto px-4 sm:px-6 py-4
 * - 返回按钮：text-xs text-slate-500 hover:text-[#3370FF], ArrowLeft h-3.5, mb-3
 * - 标题：text-lg font-bold text-slate-900
 * - 内容：max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6
 * - 背景：min-h-screen bg-[#F5F6F7]
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Send, CheckSquare, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssessments, getPMProgress } from '@/lib/mock-data';
import { GRADE_STYLES, TOUCH_STATUS_LABELS } from '@/lib/schema';
import { dispatchTasks } from '@/lib/host-api';

const GRADE_TAG_MAP: Record<string, string> = {
  A: 'tag-green',
  B: 'tag-blue',
  C: 'tag-orange',
  unqualified: 'tag-gray',
};

export default function TasksPage() {
  const router = useRouter();
  const assessments = getAssessments();
  const pmProgress = getPMProgress();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    selected.size === assessments.length
      ? setSelected(new Set())
      : setSelected(new Set(assessments.map((a) => a.id)));
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 — 统一模板B */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回政策服务
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900">触达任务</h1>
              <p className="text-xs text-slate-500 mt-0.5">管理政策筛选后的企业触达与分发</p>
            </div>
          </div>
        </div>
      </div>

      {/* 内容 — 统一 max-w-[1200px] */}
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* PM 进度卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {pmProgress.map((pm, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">{pm.name}</span>
                <span className="text-xs text-slate-500 font-mono">
                  {(pm.conversion_rate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold font-mono text-slate-900">{pm.assigned}</div>
                  <div className="text-[10px] text-slate-500">分配</div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-blue-600">{pm.visited}</div>
                  <div className="text-[10px] text-slate-500">走访</div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-emerald-600">{pm.willing}</div>
                  <div className="text-[10px] text-slate-500">意愿</div>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#3370FF] rounded-full"
                  style={{ width: `${(pm.visited / pm.assigned) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 批量操作栏 */}
        {selected.size > 0 && (
          <div className="alert-bar alert-bar-info flex items-center gap-3">
            <CheckSquare className="h-3.5 w-3.5 shrink-0" />
            <span className="text-sm">已选 {selected.size} 家</span>
            <button
              className="btn btn-primary btn-sm ml-auto"
              onClick={() => dispatchTasks('批量', selected.size)}
            >
              <Send className="h-3 w-3" /> 批量分发
            </button>
          </div>
        )}

        {/* 任务表格 */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="dtable">
              <thead>
                <tr>
                  <th style={{ width: '32px' }}>
                    <input
                      type="checkbox"
                      checked={selected.size === assessments.length}
                      onChange={selectAll}
                      className="cursor-pointer accent-[#3370FF]"
                    />
                  </th>
                  <th>企业</th>
                  <th>分级</th>
                  <th>分配</th>
                  <th>触达</th>
                  <th>时间</th>
                  <th>飞书</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => {
                  const gradeTag = GRADE_TAG_MAP[a.grade] ?? 'tag-gray';
                  const gradeLabel = GRADE_STYLES[a.grade]?.label ?? a.grade;
                  const touchColor =
                    a.touch_status === 'willing'
                      ? 'tag-green'
                      : a.touch_status === 'visited'
                        ? 'tag-blue'
                        : a.touch_status === 'assigned'
                          ? 'tag-gray'
                          : 'tag-orange';
                  return (
                    <tr key={a.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.has(a.id)}
                          onChange={() => toggleSelect(a.id)}
                          className="cursor-pointer accent-[#3370FF]"
                        />
                      </td>
                      <td className="font-medium text-slate-900">{a.enterprise_name}</td>
                      <td>
                        <span className={cn('tag pill', gradeTag)}>{gradeLabel}</span>
                      </td>
                      <td className="text-slate-600">{a.assigned_to ?? '-'}</td>
                      <td>
                        <span className={cn('tag pill', touchColor)}>
                          {TOUCH_STATUS_LABELS[a.touch_status]}
                        </span>
                      </td>
                      <td className="font-mono text-slate-600">
                        {a.updated_at.split('T')[0]}
                      </td>
                      <td>
                        {a.task_feishu_id ? (
                          <button className="btn btn-text btn-sm">
                            <ExternalLink className="h-3 w-3" /> 查看
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="btn btn-text btn-sm"
                            onClick={() => router.push(`/policy/screening/${a.id}`)}
                          >
                            筛选
                          </button>
                          {a.touch_status === 'willing' && (
                            <button
                              className="btn btn-text btn-sm text-[#3370FF]"
                              onClick={() => router.push(`/policy/diagnosis/${a.id}`)}
                            >
                              诊断
                            </button>
                          )}
                          {!a.assigned_to && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => dispatchTasks(a.grade, 1)}
                            >
                              分发
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
