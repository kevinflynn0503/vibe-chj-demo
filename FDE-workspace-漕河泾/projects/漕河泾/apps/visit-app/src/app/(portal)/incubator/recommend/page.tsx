/**
 * 反向推荐页面
 * 
 * 在孵企业有变化信号（新产品/融资/技术突破）→ 自动推荐园区内可对接的合作伙伴
 * 对应需求：UR-303 双向推荐
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Zap, Building2, ChevronRight, TrendingUp,
  Sparkles, ExternalLink, Users, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIncubatorEnterprises, getEnterprises } from '@/lib/mock-data';

// 模拟反向推荐数据
interface RecommendItem {
  id: string;
  incubatorEnterprise: string;
  incubatorId: string;
  signal: string;
  signalType: 'product' | 'funding' | 'tech' | 'expansion';
  signalTime: string;
  recommendations: {
    enterpriseId: string;
    enterpriseName: string;
    reason: string;
    matchScore: number;
  }[];
}

const mockRecommendations: RecommendItem[] = [
  {
    id: 'rec-001',
    incubatorEnterprise: '芯视科技',
    incubatorId: 'inc-001',
    signal: '新一代AI视觉传感器芯片完成流片，待量产',
    signalType: 'product',
    signalTime: '2026-02-01',
    recommendations: [
      { enterpriseId: 'ent-002', enterpriseName: '蔚来汽车', reason: '蔚来正在寻找本地化传感器供应商，与芯视的传感器芯片高度匹配', matchScore: 95 },
      { enterpriseId: 'ent-004', enterpriseName: '仪电集团', reason: '仪电智慧城市项目需要AI视觉方案，可作为芯片应用场景', matchScore: 78 },
      { enterpriseId: 'ent-001', enterpriseName: '强生医疗', reason: '强生外科机器人的视觉模块有传感器国产化替代需求', matchScore: 72 },
    ],
  },
  {
    id: 'rec-002',
    incubatorEnterprise: '北坡科技',
    incubatorId: 'inc-002',
    signal: 'AI Agent 智能驾驶舱平台完成 MVP，开始对外合作',
    signalType: 'product',
    signalTime: '2026-02-03',
    recommendations: [
      { enterpriseId: 'ent-004', enterpriseName: '仪电集团', reason: '仪电有大量数字化项目采购需求，AI驾驶舱可作为解决方案之一', matchScore: 88 },
      { enterpriseId: 'ent-001', enterpriseName: '强生医疗', reason: '强生对AI算力平台有明确需求，可借AI驾驶舱做内部管理工具', matchScore: 65 },
    ],
  },
  {
    id: 'rec-003',
    incubatorEnterprise: '芯视科技',
    incubatorId: 'inc-001',
    signal: 'A轮融资进展顺利，预计3月close，估值将大幅提升',
    signalType: 'funding',
    signalTime: '2026-02-01',
    recommendations: [
      { enterpriseId: 'ent-002', enterpriseName: '蔚来汽车', reason: '蔚来愿意提供试单机会，融资成功后可加速合作落地', matchScore: 90 },
    ],
  },
];

const signalTypeConfig: Record<string, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  product: { label: '新产品', cls: 'bg-blue-50 text-blue-600 border-blue-100', icon: Sparkles },
  funding: { label: '融资', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: TrendingUp },
  tech: { label: '技术突破', cls: 'bg-violet-50 text-violet-600 border-violet-100', icon: Zap },
  expansion: { label: '扩张', cls: 'bg-amber-50 text-amber-600 border-amber-100', icon: Target },
};

export default function RecommendPage() {
  const router = useRouter();
  const totalRecommendations = mockRecommendations.reduce((sum, r) => sum + r.recommendations.length, 0);

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.push('/incubator')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回孵化管理
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900">反向推荐</h1>
              <p className="text-xs text-slate-500 mt-0.5">在孵企业变化信号 → 推荐园区合作伙伴 · {mockRecommendations.length} 条信号 · {totalRecommendations} 条推荐</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* 概览 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900 font-mono">{mockRecommendations.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">变化信号</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#3370FF] font-mono">{totalRecommendations}</div>
            <div className="text-xs text-slate-500 mt-0.5">推荐对接</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              {new Set(mockRecommendations.map(r => r.incubatorEnterprise)).size}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">涉及企业</div>
          </div>
        </div>

        {/* 推荐列表 */}
        <div className="space-y-4">
          {mockRecommendations.map(rec => {
            const signalConfig = signalTypeConfig[rec.signalType];
            const SignalIcon = signalConfig.icon;
            return (
              <div key={rec.id} className="bg-white border border-slate-200 rounded-lg">
                {/* 信号头部 */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1", signalConfig.cls)}>
                      <SignalIcon className="h-3 w-3" />
                      {signalConfig.label}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{rec.incubatorEnterprise}</span>
                    <span className="text-xs text-slate-400 font-mono">{rec.signalTime}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5">{rec.signal}</p>
                </div>

                {/* 推荐伙伴 */}
                <div className="divide-y divide-slate-100">
                  {rec.recommendations.map((r, i) => (
                    <div key={i}
                      className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/enterprises/${r.enterpriseId}`)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                          {r.enterpriseName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900">{r.enterpriseName}</div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">{r.reason}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <div className="text-right">
                          <div className={cn("text-sm font-bold font-mono",
                            r.matchScore >= 90 ? 'text-emerald-600' :
                            r.matchScore >= 70 ? 'text-blue-600' : 'text-amber-600'
                          )}>
                            {r.matchScore}%
                          </div>
                          <div className="text-[10px] text-slate-400">匹配度</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
