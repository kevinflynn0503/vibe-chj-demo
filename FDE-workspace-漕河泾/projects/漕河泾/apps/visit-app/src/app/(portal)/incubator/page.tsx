/**
 * 孵化器运营概览
 * 
 * 一页看完：概况 → 在孵企业 → 匹配入口 → 预警
 * 无 Tab 切换，所有信息平铺
 * 
 * 用户角色：运营人员（公台红）、赵婧总（管理）
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  Rocket, TrendingDown, Zap, Building2, Activity,
  ChevronRight, ArrowRight, MapPin, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getIncubatorStats, getIncubatorEnterprises, getActivityReports,
} from '@/lib/mock-data';

export default function IncubatorPage() {
  const router = useRouter();
  const stats = getIncubatorStats();
  const enterprises = getIncubatorEnterprises();
  const activityReports = getActivityReports();

  const alerts = activityReports.filter(r => r.trend === 'down').slice(0, 3);
  const topActive = activityReports.filter(r => r.trend === 'up').slice(0, 3);

  // enterprise_id → incubator id 映射，用于跳转到孵化企业详情（而非通用企业库）
  const entIdToIncId = Object.fromEntries(enterprises.map(e => [e.enterprise_id, e.id]));

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">孵化器运营</h1>
            <p className="text-xs text-slate-500 mt-0.5">A6 奇岱松校友中心 · {stats.total_enterprises} 家在孵企业</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/incubator/match')}>
            <Rocket className="h-3.5 w-3.5" /> 发起订单匹配
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* ── 概况 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '在孵企业', value: stats.total_enterprises, color: 'text-slate-900' },
            { label: '高活跃', value: stats.active_enterprises, color: 'text-emerald-600' },
            { label: '本月匹配', value: stats.total_orders, color: 'text-[#3370FF]' },
            { label: '待处理订单', value: stats.pending_orders, color: 'text-amber-600' },
          ].map((c, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="text-xs text-slate-500 mb-1">{c.label}</div>
              <div className={cn("text-xl sm:text-2xl font-bold font-mono", c.color)}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* ── 两栏：预警 + 匹配入口 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* 左：异常预警 + 高活跃 (3/5) */}
          <div className="lg:col-span-3 space-y-4">
            {/* 异常预警 */}
            {alerts.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h2 className="text-sm font-bold text-slate-900">异常预警</h2>
                  <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{alerts.length}</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {alerts.map(r => (
                    <div key={r.enterprise_id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => { const incId = entIdToIncId[r.enterprise_id]; if (incId) router.push(`/incubator/${incId}`); }}>
                      <div className="flex items-center gap-3">
                        <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{r.name}</div>
                          <div className="text-xs text-red-600">活跃度下降至 {r.activity_score}</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
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
          </div>

          {/* 右：匹配入口 (2/5) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-[#3370FF] transition-colors cursor-pointer group"
              onClick={() => router.push('/incubator/match')}>
              <div className="p-3 bg-violet-50 rounded-lg text-violet-600 w-fit mb-3"><Rocket className="h-6 w-6" /></div>
              <h3 className="text-base font-bold text-slate-900 mb-1">订单匹配</h3>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">输入大企业需求，AI 自动在 {stats.total_enterprises} 家孵化企业中匹配能力</p>
              <span className="text-sm font-medium text-[#3370FF] flex items-center gap-1 group-hover:gap-2 transition-all">
                开始匹配 <ArrowRight className="h-4 w-4" />
              </span>
            </div>

            {/* 反向推荐 — 企业变化 → 推荐园区伙伴 */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 hover:border-emerald-400 transition-colors cursor-pointer group"
              onClick={() => router.push('/incubator/recommend')}>
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 w-fit mb-3"><Zap className="h-6 w-6" /></div>
              <h3 className="text-base font-bold text-slate-900 mb-1">反向推荐</h3>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">在孵企业有新产品/融资等变化时，自动推荐园区内可对接的合作伙伴</p>
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                查看推荐 <ArrowRight className="h-4 w-4" />
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">最近匹配</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 truncate">仪电-智慧城市AI视觉</span>
                  <span className="text-xs text-[#3370FF] font-medium shrink-0 ml-2">3 家匹配</span>
                </div>
                <div className="flex items-center justify-between">
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
