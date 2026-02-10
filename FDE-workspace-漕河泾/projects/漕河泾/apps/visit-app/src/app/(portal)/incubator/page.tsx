/**
 * 孵化器运营 — 员工视图
 * 
 * 去掉概况统计（移至管理者看板）
 * 聚焦：待我处理 → AI 推荐待审 → 异常处理 → 在孵企业
 * 
 * 用户：运营人员（公台红）
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  Rocket, TrendingDown, Zap, Building2, Activity,
  ChevronRight, ArrowRight, MapPin, AlertTriangle, Sparkles, Bot,
  Clock, CheckCircle2, Target, Eye
} from 'lucide-react';
import { sendChat } from '@/lib/host-api';
import { cn } from '@/lib/utils';
import {
  getIncubatorStats, getIncubatorEnterprises, getActivityReports,
} from '@/lib/mock-data';

export default function IncubatorPage() {
  const router = useRouter();
  const stats = getIncubatorStats();
  const enterprises = getIncubatorEnterprises();
  const activityReports = getActivityReports();

  const alerts = activityReports.filter(r => r.trend === 'down');
  const topActive = activityReports.filter(r => r.trend === 'up').slice(0, 3);

  const entIdToIncId = Object.fromEntries(enterprises.map(e => [e.enterprise_id, e.id]));

  // 待我处理事项
  const pendingItems = [
    ...(alerts.length > 0 ? [{
      icon: AlertTriangle,
      iconColor: 'bg-red-50 text-red-500',
      title: `${alerts.length} 个企业活跃度异常`,
      desc: 'AI 监测到活跃度下降，需确认是否干预',
      action: () => router.push('/incubator/alerts'),
      actionLabel: '查看异常',
      badge: 'AI 监测',
      priority: 'high' as const,
    }] : []),
    {
      icon: Target,
      iconColor: 'bg-blue-50 text-[#3370FF]',
      title: '2 条匹配结果待审核',
      desc: 'AI 完成了「仪电自动洗车项目」需求匹配，4 家企业推荐',
      action: () => router.push('/incubator/match'),
      actionLabel: '审核匹配',
      badge: 'AI 已完成',
      priority: 'high' as const,
    },
    {
      icon: Zap,
      iconColor: 'bg-emerald-50 text-emerald-500',
      title: '3 条反向推荐待确认',
      desc: 'AI 检测到在孵企业变化信号，推荐了合作伙伴',
      action: () => router.push('/incubator/recommend'),
      actionLabel: '查看推荐',
      badge: 'AI 推荐',
      priority: 'medium' as const,
    },
    ...(stats.pending_orders > 0 ? [{
      icon: Clock,
      iconColor: 'bg-amber-50 text-amber-500',
      title: `${stats.pending_orders} 个订单待处理`,
      desc: '有新的大企业需求等待匹配孵化企业',
      action: () => router.push('/incubator/match'),
      actionLabel: '处理订单',
      badge: null as string | null,
      priority: 'medium' as const,
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">孵化器运营</h1>
            <p className="text-xs text-slate-500 mt-0.5">A6 奇岱松校友中心 · {stats.total_enterprises} 家在孵</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-default btn-sm" onClick={() => router.push('/incubator/alerts')}>
              <AlertTriangle className="h-3.5 w-3.5" /> 异常预警
              {alerts.length > 0 && <span className="ml-1 text-[10px] bg-red-500 text-white px-1 py-0.5 rounded-full">{alerts.length}</span>}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => router.push('/incubator/match')}>
              <Sparkles className="h-3.5 w-3.5" /> AI 订单匹配
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* ── 待我处理 ── */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">待我处理</h2>
              <span className="text-xs text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">{pendingItems.length} 项</span>
            </div>
            <button className="text-[10px] text-[#3370FF] hover:underline"
              onClick={() => router.push('/dashboard')}>
              查看管理看板 →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingItems.map((item, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
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
                <button onClick={item.action}
                  className="btn btn-default btn-sm shrink-0 mt-0.5">
                  {item.actionLabel} <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── 两栏：AI 功能入口 + 异常预警 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* 左：AI 功能入口 (2/5) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-[#3370FF] transition-colors cursor-pointer group"
              onClick={() => router.push('/incubator/match')}>
              <div className="p-3 bg-violet-50 rounded-lg text-violet-600 w-fit mb-3"><Rocket className="h-6 w-6" /></div>
              <h3 className="text-base font-bold text-slate-900 mb-1">AI 订单匹配</h3>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">输入大企业需求，AI 自动在 {stats.total_enterprises} 家孵化企业中匹配能力</p>
              <span className="text-sm font-medium text-[#3370FF] flex items-center gap-1 group-hover:gap-2 transition-all">
                开始匹配 <ArrowRight className="h-4 w-4" />
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-emerald-400 transition-colors cursor-pointer group"
              onClick={() => router.push('/incubator/recommend')}>
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 w-fit mb-3"><Zap className="h-6 w-6" /></div>
              <h3 className="text-base font-bold text-slate-900 mb-1">AI 反向推荐</h3>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">AI 持续监测在孵企业变化，自动推荐可对接的合作伙伴</p>
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                查看推荐 <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* 右：异常预警 + 高活跃 (3/5) */}
          <div className="lg:col-span-3 space-y-4">
            {/* 异常预警 */}
            {alerts.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <h2 className="text-sm font-bold text-slate-900">异常预警</h2>
                    <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{alerts.length}</span>
                  </div>
                  <button className="text-xs text-[#3370FF] hover:underline flex items-center gap-1"
                    onClick={() => router.push('/incubator/alerts')}>
                    查看全部 <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {alerts.map(r => (
                    <div key={r.enterprise_id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => { const incId = entIdToIncId[r.enterprise_id]; if (incId) router.push(`/incubator/${incId}`); }}>
                        <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{r.name}</div>
                          <div className="text-xs text-red-600">活跃度 {r.activity_score} · {r.signals?.[0]}</div>
                        </div>
                      </div>
                      <button
                        className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-[#3370FF] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-100 transition-colors ml-2"
                        onClick={(e) => { e.stopPropagation(); sendChat(`请分析「${r.name}」活跃度下降原因，给出预警详情和建议干预措施。`); }}
                      >
                        <Sparkles className="h-3 w-3" /> AI 分析
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 高活跃企业 */}
            {topActive.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <h2 className="text-sm font-bold text-slate-900">高活跃企业</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {topActive.map(r => (
                    <div key={r.enterprise_id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => { const incId = entIdToIncId[r.enterprise_id]; if (incId) router.push(`/incubator/${incId}`); }}>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{r.name}</div>
                        <div className="text-xs text-emerald-600">活跃度 {r.activity_score} · 会议频次上升</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 最近匹配 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">最近匹配</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between cursor-pointer hover:text-[#3370FF]"
                  onClick={() => router.push('/incubator/match')}>
                  <span className="text-slate-700 truncate">仪电-智慧城市AI视觉</span>
                  <span className="text-xs text-[#3370FF] font-medium shrink-0 ml-2">3 家匹配</span>
                </div>
                <div className="flex items-center justify-between cursor-pointer hover:text-[#3370FF]"
                  onClick={() => router.push('/incubator/match')}>
                  <span className="text-slate-700 truncate">蔚来-传感器供应商</span>
                  <span className="text-xs text-[#3370FF] font-medium shrink-0 ml-2">2 家匹配</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 在孵企业名录 ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">在孵企业名录</h2>
            <span className="text-xs text-slate-500">{enterprises.length} 家</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {enterprises.map(ent => (
              <div key={ent.id}
                className="bg-white border border-slate-200 rounded-lg p-4 hover:border-[#3370FF] transition-colors cursor-pointer group"
                onClick={() => router.push(`/incubator/${ent.id}`)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 bg-violet-50 text-violet-600 border border-violet-100 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                    {ent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#3370FF] transition-colors">{ent.name}</div>
                    {ent.location && <div className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5"><MapPin className="h-2.5 w-2.5" />{ent.location}</div>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {ent.products.slice(0, 3).map((p, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{p}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                  <span className="text-xs text-slate-500">活跃度</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", ent.activity_score >= 80 ? "bg-emerald-500" : ent.activity_score >= 50 ? "bg-blue-500" : "bg-red-500")}
                        style={{ width: `${ent.activity_score}%` }} />
                    </div>
                    <span className={cn("text-xs font-mono font-bold", ent.activity_score >= 80 ? "text-emerald-600" : ent.activity_score >= 50 ? "text-blue-600" : "text-red-600")}>
                      {ent.activity_score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
