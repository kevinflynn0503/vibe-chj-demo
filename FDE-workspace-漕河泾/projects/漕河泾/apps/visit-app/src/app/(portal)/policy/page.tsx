/**
 * 政策服务 — 员工工作台（一页展示全部）
 * 
 * 不再有单独的触达任务页，所有我的任务直接在此展示
 * 按状态分组：待走访 → 已走访等待 → 有意愿待诊断
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  ChevronRight, Sparkles, Bot,
  Target, Clock, Shield, Briefcase, CheckCircle2,
  AlertCircle, FileText, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssessments } from '@/lib/mock-data';
import { sendChat, startScreening } from '@/lib/host-api';

export default function PolicyPage() {
  const router = useRouter();
  const assessments = getAssessments();

  // 我的任务（当前用户：薛坤）
  const myTasks = assessments.filter(a => a.assigned_to === '薛坤');
  const pendingVisit = myTasks.filter(a => a.touch_status === 'pending' || a.touch_status === 'assigned');
  const visited = myTasks.filter(a => a.touch_status === 'visited');
  const willing = myTasks.filter(a => a.touch_status === 'willing');

  const GRADE_COLORS: Record<string, string> = {
    A: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    B: 'bg-blue-50 text-blue-600 border-blue-100',
    C: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">政策服务</h1>
            <p className="text-xs text-slate-500 mt-0.5">高新技术企业认定 · 我的工作台 · {myTasks.length} 家企业</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => startScreening()}>
            <Sparkles className="h-3.5 w-3.5" /> 发起 AI 筛选
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* 我的概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">分配给我</span>
              <Briefcase className="h-3.5 w-3.5 text-slate-300" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">{myTasks.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">待走访</span>
              <Target className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className={cn("text-2xl font-bold font-mono", pendingVisit.length > 0 ? 'text-amber-600' : 'text-slate-300')}>{pendingVisit.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">有意愿</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600">{willing.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">转化率</span>
              <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#3370FF]">
              {myTasks.length > 0 ? Math.round((willing.length / myTasks.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* ═══ 待走访 ═══ */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">待走访</h2>
              {pendingVisit.length > 0 && <span className="text-xs text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">{pendingVisit.length}</span>}
            </div>
            {pendingVisit.length > 0 && (
              <button className="text-xs text-[#3370FF] hover:underline flex items-center gap-1"
                onClick={() => sendChat('请为我今天要走访的企业批量生成走访话术和政策必问问题。')}>
                <Sparkles className="h-3 w-3" /> AI 批量准备
              </button>
            )}
          </div>
          {pendingVisit.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {pendingVisit.map(a => (
                <div key={a.id} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 border",
                      GRADE_COLORS[a.grade] || 'bg-slate-50 text-slate-400 border-slate-100'
                    )}>{a.grade}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900">{a.enterprise_name}</span>
                        <span className="text-xs text-slate-400 font-mono">{a.grade_score}分</span>
                      </div>
                      <div className="text-xs text-slate-500">{a.policy_type}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="h-3 w-3" /> 背调就绪
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">
                          <Bot className="h-3 w-3" /> 话术已生成
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                          <Shield className="h-3 w-3" /> 政策必问
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
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-xs text-slate-400">暂无待走访任务</div>
          )}
        </div>

        {/* ═══ 已走访·等待回复 ═══ */}
        {visited.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-900">已走访 · 等待回复</h2>
              <span className="text-xs text-slate-400">{visited.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {visited.map(a => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border",
                    GRADE_COLORS[a.grade] || 'bg-slate-50 text-slate-400 border-slate-100'
                  )}>{a.grade}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{a.enterprise_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">已走访触达，等待企业反馈意愿</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="text-[10px] text-[#3370FF] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-100"
                      onClick={() => sendChat(`请帮我起草一封「${a.enterprise_name}」的走访跟进邮件。`)}>
                      <Bot className="h-3 w-3 inline" /> AI 跟进
                    </button>
                    <button className="text-[10px] text-slate-500 hover:text-[#3370FF]"
                      onClick={() => router.push(`/policy/screening/${a.id}`)}>
                      详情
                    </button>
                  </div>
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
              <h2 className="text-sm font-bold text-slate-900">有意愿 · 待诊断审核</h2>
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <Bot className="h-3 w-3" /> AI 已生成
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {willing.map(a => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/policy/diagnosis/${a.id}`)}>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border",
                    GRADE_COLORS[a.grade] || 'bg-slate-50 text-slate-400 border-slate-100'
                  )}>{a.grade}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{a.enterprise_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{a.policy_type} · AI 诊断报告已就绪</div>
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
