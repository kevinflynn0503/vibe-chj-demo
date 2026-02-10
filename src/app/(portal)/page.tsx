/**
 * 首页 — 员工今日工作台
 * 
 * 聚焦"今天要做什么"：
 * 1. 今日重点（AI 提炼的最重要事项）
 * 2. 我的待办（按优先级排列）
 * 3. AI 动态（AI 后台完成的事情）
 * 4. 场景入口
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  Briefcase, Shield, Rocket, Building2,
  ArrowRight, TrendingUp,
  CheckCircle2, AlertCircle, FileText, ChevronRight,
  Bot, Sparkles, Calendar, Target, Clock, Eye, MessageSquare,
  Star, Zap, Phone
} from 'lucide-react';
import { getStats, getPolicyStats, getIncubatorStats, getVisitRecords, getDemands, getAssessments } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const visitStats = getStats();
  const policyStats = getPolicyStats();
  const incubatorStats = getIncubatorStats();
  const records = getVisitRecords();
  const demands = getDemands();
  const assessments = getAssessments();

  const myTasks = assessments.filter(a => a.assigned_to === '薛坤');
  const pendingVisits = myTasks.filter(a => a.touch_status === 'pending' || a.touch_status === 'assigned');

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  // 今日重点
  const todayFocus = [
    {
      priority: 'urgent',
      title: '14:00 走访蔚来汽车',
      detail: '背调已就绪 · 沟通话术已生成 · 3 个必问问题',
      action: () => router.push('/visit/ent-002'),
      actionLabel: '查看准备',
      icon: Calendar,
    },
    {
      priority: 'high',
      title: `${pendingVisits.length} 家企业待走访触达`,
      detail: '政策服务分配的高新认定企业',
      action: () => router.push('/policy'),
      actionLabel: '去处理',
      icon: Target,
    },
    {
      priority: 'medium',
      title: `${records.filter(r => !r.is_confirmed).length} 条走访记录待确认`,
      detail: 'AI 已提取关键信息，需你确认',
      action: () => router.push('/visit'),
      actionLabel: '去确认',
      icon: FileText,
    },
  ];

  // AI 后台动态
  const aiActivities = [
    {
      icon: Bot,
      iconColor: 'text-[#3370FF] bg-blue-50',
      title: 'AI 生成了「蔚来汽车」背调报告',
      detail: '8 章节 · 5 必问问题 · 置信度 85%',
      time: '2分钟前',
      action: () => router.push('/enterprises/ent-002/report'),
      actionLabel: '审核',
      badge: '✦ AI 完成',
    },
    {
      icon: FileText,
      iconColor: 'text-amber-500 bg-amber-50',
      title: 'AI 提取了走访记录（强生医疗）',
      detail: '3 条关键发现 · 2 条诉求',
      time: '30分钟前',
      action: () => router.push(`/visit/confirm/${records[0]?.id || 'rec-001'}`),
      actionLabel: '确认',
      badge: '✦ AI 提取',
    },
    {
      icon: Target,
      iconColor: 'text-violet-500 bg-violet-50',
      title: 'AI 推荐了匹配：芯视科技 ↔ 蔚来',
      detail: '匹配度 95% · 传感器供应链',
      time: '1小时前',
      action: () => router.push('/incubator/match'),
      actionLabel: '查看',
      badge: '✦ AI 推荐',
    },
    {
      icon: Shield,
      iconColor: 'text-emerald-500 bg-emerald-50',
      title: 'AI 完成新一轮政策筛选',
      detail: '12 家 A 级 · 45 家 B 级',
      time: '2小时前',
      action: () => router.push('/policy/screening'),
      actionLabel: '查看',
      badge: '✦ AI 完成',
    },
    {
      icon: AlertCircle,
      iconColor: 'text-red-500 bg-red-50',
      title: '芯视科技活跃度异常下降',
      detail: 'AI 检测到连续2周活跃度下降，建议介入',
      time: '3小时前',
      action: () => router.push('/incubator/alerts'),
      actionLabel: '查看',
      badge: '✦ AI 预警',
    },
  ];

  // 场景入口
  const scenarios = [
    {
      title: '客户拜访',
      desc: '走访看板',
      icon: Briefcase,
      href: '/visit',
      stat: visitStats.pending_confirmations,
      statLabel: '待确认',
      statColor: 'text-amber-600',
    },
    {
      title: '政策服务',
      desc: '我的任务',
      icon: Shield,
      href: '/policy',
      stat: myTasks.length,
      statLabel: '分配给我',
      statColor: 'text-[#3370FF]',
    },
    {
      title: '孵化器',
      desc: '企业运营',
      icon: Rocket,
      href: '/incubator',
      stat: incubatorStats.pending_orders,
      statLabel: '待匹配',
      statColor: 'text-violet-600',
    },
    {
      title: '企业库',
      desc: '园区企业',
      icon: Building2,
      href: '/enterprises',
      stat: '326',
      statLabel: '园区企业',
      statColor: 'text-slate-700',
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 — 渐变头图 */}
      <div className="bg-gradient-to-br from-[#3370FF] via-[#4B83FF] to-[#6B9AFF] text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 pb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-xs mb-1">{today}</p>
              <h1 className="text-2xl font-bold">{greeting}，薛坤</h1>
              <p className="text-blue-100 text-sm mt-2">今天有 <span className="text-white font-bold">{pendingVisits.length}</span> 个走访任务 · <span className="text-white font-bold">{records.filter(r => !r.is_confirmed).length}</span> 条记录待确认</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
                <Bot className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">AI 助手就绪</span>
              </div>
            </div>
          </div>

          {/* 嵌入头图的快捷统计 */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label: '待处理', value: aiActivities.length, icon: Clock, bg: 'bg-white/15' },
              { label: '本月走访', value: records.length, icon: Briefcase, bg: 'bg-white/15' },
              { label: '政策任务', value: myTasks.length, icon: Shield, bg: 'bg-white/15' },
              { label: '需求跟进', value: demands.filter(d => d.status === 'pending').length, icon: MessageSquare, bg: 'bg-white/15' },
            ].map((s, i) => (
              <div key={i} className={cn("rounded-lg p-3 backdrop-blur-sm border border-white/10", s.bg)}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-blue-100">{s.label}</span>
                  <s.icon className="h-3.5 w-3.5 text-blue-200" />
                </div>
                <div className="text-xl font-bold font-mono">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* ═══ 今日重点 ═══ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-900">今日重点</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {todayFocus.map((item, i) => (
              <div key={i} className={cn(
                "bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm",
                item.priority === 'urgent' ? 'border-red-200 hover:border-red-300' :
                item.priority === 'high' ? 'border-amber-200 hover:border-amber-300' :
                'border-slate-200 hover:border-[#3370FF]'
              )} onClick={item.action}>
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg shrink-0",
                    item.priority === 'urgent' ? 'bg-red-50 text-red-500' :
                    item.priority === 'high' ? 'bg-amber-50 text-amber-500' :
                    'bg-blue-50 text-[#3370FF]'
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium",
                        item.priority === 'urgent' ? 'bg-red-50 text-red-600' :
                        item.priority === 'high' ? 'bg-amber-50 text-amber-600' :
                        'bg-blue-50 text-blue-600'
                      )}>
                        {item.priority === 'urgent' ? '紧急' : item.priority === 'high' ? '重要' : '常规'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.detail}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 场景入口 ═══ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {scenarios.map(s => (
            <div key={s.title}
              className="group bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-[#3370FF] transition-colors"
              onClick={() => router.push(s.href)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:bg-blue-50 group-hover:text-[#3370FF] transition-colors">
                  <s.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                  <p className="text-[10px] text-slate-400">{s.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <span className={cn("text-lg font-bold font-mono", s.statColor)}>{s.stat}</span>
                <span className="text-xs text-slate-500">{s.statLabel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ AI 动态 ═══ */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#3370FF]" />
              <h2 className="text-sm font-bold text-slate-900">AI 动态</h2>
              <span className="text-xs text-slate-400">{aiActivities.length} 条新消息</span>
            </div>
            <span className="text-[10px] text-slate-400">AI 在后台为你完成的工作</span>
          </div>
          <div className="divide-y divide-slate-100">
            {aiActivities.map((item, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                <div className={cn("p-1.5 rounded-full shrink-0 mt-0.5", item.iconColor)}>
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-900">{item.title}</span>
                    <span className="text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{item.badge}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                  <button onClick={item.action} className="btn btn-default btn-sm text-[11px]">{item.actionLabel}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部留白 */}
        <div className="h-4" />
      </div>
    </div>
  );
}
