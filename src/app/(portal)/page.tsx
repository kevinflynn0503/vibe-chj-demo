/**
 * 首页 — 员工今日工作台
 * 
 * 视觉：白底 + 彩色统计卡片 + 场景顶部色条 + section 蓝色竖条
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  Briefcase, Shield, Rocket, Building2,
  AlertCircle, FileText,
  Bot, Calendar, Target, Clock, MessageSquare,
  Star, Zap, ArrowUpRight,
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
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

  // 今日重点
  const todayFocus = [
    {
      priority: 'urgent' as const,
      title: '14:00 走访蔚来汽车',
      detail: '背调已就绪 · 沟通话术已生成 · 3 个必问问题',
      action: () => router.push('/visit/ent-002'),
      icon: Calendar,
    },
    {
      priority: 'high' as const,
      title: `${pendingVisits.length} 家企业待走访触达`,
      detail: '政策服务分配的高新认定企业',
      action: () => router.push('/policy'),
      icon: Target,
    },
    {
      priority: 'medium' as const,
      title: `${records.filter(r => !r.is_confirmed).length} 条走访记录待确认`,
      detail: 'AI 已提取关键信息，需你确认',
      action: () => router.push('/visit'),
      icon: FileText,
    },
  ];

  const priorityConfig = {
    urgent: { label: '紧急', color: 'text-red-600', tagBg: 'bg-red-50', iconBg: 'bg-red-50 text-red-500' },
    high: { label: '重要', color: 'text-amber-600', tagBg: 'bg-amber-50', iconBg: 'bg-amber-50 text-amber-500' },
    medium: { label: '常规', color: 'text-slate-500', tagBg: 'bg-slate-50', iconBg: 'bg-blue-50 text-[#3370FF]' },
  };

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
    },
    {
      icon: FileText,
      iconColor: 'text-amber-500 bg-amber-50',
      title: 'AI 提取了走访记录（强生医疗）',
      detail: '3 条关键发现 · 2 条诉求',
      time: '30分钟前',
      action: () => router.push(`/visit/confirm/${records[0]?.id || 'rec-001'}`),
      actionLabel: '确认',
    },
    {
      icon: Target,
      iconColor: 'text-violet-500 bg-violet-50',
      title: 'AI 推荐了匹配：芯视科技 ↔ 蔚来',
      detail: '匹配度 95% · 传感器供应链',
      time: '1小时前',
      action: () => router.push('/incubator/match'),
      actionLabel: '查看',
    },
    {
      icon: Shield,
      iconColor: 'text-emerald-500 bg-emerald-50',
      title: 'AI 完成新一轮政策筛选',
      detail: '12 家 A 级 · 45 家 B 级',
      time: '2小时前',
      action: () => router.push('/policy/screening'),
      actionLabel: '查看',
    },
    {
      icon: AlertCircle,
      iconColor: 'text-red-500 bg-red-50',
      title: '芯视科技活跃度异常下降',
      detail: 'AI 检测到连续2周活跃度下降，建议介入',
      time: '3小时前',
      action: () => router.push('/incubator/alerts'),
      actionLabel: '查看',
    },
  ];

  // 场景入口
  const scenarios = [
    {
      title: '客户拜访',
      desc: '走访全流程管理',
      icon: Briefcase,
      href: '/visit',
      stat: visitStats.pending_confirmations,
      statLabel: '待确认',
      accentColor: '#3370FF',
    },
    {
      title: '政策服务',
      desc: 'AI 筛选 + 触达',
      icon: Shield,
      href: '/policy',
      stat: myTasks.length,
      statLabel: '分配给我',
      accentColor: '#10B981',
    },
    {
      title: '孵化管理',
      desc: '企业运营监控',
      icon: Rocket,
      href: '/incubator',
      stat: incubatorStats.pending_orders,
      statLabel: '待匹配',
      accentColor: '#8B5CF6',
    },
    {
      title: '企业库',
      desc: '园区企业画像',
      icon: Building2,
      href: '/enterprises',
      stat: '326',
      statLabel: '园区企业',
      accentColor: '#F59E0B',
    },
  ];

  // 统计卡片配色 — 每张卡片有自己的底色
  const statCards = [
    { label: '待处理', value: aiActivities.length, icon: Clock, color: 'text-[#3370FF]', bg: 'bg-blue-50/80', iconBg: 'bg-blue-100/60' },
    { label: '本月走访', value: records.length, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50/80', iconBg: 'bg-emerald-100/60' },
    { label: '政策任务', value: myTasks.length, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50/80', iconBg: 'bg-amber-100/60' },
    { label: '需求跟进', value: demands.filter(d => d.status === 'pending').length, icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-50/80', iconBg: 'bg-violet-100/60' },
  ];

  return (
    <div className="min-h-full">
      <div className="page-container space-y-4">

        {/* ═══ 头部问候 ═══ */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-base font-bold text-slate-900">{greeting}，薛坤</h1>
            <p className="text-xs text-slate-400 mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#3370FF]" />
              <strong className="text-slate-800">{pendingVisits.length}</strong> 走访任务
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-amber-500" />
              <strong className="text-slate-800">{records.filter(r => !r.is_confirmed).length}</strong> 待确认
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-violet-500" />
              <strong className="text-slate-800">{demands.filter(d => d.status === 'pending').length}</strong> 需求跟进
            </span>
          </div>
        </div>

        {/* ═══ 统计卡片 — 彩色底色 ═══ */}
        <div className="grid grid-cols-4 gap-3">
          {statCards.map((s, i) => (
            <div key={i} className={cn("rounded-[10px] p-3.5 flex items-center gap-3 border border-transparent", s.bg)}>
              <div className={cn("p-2 rounded-lg shrink-0", s.iconBg)}>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
              <div>
                <div className={cn("text-xl font-bold font-mono", s.color)}>{s.value}</div>
                <div className="text-xs text-slate-600">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ 今日重点 ═══ */}
        <div>
          <div className="section-title mb-3">
            <Star className="h-4 w-4 text-amber-400" />
            今日重点
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {todayFocus.map((item, i) => {
              const config = priorityConfig[item.priority];
              return (
                <div key={i}
                  className="bg-white border border-slate-200 rounded-[10px] p-4 cursor-pointer transition-all group hover:shadow-md"
                  onClick={item.action}>
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg shrink-0", config.iconBg)}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", config.color, config.tagBg)}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mb-1 leading-snug">{item.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.detail}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-300 shrink-0 mt-1 group-hover:text-slate-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ 场景入口 ═══ */}
        <div>
          <div className="section-title mb-3">
            场景入口
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {scenarios.map(s => (
              <div key={s.title}
                className="group bg-white border border-slate-200 rounded-[10px] p-4 cursor-pointer hover:shadow-md transition-all"
                onClick={() => router.push(s.href)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ background: `${s.accentColor}12` }}>
                    <s.icon className="h-4 w-4" style={{ color: s.accentColor }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#3370FF] transition-colors">{s.title}</h3>
                    <p className="text-[10px] text-slate-400">{s.desc}</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 pt-3 border-t border-slate-100">
                  <span className="text-xl font-bold font-mono" style={{ color: s.accentColor }}>{s.stat}</span>
                  <span className="text-xs text-slate-500">{s.statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ AI 动态 ═══ */}
        <div>
          <div className="section-title mb-3">
            <Zap className="h-4 w-4 text-[#3370FF]" />
            AI 动态
            <span className="text-xs text-slate-400 font-normal ml-1">{aiActivities.length} 条新消息</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-[10px] overflow-hidden">
            <div className="divide-y divide-slate-100">
              {aiActivities.map((item, i) => (
                <div key={i} className="px-4 py-3.5 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", item.iconColor)}>
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-900">{item.title}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                    <button onClick={item.action} className="btn btn-default btn-sm text-[11px]">{item.actionLabel}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
