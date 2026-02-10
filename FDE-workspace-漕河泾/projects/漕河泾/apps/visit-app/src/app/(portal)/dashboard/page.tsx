/**
 * 管理者看板 — 老板视图
 * 
 * 集中展示全局管理指标，与员工工作台完全分离
 * 目标用户：卫玥玥（高管）、薛科总（中层）、赵婧总（孵化器管理）
 * 
 * 内容：
 * 1. 全局 KPI（园区总量 / 走访完成 / 政策覆盖 / 在孵活跃）
 * 2. 政策转化漏斗（全局视角）
 * 3. 团队效率对比（PM 工作量 / 走访进度）
 * 4. AI 工作报告
 * 5. 需要关注的事项
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  Building2, Briefcase, Shield, Rocket, TrendingUp, TrendingDown,
  Users, Activity, ArrowRight, AlertTriangle, CheckCircle2, Bot,
  Sparkles, FileText, Target, BarChart3, ChevronRight, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getStats, getPolicyStats, getIncubatorStats, getEnterprises,
  getPMProgress, getActivityReports
} from '@/lib/mock-data';

export default function DashboardPage() {
  const router = useRouter();
  const visitStats = getStats();
  const policyStats = getPolicyStats();
  const incubatorStats = getIncubatorStats();
  const enterprises = getEnterprises();
  const pmProgress = getPMProgress();
  const activityReports = getActivityReports();

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const alerts = activityReports.filter(r => r.trend === 'down');

  // 全局 KPI
  const kpis = [
    { label: '园区企业总数', value: enterprises.length.toLocaleString(), change: '+2.3%', trend: 'up' as const, icon: Building2, color: 'text-slate-900' },
    { label: '本月走访完成', value: visitStats.total_visits, change: '+12.5%', trend: 'up' as const, icon: Briefcase, color: 'text-[#3370FF]' },
    { label: '政策已筛选', value: policyStats.total_screened, change: '+8.7%', trend: 'up' as const, icon: Shield, color: 'text-emerald-600' },
    { label: '在孵活跃率', value: `${Math.round((incubatorStats.active_enterprises / incubatorStats.total_enterprises) * 100)}%`, change: '-2.1%', trend: 'down' as const, icon: Rocket, color: 'text-amber-600' },
  ];

  // 政策漏斗
  const pipeline = [
    { label: '全部企业', value: '17,000', sub: '园区总量' },
    { label: '已筛选', value: policyStats.total_screened, sub: `A${policyStats.grade_a} / B${policyStats.grade_b} / C${policyStats.grade_c}` },
    { label: '已触达', value: policyStats.touch_visited, sub: `已分发 ${policyStats.touch_assigned}` },
    { label: '有意愿', value: policyStats.touch_willing, sub: '确认申报' },
    { label: '已获批', value: policyStats.approved, sub: '审批通过' },
  ];

  // AI 今日工作
  const aiWorkReport = {
    total: 12,
    pendingReview: 5,
    rejectRate: '8%',
    details: [
      { type: '背调报告', count: 3, icon: FileText },
      { type: '政策筛选', count: 1, icon: Shield },
      { type: '订单匹配', count: 2, icon: Target },
      { type: '活跃度监测', count: 6, icon: Activity },
    ],
  };

  // 需要关注
  const attentionItems = [
    { level: 'high' as const, text: '芯视科技活跃度下降至 35', action: '查看详情', href: '/incubator/alerts' },
    { level: 'high' as const, text: '蔚来汽车缺少研发费用占比数据', action: '查看企业', href: '/enterprises/ent-002' },
    { level: 'medium' as const, text: 'PM-A 有 3 个逾期任务', action: '查看任务', href: '/policy/tasks' },
    { level: 'medium' as const, text: '清洁智造连续2周无活动迹象', action: '查看详情', href: '/incubator/alerts' },
    { level: 'low' as const, text: '本月走访目标完成率 78%', action: '查看走访', href: '/visit/records' },
  ];

  const levelStyle = {
    high: 'bg-red-500',
    medium: 'bg-amber-400',
    low: 'bg-blue-400',
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">管理看板</h1>
            <p className="text-xs text-slate-500 mt-0.5">{today} · 全局视图</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
              <Activity className="h-3.5 w-3.5" />
              <span className="text-xs font-medium hidden sm:inline">系统运行正常</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* ── 全局 KPI ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{kpi.label}</span>
                <kpi.icon className="h-4 w-4 text-slate-300" />
              </div>
              <div className={cn("text-2xl sm:text-3xl font-bold font-mono tracking-tight", kpi.color)}>{kpi.value}</div>
              <div className={cn("text-xs font-medium mt-1.5 flex items-center gap-1",
                kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
              )}>
                {kpi.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {kpi.change} <span className="text-slate-400">vs 上月</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── 政策转化漏斗 ── */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900">政策转化漏斗</h2>
            </div>
            <button className="text-xs text-[#3370FF] hover:underline flex items-center gap-1"
              onClick={() => router.push('/policy')}>
              进入政策工作台 <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-0">
            {pipeline.map((stage, i) => (
              <div key={i} className="flex items-center">
                <div className="flex-1 text-center py-2">
                  <div className={cn("text-2xl sm:text-3xl font-bold font-mono mb-1 leading-none",
                    i === 0 ? 'text-slate-400' : 'text-slate-900'
                  )}>
                    {stage.value}
                  </div>
                  <div className="text-xs font-medium text-slate-700">{stage.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{stage.sub}</div>
                </div>
                {i < pipeline.length - 1 && (
                  <div className="shrink-0 px-1">
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── 两栏：团队效率 + AI 工作报告 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 左：团队效率对比 */}
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900">团队效率</h2>
              </div>
              <button className="text-xs text-[#3370FF] hover:underline"
                onClick={() => router.push('/policy/tasks')}>
                查看详情
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {pmProgress.map((pm, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                        {pm.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{pm.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {pm.visited}/{pm.assigned} 已走访 · 转化 {(pm.conversion_rate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
                    <div className="bg-emerald-500 rounded-full transition-all" style={{ width: `${(pm.willing / pm.assigned) * 100}%` }} />
                    <div className="bg-blue-500 rounded-full transition-all" style={{ width: `${((pm.visited - pm.willing) / pm.assigned) * 100}%` }} />
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" />有意愿 {pm.willing}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full" />已走访 {pm.visited}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-200 rounded-full" />待处理 {pm.assigned - pm.visited}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右：AI 工作报告 */}
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-[#3370FF]" />
                <h2 className="text-sm font-bold text-slate-900">AI 今日工作报告</h2>
              </div>
              <span className="text-[10px] text-slate-400">更新于 10 分钟前</span>
            </div>
            <div className="p-4">
              {/* 汇总 */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-xl font-bold text-[#3370FF] font-mono">{aiWorkReport.total}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">今日自动完成</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="text-xl font-bold text-amber-600 font-mono">{aiWorkReport.pendingReview}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">待团队审核</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-xl font-bold text-slate-700 font-mono">{aiWorkReport.rejectRate}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">驳回率</div>
                </div>
              </div>
              {/* 明细 */}
              <div className="space-y-2">
                {aiWorkReport.details.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="flex items-center gap-2">
                      <d.icon className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs text-slate-700">{d.type}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-mono">{d.count} 项</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 需要关注 ── */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">需要关注</h2>
              <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{attentionItems.filter(a => a.level === 'high').length} 紧急</span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {attentionItems.map((item, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className={cn("w-2 h-2 rounded-full shrink-0", levelStyle[item.level])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{item.text}</p>
                </div>
                <button
                  className="text-xs text-[#3370FF] hover:underline shrink-0 flex items-center gap-1"
                  onClick={() => router.push(item.href)}
                >
                  {item.action} <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── 孵化器概况（管理视图） ── */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900">孵化器概况</h2>
            </div>
            <button className="text-xs text-[#3370FF] hover:underline flex items-center gap-1"
              onClick={() => router.push('/incubator')}>
              进入孵化器 <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xl font-bold text-slate-900 font-mono">{incubatorStats.total_enterprises}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">在孵企业</div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="text-xl font-bold text-emerald-600 font-mono">{incubatorStats.active_enterprises}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">高活跃</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="text-xl font-bold text-red-600 font-mono">{alerts.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">异常预警</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-xl font-bold text-[#3370FF] font-mono">{incubatorStats.total_orders}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">本月匹配</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-xl font-bold text-amber-600 font-mono">{incubatorStats.pending_orders}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">待处理</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
