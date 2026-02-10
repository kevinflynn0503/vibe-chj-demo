/**
 * 孵化器管理 — 完整版工作台
 */
'use client';

import { useRouter } from 'next/navigation';
import { Building2, MapPin, Users, ChevronRight, Award, ArrowUpRight, Activity, Plus, Search, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEnterprises, getIncubatorStats, getEnterpriseActivityRanking } from '@/lib/mock-data';

export default function IncubatorPage() {
  const router = useRouter();
  const stats = getIncubatorStats();
  const enterprises = getEnterprises();
  const ranking = getEnterpriseActivityRanking();

  const statCards = [
    { icon: Building2, label: '入驻企业', value: stats.total_enterprises, sub: '总数', grad: 'grad-blue', shadow: 'shadow-blue-500/20' },
    { icon: Activity, label: '活跃企业', value: stats.active_enterprises, sub: `活跃率 ${Math.round((stats.active_enterprises / Math.max(stats.total_enterprises, 1)) * 100)}%`, grad: 'grad-green', shadow: 'shadow-emerald-500/20' },
    { icon: Award, label: '高新企业', value: stats.hightech_count, sub: '已认定', grad: 'grad-purple', shadow: 'shadow-purple-500/20' },
    { icon: TrendingUp, label: '订单匹配', value: stats.total_orders, sub: `待处理 ${stats.pending_orders}`, grad: 'grad-amber', shadow: 'shadow-amber-500/20', warn: stats.pending_orders > 0 },
  ];

  return (
    <div className="min-h-full">
      {/* 页头 */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-[1200px] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl grad-purple shadow-lg shadow-purple-500/20">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-[20px] font-extrabold text-gray-900">孵化器管理</h1>
                <p className="text-[13px] text-gray-400">企业入驻与订单匹配</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/incubator/match')}
                className="inline-flex h-10 items-center gap-2 rounded-xl grad-purple px-5 text-[13px] font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:shadow-purple-500/30 hover:scale-[1.02] cursor-pointer"
              >
                <Zap className="h-4 w-4" />AI 订单匹配
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-8 py-6 space-y-6">
        {/* 指标卡片 */}
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((item, idx) => (
            <div key={item.label} className={cn(
              'group rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-px cursor-pointer animate-fade-in-up',
              idx === 0 ? '' : idx === 1 ? 'animate-delay-1' : idx === 2 ? 'animate-delay-2' : 'animate-delay-3'
            )}>
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shadow-lg', item.grad, item.shadow)}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <p className={cn('mt-4 text-[28px] font-extrabold tabular-nums leading-none', item.warn ? 'text-amber-500' : 'text-gray-900')}>{item.value}</p>
              <p className="mt-1.5 text-[13px] font-medium text-gray-500">{item.label}</p>
              <p className="mt-0.5 text-[11px] text-gray-300">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 企业列表 */}
          <div className="col-span-2 rounded-2xl border border-gray-100 bg-white shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold text-gray-900">入驻企业</h2>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">{enterprises.length}</span>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {enterprises.slice(0, 8).map((ent, idx) => {
                const initials = ent.name.replace(/上海|有限公司|科技|（.*?）/g, '').slice(0, 2);
                const gradients = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-emerald-400 to-emerald-600', 'from-amber-400 to-amber-600', 'from-rose-400 to-rose-600', 'from-cyan-400 to-cyan-600'];
                return (
                  <div key={ent.id}
                    onClick={() => router.push(`/enterprises/${ent.id}`)}
                    className="flex items-center gap-4 px-6 py-4 cursor-pointer transition-all duration-150 hover:bg-blue-50/30"
                  >
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[11px] font-bold text-white shadow-sm', gradients[idx % gradients.length])}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-gray-900 truncate">{ent.name.replace(/上海|有限公司/g, '')}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                        <span>{ent.industry}</span>
                        <span>·</span>
                        <span>{ent.building} {ent.floor}F</span>
                      </div>
                    </div>
                    {ent.is_hightech && (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">高新</span>
                    )}
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-200" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 活跃排行 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg grad-amber shadow-lg shadow-amber-500/20">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-gray-900">活跃排行</h3>
                <p className="text-[11px] text-gray-400">近 30 天</p>
              </div>
            </div>
            <div className="space-y-4">
              {ranking.slice(0, 8).map((r, idx) => (
                <div key={r.enterprise_id} className="flex items-center gap-3">
                  <span className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold',
                    idx < 3 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white' : 'bg-gray-100 text-gray-400'
                  )}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-gray-700 truncate">{r.enterprise_name?.replace(/上海|有限公司/g, '')}</p>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000"
                        style={{ width: `${(r.score / Math.max(ranking[0].score, 1)) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-[12px] font-bold tabular-nums text-gray-500">{r.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
