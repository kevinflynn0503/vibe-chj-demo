/**
 * 统一首页 — 漕河泾智能驾驶舱
 * 
 * 统一规范：
 * - 头部：bg-white border-b, max-w-[1200px] px-4 sm:px-6 py-4
 * - 内容：max-w-[1200px] p-4 sm:p-6 space-y-6
 * - 卡片：bg-white border border-slate-200 rounded-lg, 无 shadow
 * - 品牌色：#3370FF
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  Briefcase, Shield, Rocket, Building2,
  ArrowRight, Activity, TrendingUp, TrendingDown,
  CheckCircle2, AlertCircle, FileText, Zap, ChevronRight
} from 'lucide-react';
import { getStats, getPolicyStats, getIncubatorStats, getEnterprises } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const visitStats = getStats();
  const policyStats = getPolicyStats();
  const incubatorStats = getIncubatorStats();
  const enterprises = getEnterprises();

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const kpis = [
    { label: '园区企业总数', value: enterprises.length.toLocaleString(), change: '+2.3%', trend: 'up', icon: Building2 },
    { label: '本月走访', value: visitStats.total_visits, change: '+12.5%', trend: 'up', icon: Briefcase },
    { label: '政策覆盖', value: policyStats.total_screened, change: '+8.7%', trend: 'up', icon: Shield },
    { label: '在孵活跃', value: '78%', change: '-2.1%', trend: 'down', icon: Rocket },
  ];

  const scenarios = [
    {
      id: 'visit', title: '客户拜访', desc: '走访准备 · 记录提取 · 需求闭环',
      icon: Briefcase, href: '/visit',
      stats: [
        { label: '待确认', value: visitStats.pending_confirmations, highlight: true },
        { label: '待处理', value: visitStats.pending_demands, highlight: true },
        { label: '累计', value: visitStats.total_visits },
      ],
    },
    {
      id: 'policy', title: '政策服务', desc: '企业筛选 · 分级触达 · 申报诊断',
      icon: Shield, href: '/policy',
      stats: [
        { label: 'A级', value: policyStats.grade_a },
        { label: '有意愿', value: policyStats.touch_willing },
        { label: '已筛选', value: policyStats.total_screened },
      ],
    },
    {
      id: 'incubator', title: '孵化器', desc: '在孵运营 · 订单匹配 · 活跃监控',
      icon: Rocket, href: '/incubator',
      stats: [
        { label: '在孵', value: incubatorStats.total_enterprises },
        { label: '待匹配', value: incubatorStats.pending_orders, highlight: true },
        { label: '高活跃', value: incubatorStats.active_enterprises },
      ],
    },
  ];

  const activities = [
    { time: '10分钟前', content: '薛坤完成「强生医疗」走访触达', icon: CheckCircle2, type: 'success' },
    { time: '2小时前', content: '系统生成新一轮高新初筛报告', icon: FileText, type: 'info' },
    { time: '昨天', content: 'PM-A 反馈「芯视科技」有申报意愿', icon: TrendingUp, type: 'success' },
    { time: '昨天', content: '检测到「蔚来汽车」缺少研发费用数据', icon: AlertCircle, type: 'warning' },
    { time: '2天前', content: '「宇和科技」被匹配至仪电自动洗车项目', icon: Zap, type: 'info' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">漕河泾智能驾驶舱</h1>
            <p className="text-xs text-slate-500 mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            <Activity className="h-3.5 w-3.5" />
            <span className="text-xs font-medium hidden sm:inline">系统运行正常</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">
        {/* KPI - 移动端2列 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-500 mb-1">{kpi.label}</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">{kpi.value}</div>
                <div className={cn("text-xs font-medium mt-1.5 flex items-center gap-1", kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-500')}>
                  {kpi.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.change}
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded text-slate-400 hidden sm:block">
                <kpi.icon className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>

        {/* 场景入口 - 移动端堆叠 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {scenarios.map(s => (
            <div key={s.id}
              className="group bg-white border border-slate-200 rounded-lg p-4 sm:p-5 cursor-pointer hover:border-[#3370FF] transition-colors"
              onClick={() => router.push(s.href)}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600 group-hover:bg-blue-50 group-hover:text-[#3370FF] transition-colors">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">{s.title}</h2>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#3370FF] shrink-0" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                {s.stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className={cn("text-lg font-bold font-mono", stat.highlight && stat.value > 0 ? "text-[#3370FF]" : "text-slate-900")}>{stat.value}</div>
                    <div className="text-[10px] text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 动态 */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">实时动态</h3>
            <button className="text-xs text-[#3370FF] hover:underline">查看全部</button>
          </div>
          <div className="divide-y divide-slate-100">
            {activities.map((a, i) => (
              <div key={i} className="px-4 sm:px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className={cn("p-1.5 rounded-full shrink-0",
                  a.type === 'success' ? "bg-emerald-50 text-emerald-600" :
                  a.type === 'warning' ? "bg-amber-50 text-amber-600" :
                  "bg-blue-50 text-blue-600")}>
                  <a.icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{a.content}</p>
                </div>
                <div className="text-xs text-slate-400 font-mono whitespace-nowrap">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
