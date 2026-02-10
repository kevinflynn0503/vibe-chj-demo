/**
 * 我的触达任务 — 员工视角
 * 
 * 只显示分配给我的任务，聚焦"去走访"操作
 * 管理操作（分配、PM进度、批量分发）全部在管理看板
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Briefcase, ChevronRight, Bot, Sparkles,
  CheckCircle2, AlertCircle, Clock, Target, Send, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssessments } from '@/lib/mock-data';
import { GRADE_STYLES, TOUCH_STATUS_LABELS } from '@/lib/schema';
import { sendChat } from '@/lib/host-api';

const GRADE_TAG_MAP: Record<string, string> = {
  A: 'tag-green', B: 'tag-blue', C: 'tag-orange', unqualified: 'tag-gray',
};

export default function TasksPage() {
  const router = useRouter();
  const assessments = getAssessments();

  // 只显示分配给我的（当前用户：薛坤）
  const myTasks = assessments.filter(a => a.assigned_to === '薛坤');
  const pendingVisit = myTasks.filter(a => a.touch_status === 'pending' || a.touch_status === 'assigned');
  const visited = myTasks.filter(a => a.touch_status === 'visited');
  const willing = myTasks.filter(a => a.touch_status === 'willing');

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.push('/policy')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> 返回政策服务
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900">我的触达任务</h1>
              <p className="text-xs text-slate-500 mt-0.5">分配给我的企业走访任务 · 共 {myTasks.length} 家</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => sendChat('请为我今天要走访的企业生成走访话术和政策必问问题，帮我做好准备。')}>
              <Sparkles className="h-3.5 w-3.5" /> AI 批量准备
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* 我的统计 */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900 font-mono">{myTasks.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">分配给我</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className={cn("text-2xl font-bold font-mono", pendingVisit.length > 0 ? 'text-amber-600' : 'text-slate-300')}>{pendingVisit.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">待走访</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 font-mono">{visited.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">已走访</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 font-mono">{willing.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">有意愿</div>
          </div>
        </div>

        {/* ═══ 待走访 ═══ */}
        {pendingVisit.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">待走访</h2>
              <span className="text-xs text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">{pendingVisit.length} 家</span>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingVisit.map(a => {
                const gradeTag = GRADE_TAG_MAP[a.grade] ?? 'tag-gray';
                const gradeLabel = GRADE_STYLES[a.grade]?.label ?? a.grade;
                return (
                  <div key={a.id} className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 border",
                        a.grade === 'A' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        a.grade === 'B' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      )}>{a.grade}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-900">{a.enterprise_name}</span>
                          <span className={cn('tag pill', gradeTag)}>{gradeLabel}</span>
                          <span className="text-xs text-slate-400 font-mono">{a.grade_score}分</span>
                        </div>
                        <div className="text-xs text-slate-500">{a.policy_type}</div>
                        {/* AI 准备状态 */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="h-3 w-3" /> 背调已就绪
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">
                            <Bot className="h-3 w-3" /> 走访话术已生成
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                            <Shield className="h-3 w-3" /> 政策必问已配置
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button className="btn btn-primary btn-sm"
                          onClick={() => router.push(`/visit/${a.enterprise_id}?from=policy&policy=高新技术企业认定`)}>
                          <Briefcase className="h-3 w-3" /> 去走访
                        </button>
                        <button className="btn btn-default btn-sm text-xs"
                          onClick={() => router.push(`/policy/screening/${a.id}`)}>
                          查看筛选
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ 已走访·等待回复 ═══ */}
        {visited.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-900">已走访 · 等待回复</h2>
              <span className="text-xs text-slate-400">{visited.length} 家</span>
            </div>
            <div className="divide-y divide-slate-100">
              {visited.map(a => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className="p-1.5 rounded-full bg-blue-50 text-blue-500"><CheckCircle2 className="h-3.5 w-3.5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{a.enterprise_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">已走访触达，等待企业反馈意愿</div>
                  </div>
                  <button className="text-[10px] text-[#3370FF] hover:underline"
                    onClick={() => sendChat(`请跟进「${a.enterprise_name}」的走访结果，帮我起草一封跟进邮件。`)}>
                    <Bot className="h-3 w-3 inline" /> AI 跟进
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 有意愿·待诊断 ═══ */}
        {willing.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900">有意愿 · 进入诊断</h2>
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <Bot className="h-3 w-3" /> AI 诊断已就绪
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {willing.map(a => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/policy/diagnosis/${a.id}`)}>
                  <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-500"><Shield className="h-3.5 w-3.5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{a.enterprise_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">企业有意愿，AI 诊断报告已生成</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100">有意愿</span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {myTasks.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
            <Briefcase className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-1">暂无分配给你的任务</p>
            <p className="text-xs text-slate-400">管理者会通过管理看板将新的企业任务分配给你</p>
          </div>
        )}
      </div>
    </div>
  );
}
