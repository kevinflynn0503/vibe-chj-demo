'use client';

import { useParams, useRouter } from 'next/navigation';
import { getIncubatorEnterprise, getActivityReports } from '@/lib/mock-data';
import { ArrowLeft, MapPin, Users, Briefcase, Building2, TrendingUp, TrendingDown, Minus, Calendar, Cpu, Target, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function IncubatorEnterprisePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const ent = getIncubatorEnterprise(id);
  const activityReports = getActivityReports();
  const activity = activityReports.find(r => r.enterprise_id === ent?.enterprise_id);

  if (!ent) {
    return (
      <div className="min-h-screen bg-[#F5F6F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-sm">未找到该在孵企业</p>
          <button className="btn btn-primary btn-sm mt-4" onClick={() => router.push('/incubator')}>
            返回孵化管理
          </button>
        </div>
      </div>
    );
  }

  const trendIcon = activity?.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
    : activity?.trend === 'down' ? <TrendingDown className="h-3.5 w-3.5 text-red-500" />
    : <Minus className="h-3.5 w-3.5 text-slate-400" />;

  const scoreColor = ent.activity_score >= 80 ? 'text-emerald-600' : ent.activity_score >= 50 ? 'text-blue-600' : 'text-red-600';
  const scoreBg = ent.activity_score >= 80 ? 'bg-emerald-500' : ent.activity_score >= 50 ? 'bg-blue-500' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.push('/incubator')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回孵化管理
          </button>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-violet-50 text-violet-600 border border-violet-100 rounded-lg flex items-center justify-center text-xl font-bold shrink-0">
              {ent.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900">{ent.name}</h1>
                {ent.funding_stage && (
                  <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200">{ent.funding_stage}</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">{ent.bp_summary || '暂无简介'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* ── 概览指标 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500 mb-1">活跃度</div>
            <div className="flex items-center gap-2">
              <span className={cn("text-2xl font-bold font-mono", scoreColor)}>{ent.activity_score}</span>
              {trendIcon}
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className={cn("h-full rounded-full", scoreBg)} style={{ width: `${ent.activity_score}%` }} />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500 mb-1">团队规模</div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-2xl font-bold text-slate-900">{ent.employee_count ?? '-'}</span>
              <span className="text-xs text-slate-400">人</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500 mb-1">入孵时间</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-lg font-bold text-slate-900">{ent.entered_at ?? '-'}</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500 mb-1">办公位置</div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="text-lg font-bold text-slate-900">{ent.location ?? '-'}</span>
            </div>
          </div>
        </div>

        {/* ── 双栏：企业信息 + 活跃信号 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* 左侧：企业详情 */}
          <div className="lg:col-span-3 space-y-4">

            {/* 产品与服务 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900">产品与服务</h2>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {ent.products.map((p, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100">{p}</span>
                  ))}
                </div>
                {ent.target_market && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs">
                      <Target className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-500">目标市场：</span>
                      <span className="text-slate-700">{ent.target_market}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 技术栈 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900">技术能力</h2>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {ent.tech_stack.map((t, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-slate-50 text-slate-600 rounded border border-slate-200">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* BP 简介 */}
            {ent.bp_summary && (
              <div className="bg-white border border-slate-200 rounded-lg">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <h2 className="text-sm font-bold text-slate-900">商业计划简介</h2>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-700 leading-relaxed">{ent.bp_summary}</p>
                </div>
              </div>
            )}
          </div>

          {/* 右侧 */}
          <div className="lg:col-span-2 space-y-4">

            {/* 活跃信号 */}
            {activity && activity.signals.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">近期活跃信号</h2>
                </div>
                <div className="p-4 space-y-2">
                  {activity.signals.map((signal, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", scoreBg)} />
                      <span className="text-slate-700">{signal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 快捷操作 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">快捷操作</h2>
              </div>
              <div className="divide-y divide-slate-100">
                <button
                  onClick={() => router.push('/incubator/match')}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>发起订单匹配</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => router.push('/visit/records')}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>查看走访记录</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                {ent.enterprise_id && (
                  <button
                    onClick={() => router.push(`/enterprises/${ent.enterprise_id}`)}
                    className="w-full flex items-center justify-between px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>在企业库中查看</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* 基本信息卡片 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">基本信息</h2>
              </div>
              <div className="p-4 space-y-3">
                <InfoRow label="企业名称" value={ent.name} />
                <InfoRow label="融资阶段" value={ent.funding_stage ?? '-'} />
                <InfoRow label="团队人数" value={ent.employee_count ? `${ent.employee_count} 人` : '-'} />
                <InfoRow label="入孵时间" value={ent.entered_at ?? '-'} />
                <InfoRow label="办公位置" value={ent.location ?? '-'} />
                <InfoRow label="目标市场" value={ent.target_market ?? '-'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}
