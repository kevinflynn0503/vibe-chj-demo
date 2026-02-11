/**
 * 孵化企业详情页 — 充实版
 * 
 * 增加：
 * 1. AI 画像摘要（一段话总结）
 * 2. 融资历史
 * 3. 核心团队
 * 4. 活跃度趋势分解（组成因素）
 * 5. 历史匹配/合作记录
 * 6. BP 解析标识
 */
'use client';

import { useParams, useRouter } from 'next/navigation';
import { getIncubatorEnterprise, getActivityReports } from '@/lib/mock-data';
import {
  ArrowLeft, MapPin, Users, Briefcase, Building2, TrendingUp, TrendingDown, Minus,
  Calendar, Cpu, Target, FileText, ChevronRight, Bot, Sparkles, DollarSign,
  UserCircle, Activity, Handshake, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendChat } from '@/lib/host-api';

// Mock 融资历史
const mockFundingHistory = [
  { round: '天使轮', amount: '500万', investor: '漕河泾创投', date: '2024-03' },
  { round: 'Pre-A', amount: '2000万', investor: '红杉种子基金', date: '2025-01' },
];

// Mock 核心团队
const mockTeam = [
  { name: '张明', title: 'CEO / 联合创始人', bg: '前华为算法专家，10年行业经验' },
  { name: '李芳', title: 'CTO / 联合创始人', bg: '上海交大博士，主攻计算机视觉' },
  { name: '王磊', title: 'VP 商务', bg: '前腾讯云商务总监' },
];

// Mock 活跃度分解
const mockActivityBreakdown = [
  { label: '会议预约', score: 85, trend: 'up' as const },
  { label: '访客来访', score: 72, trend: 'up' as const },
  { label: '招聘活动', score: 60, trend: 'stable' as const },
  { label: '投资机构', score: 45, trend: 'down' as const },
];

// Mock 匹配历史
const mockMatchHistory = [
  { demand: '仪电-智慧城市AI视觉', status: 'matched', date: '2026-02-08', result: '已对接' },
  { demand: '蔚来-传感器供应商', status: 'pending', date: '2026-02-05', result: '匹配中' },
];

export default function IncubatorEnterprisePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const ent = getIncubatorEnterprise(id);
  const activityReports = getActivityReports();
  const activity = activityReports.find(r => r.enterprise_id === ent?.enterprise_id);

  if (!ent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.push('/incubator')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回孵化管理
          </button>
          <div className="flex items-start justify-between gap-4">
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
                  <span className="flex items-center gap-1 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">
                    <Bot className="h-3 w-3" /> BP 解析
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{ent.bp_summary || '暂无简介'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="btn btn-default btn-sm" onClick={() => sendChat(`请全面分析「${ent.name}」的发展潜力、技术优势、融资状态和合作价值。`)}>
                <Sparkles className="h-3.5 w-3.5" /> AI 分析
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => router.push('/incubator/match')}>
                <Handshake className="h-3.5 w-3.5" /> 发起匹配
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* AI 画像摘要 */}
        <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Bot className="h-5 w-5 text-[#3370FF] shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-900">AI 画像摘要</span>
                <span className="text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">✦ AI 生成</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {ent.name} 是一家专注于{ent.products.join('、')}的{ent.funding_stage || '初创'}企业，
                团队规模 {ent.employee_count ?? '未知'} 人，技术栈涵盖 {ent.tech_stack.slice(0, 3).join('、')} 等。
                {ent.target_market ? `目标市场为${ent.target_market}。` : ''}
                活跃度评分 {ent.activity_score} 分，{ent.activity_score >= 70 ? '整体表现活跃' : ent.activity_score >= 50 ? '表现中等' : '需关注活跃度下降'}。
                {mockFundingHistory.length > 0 ? `已完成 ${mockFundingHistory[mockFundingHistory.length - 1].round} 融资，资方为 ${mockFundingHistory[mockFundingHistory.length - 1].investor}。` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* ── 概览指标 ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
            <div className="text-xs text-slate-500 mb-1">融资阶段</div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <span className="text-lg font-bold text-slate-900">{ent.funding_stage ?? '-'}</span>
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

        {/* ── 双栏：左详情 + 右侧边 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* 左侧：企业详情 */}
          <div className="lg:col-span-3 space-y-4">

            {/* 产品与服务 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900">产品与服务</h2>
                <span className="flex items-center gap-0.5 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded"><Bot className="h-3 w-3" /> BP 解析</span>
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

            {/* 核心团队 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900">核心团队</h2>
                <span className="flex items-center gap-0.5 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded"><Bot className="h-3 w-3" /> BP 解析</span>
              </div>
              <div className="divide-y divide-slate-100">
                {mockTeam.map((m, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900">{m.name} · <span className="text-slate-500 font-normal">{m.title}</span></div>
                      <div className="text-xs text-slate-500 mt-0.5">{m.bg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 融资历史 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900">融资历史</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {mockFundingHistory.map((f, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                        i === mockFundingHistory.length - 1 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                      )}>
                        {f.round.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{f.round} · {f.amount}</div>
                        <div className="text-xs text-slate-500">{f.investor}</div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{f.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BP 简介 */}
            {ent.bp_summary && (
              <div className="bg-white border border-slate-200 rounded-lg">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <h2 className="text-sm font-bold text-slate-900">商业计划简介</h2>
                  <span className="flex items-center gap-0.5 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded"><Bot className="h-3 w-3" /> BP 解析</span>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-700 leading-relaxed">{ent.bp_summary}</p>
                </div>
              </div>
            )}
          </div>

          {/* 右侧 */}
          <div className="lg:col-span-2 space-y-4">

            {/* 活跃度分解 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#3370FF]" />
                <h2 className="text-sm font-bold text-slate-900">活跃度分解</h2>
                <span className="flex items-center gap-0.5 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded"><Bot className="h-3 w-3" /> AI 监测</span>
              </div>
              <div className="p-4 space-y-3">
                {mockActivityBreakdown.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">{item.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{item.score}</span>
                        {item.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                        {item.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                        {item.trend === 'stable' && <Minus className="h-3 w-3 text-slate-400" />}
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full",
                        item.score >= 70 ? 'bg-emerald-500' : item.score >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                      )} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  数据来源: 会议室预约系统 + 访客登记 · 每日更新
                </p>
              </div>
            </div>

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

            {/* 匹配/合作历史 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Handshake className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900">匹配记录</h2>
              </div>
              {mockMatchHistory.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {mockMatchHistory.map((m, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-slate-900">{m.demand}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{m.date}</div>
                      </div>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border",
                        m.status === 'matched' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      )}>
                        {m.result}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-xs text-slate-400">暂无匹配记录</div>
              )}
            </div>

            {/* 快捷操作 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">快捷操作</h2>
              </div>
              <div className="divide-y divide-slate-100">
                <button onClick={() => router.push('/incubator/match')}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                  <span>发起订单匹配</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button onClick={() => router.push('/visit/records')}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                  <span>查看走访记录</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                {ent.enterprise_id && (
                  <button onClick={() => router.push(`/enterprises/${ent.enterprise_id}`)}
                    className="w-full flex items-center justify-between px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                    <span>在企业库中查看</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                )}
                <button onClick={() => sendChat(`请为「${ent.name}」生成一份详细的发展报告，涵盖技术优势、市场前景、融资建议和合作机会分析。`)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs text-[#3370FF] font-medium hover:bg-slate-50 transition-colors">
                  <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI 生成发展报告</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
