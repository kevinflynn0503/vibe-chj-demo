/**
 * 政策服务工作台 — 员工视图
 * 
 * 去掉 PM 工作量（移至管理者看板）
 * 聚焦：我的任务 → AI 产出待审 → 工作流
 * 
 * 布局：
 * - 我的任务概览（个人统计）
 * - 待我处理（AI 产出等我审核）
 * - 工作流水线（简化版，只看我相关的进度）
 * - 最近进展
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  ChevronRight, AlertCircle, TrendingUp, CheckCircle2,
  ListFilter, Send, FileText, ArrowRight, Users, Sparkles, Bot,
  Target, Clock, Shield, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPolicyStats, getAssessments, getPMProgress } from '@/lib/mock-data';
import { startScreening, dispatchTasks, sendChat } from '@/lib/host-api';

export default function PolicyPage() {
  const router = useRouter();
  const stats = getPolicyStats();
  const assessments = getAssessments();

  // 我的任务（模拟当前用户是"薛坤"）
  const myAssigned = assessments.filter(a => a.assigned_to === '薛坤');
  const myVisited = myAssigned.filter(a => a.touch_status === 'visited' || a.touch_status === 'willing');
  const myWilling = myAssigned.filter(a => a.touch_status === 'willing');
  const myPending = myAssigned.filter(a => a.touch_status === 'pending' || a.touch_status === 'assigned');

  // 我的工作流水线
  const myPipeline = [
    { label: '分配给我', value: myAssigned.length, color: 'text-slate-900', href: '/policy/tasks' },
    { label: '待触达', value: myPending.length, color: myPending.length > 0 ? 'text-amber-600' : 'text-slate-400', href: '/policy/tasks' },
    { label: '已走访', value: myVisited.length, color: 'text-[#3370FF]', href: '/policy/tasks' },
    { label: '有意愿', value: myWilling.length, color: 'text-emerald-600', href: '/policy/tasks' },
  ];

  // 待我处理 — AI 产出 + 待办
  const pendingItems = [
    ...(myPending.length > 0 ? [{
      icon: Target,
      title: `${myPending.length} 家企业待触达`,
      desc: 'AI 已筛选并分配给你，需安排走访了解申报意愿',
      action: () => router.push('/policy/tasks'),
      actionLabel: '查看任务',
      badge: 'AI 已分配',
      priority: 'high' as const,
    }] : []),
    ...(myWilling.length > 0 ? [{
      icon: FileText,
      title: `${myWilling.length} 家有意愿企业待诊断`,
      desc: '企业确认申报意愿，需进行申报条件诊断',
      action: () => {
        const willing = assessments.find(a => a.touch_status === 'willing' && a.assigned_to === '薛坤');
        router.push(willing ? `/policy/diagnosis/${willing.id}` : '/policy/tasks');
      },
      actionLabel: '开始诊断',
      badge: null,
      priority: 'high' as const,
    }] : []),
    {
      icon: Eye,
      title: 'AI 完成新一轮初筛，12 家 A 级',
      desc: 'AI 已对 17,000 家企业完成高新认定条件评估',
      action: () => router.push('/policy/screening'),
      actionLabel: '查看筛选结果',
      badge: 'AI 已完成',
      priority: 'medium' as const,
    },
    {
      icon: Shield,
      title: 'AI 建议分配方案已生成',
      desc: '根据 PM 专长和工作量，AI 生成了触达任务分配建议',
      action: () => dispatchTasks('A', stats.grade_a),
      actionLabel: '确认分发',
      badge: 'AI 建议',
      priority: 'medium' as const,
    },
  ];

  // 最近进展
  const recentActivity = [
    { icon: CheckCircle2, text: '你完成了「强生医疗」走访触达', time: '10分钟前', type: 'success' as const },
    { icon: Bot, text: 'AI 完成新一轮高新初筛，A级12家', time: '2小时前', type: 'info' as const },
    { icon: TrendingUp, text: '你反馈「芯视科技」有申报意愿', time: '昨天', type: 'success' as const },
    { icon: AlertCircle, text: '「蔚来汽车」缺少研发费用占比数据', time: '昨天', type: 'warning' as const },
  ];

  const typeColor = {
    success: 'bg-emerald-50 text-emerald-600',
    info: 'bg-blue-50 text-blue-600',
    warning: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">政策服务</h1>
            <p className="text-xs text-slate-500 mt-0.5">高新技术企业认定 · 我的任务进度</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-default btn-sm" onClick={() => router.push('/policy/tasks')}>
              <FileText className="h-3.5 w-3.5" /> 全部任务
            </button>
            <button className="btn btn-default btn-sm" onClick={() => router.push('/policy/screening')}>
              <Eye className="h-3.5 w-3.5" /> 筛选结果
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => startScreening()}>
              <Sparkles className="h-3.5 w-3.5" /> AI 智能筛选
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* ── 我的任务概览 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {myPipeline.map((item, i) => (
            <div key={i}
              className="bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-[#3370FF] transition-colors"
              onClick={() => item.href && router.push(item.href)}>
              <div className="text-xs text-slate-500 mb-1">{item.label}</div>
              <div className={cn("text-2xl font-bold font-mono", item.color)}>{item.value}</div>
              {i === 0 && (
                <div className="text-[10px] text-slate-400 mt-1">
                  转化率 {myAssigned.length > 0 ? Math.round((myWilling.length / myAssigned.length) * 100) : 0}%
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── 待我处理 ── */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">待我处理</h2>
              <span className="text-xs text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">{pendingItems.length} 项</span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingItems.map((item, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                <div className={cn(
                  "p-1.5 rounded-full shrink-0 mt-0.5",
                  item.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#3370FF]'
                )}>
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                    {item.badge && (
                      <span className="flex items-center gap-0.5 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">
                        <Bot className="h-3 w-3" /> {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                </div>
                <button onClick={item.action}
                  className="btn btn-default btn-sm shrink-0 mt-0.5">
                  {item.actionLabel} <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── 全局筛选流水线（简化版，只读） ── */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">全局转化进度</h2>
              <span className="flex items-center gap-1 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">
                <Bot className="h-3 w-3" /> AI 驱动
              </span>
            </div>
            <button className="text-[10px] text-[#3370FF] hover:underline"
              onClick={() => router.push('/dashboard')}>
              查看管理看板 →
            </button>
          </div>
          <div className="flex items-center justify-between px-2">
            {[
              { label: '全部企业', value: '17K' },
              { label: '已筛选', value: stats.total_screened },
              { label: '已触达', value: stats.touch_visited },
              { label: '有意愿', value: stats.touch_willing },
              { label: '已获批', value: stats.approved },
            ].map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="text-center">
                  <div className="text-lg font-bold font-mono text-slate-700">{s.value}</div>
                  <div className="text-[10px] text-slate-400">{s.label}</div>
                </div>
                {i < 4 && <ArrowRight className="h-3 w-3 text-slate-300 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* ── 最近进展 ── */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">我的最近进展</h2>
            <button className="text-xs text-[#3370FF] hover:underline">查看全部</button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((a, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className={cn("p-1.5 rounded-full shrink-0", typeColor[a.type])}>
                  <a.icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0"><p className="text-sm text-slate-700 truncate">{a.text}</p></div>
                <div className="text-xs text-slate-400 font-mono whitespace-nowrap">{a.time}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
