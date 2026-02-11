/**
 * 孵化器运营 — 布局优化版
 * 
 * 改造：
 * 1. 清晰的三大场景入口（运营监控 / 订单匹配 / 反向推荐）
 * 2. 操作简化：每个区域只有 1-2 个核心操作
 * 3. AI 监测状态统一展示
 * 4. 在孵企业列表简化为紧凑卡片
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  Rocket, TrendingDown, TrendingUp, Zap, Building2, Activity,
  ChevronRight, ArrowRight, MapPin, AlertTriangle, Sparkles, Bot,
  Clock, CheckCircle2, Target, Search, BarChart3, Handshake
} from 'lucide-react';
import { sendChat } from '@/lib/host-api';
import { cn } from '@/lib/utils';
import { getIncubatorStats, getIncubatorEnterprises, getActivityReports } from '@/lib/mock-data';

export default function IncubatorPage() {
  const router = useRouter();
  const stats = getIncubatorStats();
  const enterprises = getIncubatorEnterprises();
  const activityReports = getActivityReports();

  const alerts = activityReports.filter(r => r.trend === 'down');
  const topActive = activityReports.filter(r => r.trend === 'up').slice(0, 3);
  const entIdToIncId = Object.fromEntries(enterprises.map(e => [e.enterprise_id, e.id]));

  return (
    <div className="min-h-full">
      <div className="page-container space-y-4">
        {/* ═══ 头部 ═══ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-base font-bold text-slate-900">孵化器运营</h1>
            <p className="text-xs text-slate-400 mt-0.5">A6 奇岱松校友中心 · {stats.total_enterprises} 家在孵</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/incubator/match')}>
            <Sparkles className="h-3.5 w-3.5" /> AI 订单匹配
          </button>
        </div>

        {/* ═══ 运营指标 + AI 状态 ═══ */}
        <div className="bg-white border border-slate-200 rounded-[10px] p-4"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#3370FF]" />
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">运营概览</h2>
              <span className="flex items-center gap-1 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">
                <Bot className="h-3 w-3" /> AI 持续监测中
              </span>
            </div>
            <span className="text-[10px] text-slate-400">更新于 10 分钟前</span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-lg font-bold font-mono text-slate-900">{stats.total_enterprises}</div>
              <div className="text-[10px] text-slate-500">在孵企业</div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-lg font-bold font-mono text-emerald-600">{topActive.length}</div>
              <div className="text-[10px] text-slate-500">高活跃</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold font-mono text-red-600">{alerts.length}</div>
              <div className="text-[10px] text-slate-500">异常预警</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold font-mono text-blue-600">156</div>
              <div className="text-[10px] text-slate-500">本周会议</div>
            </div>
            <div className="text-center p-3 bg-violet-50 rounded-lg">
              <div className="text-lg font-bold font-mono text-violet-600">89</div>
              <div className="text-[10px] text-slate-500">本周访客</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-lg font-bold font-mono text-amber-600">92%</div>
              <div className="text-[10px] text-slate-500">工位使用率</div>
            </div>
          </div>
        </div>

        {/* ═══ 三大场景入口 ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 异常预警 */}
          <div className="bg-white border border-slate-200 rounded-[10px] overflow-hidden hover:border-slate-300 transition-colors cursor-pointer group"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}
            onClick={() => router.push('/incubator/alerts')}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h2 className="text-sm font-bold text-slate-900">异常预警</h2>
                {alerts.length > 0 && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{alerts.length}</span>}
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-red-500" />
            </div>
            <div className="p-4 space-y-2">
              {alerts.length > 0 ? alerts.slice(0, 2).map(r => (
                <div key={r.enterprise_id} className="flex items-center gap-2 text-xs">
                  <TrendingDown className="h-3 w-3 text-red-500 shrink-0" />
                  <span className="text-slate-700 truncate">{r.name}</span>
                  <span className="text-red-500 shrink-0">活跃度 {r.activity_score}</span>
                </div>
              )) : <p className="text-xs text-slate-400">暂无异常</p>}
              {alerts.length > 2 && <p className="text-[10px] text-slate-400">+{alerts.length - 2} 更多...</p>}
            </div>
            <div className="px-4 py-2.5 bg-red-50/50 border-t border-red-100 flex items-center gap-1.5 text-[10px] text-red-600">
              <Bot className="h-3 w-3" /> AI 持续监测活跃度，自动检测异常
            </div>
          </div>

          {/* 订单匹配 */}
          <div className="bg-white border border-slate-200 rounded-[10px] overflow-hidden hover:border-slate-300 transition-colors cursor-pointer group"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}
            onClick={() => router.push('/incubator/match')}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-[#3370FF]" />
                <h2 className="text-sm font-bold text-slate-900">AI 订单匹配</h2>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#3370FF]" />
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-3">输入大企业需求 → AI 拆解子任务 → 匹配孵化企业能力</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#3370FF] font-medium">待处理 {stats.pending_orders} 个</span>
                <span className="text-slate-400">本月匹配 {stats.total_orders} 次</span>
              </div>
            </div>
            <div className="px-4 py-2.5 bg-blue-50/50 border-t border-blue-100 flex items-center gap-1.5 text-[10px] text-[#3370FF]">
              <Sparkles className="h-3 w-3" /> AI 自动拆解需求 + 语义匹配企业能力
            </div>
          </div>

          {/* 反向推荐 */}
          <div className="bg-white border border-slate-200 rounded-[10px] overflow-hidden hover:border-slate-300 transition-colors cursor-pointer group"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}
            onClick={() => router.push('/incubator/recommend')}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900">AI 反向推荐</h2>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500" />
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-3">在孵企业有变化 → AI 自动推荐可对接的园区合作伙伴</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-600 font-medium">3 条新推荐待审</span>
                <span className="text-slate-400">本月推荐 8 条</span>
              </div>
            </div>
            <div className="px-4 py-2.5 bg-emerald-50/50 border-t border-emerald-100 flex items-center gap-1.5 text-[10px] text-emerald-600">
              <Bot className="h-3 w-3" /> AI 监测变化信号（融资/新产品/团队扩张）
            </div>
          </div>
        </div>

        {/* ═══ 两栏：高活跃 + 最近动态 ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 高活跃企业 */}
          <div className="bg-white border border-slate-200 rounded-[10px]"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900">高活跃企业</h2>
                <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded"><Bot className="h-3 w-3" /> AI 识别</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {topActive.map(r => (
                <div key={r.enterprise_id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => { const incId = entIdToIncId[r.enterprise_id]; if (incId) router.push(`/incubator/${incId}`); }}>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{r.name}</div>
                    <div className="text-xs text-emerald-600 mt-0.5">
                      活跃度 {r.activity_score} · {r.signals?.[0] || '会议频次上升'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-[10px] text-[#3370FF] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-100"
                      onClick={(e) => { e.stopPropagation(); sendChat(`「${r.name}」活跃度上升，请分析原因并推荐可对接的合作机会。`); }}>
                      <Sparkles className="h-3 w-3 inline" /> AI 分析
                    </button>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              ))}
              {topActive.length === 0 && <div className="px-4 py-6 text-center text-xs text-slate-400">暂无高活跃企业</div>}
            </div>
          </div>

          {/* 最近动态 */}
          <div className="bg-white border border-slate-200 rounded-[10px]"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900">最近动态</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { icon: Sparkles, text: 'AI 完成「仪电-自动洗车」需求匹配，推荐 3 家', time: '10分钟前', cls: 'bg-blue-50 text-[#3370FF]' },
                { icon: AlertTriangle, text: '芯视科技活跃度下降至 35，触发预警', time: '2小时前', cls: 'bg-red-50 text-red-500' },
                { icon: Zap, text: 'AI 检测到微纳智造完成 Pre-A 融资，推荐合作方', time: '昨天', cls: 'bg-emerald-50 text-emerald-600' },
                { icon: Handshake, text: '你采纳了「传感器供应商」匹配方案', time: '昨天', cls: 'bg-violet-50 text-violet-600' },
                { icon: CheckCircle2, text: '清洁智造走访完成，AI 已提取走访记录', time: '2天前', cls: 'bg-emerald-50 text-emerald-600' },
              ].map((item, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className={cn("p-1.5 rounded-full shrink-0", item.cls)}>
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 truncate">{item.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ 在孵企业名录 ═══ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">在孵企业名录</h2>
            <span className="text-xs text-slate-500">{enterprises.length} 家</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {enterprises.map(ent => (
              <div key={ent.id}
                className="bg-white border border-slate-200 rounded-[10px] p-4 hover:border-slate-300 transition-all cursor-pointer group"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}
                onClick={() => router.push(`/incubator/${ent.id}`)}>
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 bg-violet-50 text-violet-600 border border-violet-100 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                    {ent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-[#3370FF] transition-colors">{ent.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {ent.funding_stage && <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">{ent.funding_stage}</span>}
                      <span className="text-[10px] text-slate-400">{ent.employee_count ? `${ent.employee_count}人` : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", ent.activity_score >= 80 ? "bg-emerald-500" : ent.activity_score >= 50 ? "bg-blue-500" : "bg-red-500")}
                        style={{ width: `${ent.activity_score}%` }} />
                    </div>
                    <span className={cn("text-[10px] font-mono font-bold", ent.activity_score >= 80 ? "text-emerald-600" : ent.activity_score >= 50 ? "text-blue-600" : "text-red-600")}>
                      {ent.activity_score}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ent.products.slice(0, 3).map((p, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
