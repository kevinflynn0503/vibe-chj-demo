/**
 * 首页 — 员工收件箱
 * 
 * 去掉全局 KPI（移至管理者看板 /dashboard）
 * 聚焦：AI 产出待审 → 我的待办 → 日程提醒 → 个人统计
 * 
 * 设计理念：
 * - 不是"我去找任务"，而是"AI 做完的事情推到我面前"
 * - 按时间倒序排列，最新的 AI 产出在最上面
 * - 底部三个个人统计卡片
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  Briefcase, Shield, Rocket, Building2,
  ArrowRight, Activity, TrendingUp, TrendingDown,
  CheckCircle2, AlertCircle, FileText, Zap, ChevronRight,
  Bot, Sparkles, Calendar, Target, Clock, Eye, MessageSquare
} from 'lucide-react';
import { getStats, getPolicyStats, getIncubatorStats, getVisitRecords, getDemands } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const visitStats = getStats();
  const policyStats = getPolicyStats();
  const incubatorStats = getIncubatorStats();
  const records = getVisitRecords();
  const demands = getDemands();

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  // 我的待处理队列（按时间倒序）
  const inboxItems = [
    {
      id: 'ai-report',
      icon: Bot,
      iconColor: 'bg-blue-50 text-[#3370FF]',
      title: 'AI 生成了「蔚来汽车」背调报告',
      desc: '8 章节 · 5 必问问题 · 置信度 85%',
      time: '2分钟前',
      action: () => router.push('/enterprises/ent-002/report'),
      actionLabel: '查看并审核',
      badge: 'AI 已完成',
    },
    {
      id: 'ai-extract',
      icon: FileText,
      iconColor: 'bg-amber-50 text-amber-500',
      title: 'AI 提取了走访记录（强生医疗）',
      desc: '3 条关键发现 · 2 条诉求',
      time: '30分钟前',
      action: () => router.push(`/visit/confirm/${records[0]?.id || 'rec-001'}`),
      actionLabel: '确认记录',
      badge: 'AI 提取',
    },
    {
      id: 'ai-match',
      icon: Target,
      iconColor: 'bg-violet-50 text-violet-500',
      title: 'AI 推荐了匹配：芯视科技 ↔ 蔚来',
      desc: '匹配度 95% · 传感器供应链',
      time: '1小时前',
      action: () => router.push('/incubator/match'),
      actionLabel: '审核推荐',
      badge: 'AI 推荐',
    },
    {
      id: 'schedule',
      icon: Calendar,
      iconColor: 'bg-emerald-50 text-emerald-500',
      title: '明天 14:00 走访蔚来汽车',
      desc: '背调已就绪 ✓ · 沟通清单已生成 ✓',
      time: '日程',
      action: () => router.push('/visit/ent-002'),
      actionLabel: '查看准备',
      badge: null,
    },
    {
      id: 'ai-screen',
      icon: Shield,
      iconColor: 'bg-blue-50 text-[#3370FF]',
      title: 'AI 完成新一轮政策筛选',
      desc: '12 家 A 级 · 45 家 B 级 · 269 家 C 级',
      time: '2小时前',
      action: () => router.push('/policy/screening'),
      actionLabel: '查看结果',
      badge: 'AI 已完成',
    },
    {
      id: 'ai-alert',
      icon: AlertCircle,
      iconColor: 'bg-red-50 text-red-500',
      title: '芯视科技活跃度异常下降',
      desc: 'AI 检测到连续2周活跃度下降，建议介入',
      time: '3小时前',
      action: () => router.push('/incubator/alerts'),
      actionLabel: '查看详情',
      badge: 'AI 预警',
    },
  ];

  // 我的统计
  const myStats = [
    {
      label: '待审核',
      value: 3,
      desc: 'AI 产出等你确认',
      color: 'text-amber-600',
      icon: Eye,
    },
    {
      label: '我的走访',
      value: `${records.filter(r => r.is_confirmed).length}/${records.length}`,
      desc: '已确认/总记录',
      color: 'text-[#3370FF]',
      icon: Briefcase,
    },
    {
      label: '需求跟进',
      value: demands.filter(d => d.status === 'pending').length,
      desc: '待处理需求',
      color: 'text-emerald-600',
      icon: MessageSquare,
    },
  ];

  // 场景快捷入口
  const quickLinks = [
    { title: '客户拜访', desc: '走访看板', icon: Briefcase, href: '/visit', count: visitStats.pending_confirmations, countLabel: '待确认' },
    { title: '政策服务', desc: '我的任务', icon: Shield, href: '/policy', count: policyStats.grade_a, countLabel: 'A级待触达' },
    { title: '孵化器', desc: '待处理', icon: Rocket, href: '/incubator', count: incubatorStats.pending_orders, countLabel: '待匹配' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">早上好，薛坤</h1>
            <p className="text-xs text-slate-500 mt-0.5">{today}</p>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            onClick={() => router.push('/dashboard')}
          >
            <Activity className="h-3.5 w-3.5 text-slate-400" />
            管理看板
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* ── 我的统计 ── */}
        <div className="grid grid-cols-3 gap-3">
          {myStats.map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">{s.label}</span>
                <s.icon className="h-3.5 w-3.5 text-slate-300" />
              </div>
              <div className={cn("text-xl sm:text-2xl font-bold font-mono", s.color)}>{s.value}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* ── 待处理队列（收件箱） ── */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">待处理</h2>
              <span className="text-xs text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">{inboxItems.length} 项</span>
            </div>
            <span className="text-[10px] text-slate-400">按时间排序</span>
          </div>
          <div className="divide-y divide-slate-100">
            {inboxItems.map(item => (
              <div key={item.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                <div className={cn("p-1.5 rounded-full shrink-0 mt-0.5", item.iconColor)}>
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                    {item.badge && (
                      <span className="flex items-center gap-0.5 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">
                        <Bot className="h-3 w-3" /> {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{item.time}</span>
                  <button onClick={item.action}
                    className="btn btn-default btn-sm text-[11px]">
                    {item.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 场景快捷入口 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickLinks.map(s => (
            <div key={s.title}
              className="group bg-white border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-[#3370FF] transition-colors"
              onClick={() => router.push(s.href)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-600 group-hover:bg-blue-50 group-hover:text-[#3370FF] transition-colors">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                    <p className="text-[10px] text-slate-500">{s.desc}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#3370FF]" />
              </div>
              {s.count > 0 && (
                <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-lg font-bold text-[#3370FF] font-mono">{s.count}</span>
                  <span className="text-xs text-slate-500">{s.countLabel}</span>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
