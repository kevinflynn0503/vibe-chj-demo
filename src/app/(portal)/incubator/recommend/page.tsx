/**
 * 反向推荐页面
 * 
 * 在孵企业有变化信号（新产品/融资/技术突破）→ 自动推荐园区内可对接的合作伙伴
 * 对应需求：UR-303 双向推荐
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ChevronLeft, Zap, Building2, ChevronRight, TrendingUp,
  Sparkles, ExternalLink, Users, Target, Bot, CheckCircle2, XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { sendChat } from '@/lib/host-api';

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
  product: { label: '新产品', cls: 'bg-neutral-50 text-brand border-line-light', icon: Sparkles },
  funding: { label: '融资', cls: 'bg-neutral-50 text-success border-line-light', icon: TrendingUp },
  tech: { label: '技术突破', cls: 'bg-neutral-50 text-brand border-line-light', icon: Zap },
  expansion: { label: '扩张', cls: 'bg-neutral-50 text-warning border-line-light', icon: Target },
};

export default function RecommendPage() {
  const router = useRouter();
  const [acceptedKeys, setAcceptedKeys] = useState<Set<string>>(new Set());
  const [ignoredKeys, setIgnoredKeys] = useState<Set<string>>(new Set());
  const totalRecommendations = mockRecommendations.reduce((sum, r) => sum + r.recommendations.length, 0);

  const handleAccept = (key: string) => {
    setAcceptedKeys(prev => new Set([...prev, key]));
    setIgnoredKeys(prev => { const n = new Set(prev); n.delete(key); return n; });
  };
  const handleIgnore = (key: string) => {
    setIgnoredKeys(prev => new Set([...prev, key]));
    setAcceptedKeys(prev => { const n = new Set(prev); n.delete(key); return n; });
  };

  return (
    <div className="min-h-full">
      {/* 头部 */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <Button variant="ghost" size="sm" onClick={() => router.push('/incubator')} className="mb-3">
            <ChevronLeft className="h-3.5 w-3.5" /> 返回孵化管理
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-text-primary">反向推荐</h1>
                <span className="flex items-center gap-1 text-tag text-brand bg-neutral-50 px-1.5 py-0.5 rounded">
                  <Bot className="h-3 w-3" /> AI 自动监测
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">AI 持续监测在孵企业变化 → 自动推荐园区合作伙伴 · {mockRecommendations.length} 条信号 · {totalRecommendations} 条推荐</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container space-y-6">

        {/* 概览 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-surface-card border border-line rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold text-text-primary tabular-nums">{mockRecommendations.length}</div>
            <div className="text-xs text-text-muted mt-0.5">变化信号</div>
          </div>
          <div className="bg-surface-card border border-line rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-brand tabular-nums">{totalRecommendations}</div>
            <div className="text-xs text-text-muted mt-0.5">推荐对接</div>
          </div>
          <div className="bg-surface-card border border-line rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success tabular-nums">
              {new Set(mockRecommendations.map(r => r.incubatorEnterprise)).size}
            </div>
            <div className="text-xs text-text-muted mt-0.5">涉及企业</div>
          </div>
        </div>

        {/* 推荐列表 */}
        <div className="space-y-4">
          {mockRecommendations.map(rec => {
            const signalConfig = signalTypeConfig[rec.signalType];
            const SignalIcon = signalConfig.icon;
            return (
              <div key={rec.id} className="bg-surface-card border border-line rounded-lg">
                {/* 信号头部 */}
                <div className="px-4 py-3 border-b border-line-light">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-tag px-1.5 py-0.5 rounded border flex items-center gap-1", signalConfig.cls)}>
                      <SignalIcon className="h-3 w-3" />
                      {signalConfig.label}
                    </span>
                    <span className="text-sm font-semibold text-text-primary">{rec.incubatorEnterprise}</span>
                    <span className="text-xs text-text-muted tabular-nums">{rec.signalTime}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1.5">{rec.signal}</p>
                </div>

                {/* 推荐伙伴 */}
                <div className="divide-y divide-line-light">
                  {rec.recommendations.map((r, i) => {
                    const key = `${rec.id}-${r.enterpriseId}`;
                    const isAccepted = acceptedKeys.has(key);
                    const isIgnored = ignoredKeys.has(key);

                    return (
                      <div key={i} className={cn("px-4 py-3 transition-colors", isIgnored && "opacity-50")}>
                        <div className="flex items-center justify-between hover:bg-surface-hover-row -mx-1 px-1 rounded cursor-pointer"
                          onClick={() => router.push(`/enterprises/${r.enterpriseId}`)}>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 bg-neutral-50 text-brand border border-line-light rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                              {r.enterpriseName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-text-primary">{r.enterpriseName}</span>
                                {isAccepted && <span className="text-tag px-1.5 py-0.5 bg-neutral-50 text-success rounded flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" />已采纳</span>}
                              </div>
                              <div className="text-xs text-text-muted mt-0.5 truncate">{r.reason}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <div className="text-right">
                              <div className={cn("text-sm font-bold tabular-nums",
                                r.matchScore >= 90 ? 'text-success' :
                                r.matchScore >= 70 ? 'text-brand' : 'text-warning'
                              )}>
                                {r.matchScore}%
                              </div>
                              <div className="text-tag text-text-muted">匹配度</div>
                            </div>
                          </div>
                        </div>
                        {/* 操作栏 */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-line-light pl-11">
                          <Button
                            variant="text"
                            size="sm"
                            icon={<Sparkles className="h-3 w-3" />}
                            onClick={() => sendChat(`请深度分析「${rec.incubatorEnterprise}」与「${r.enterpriseName}」的合作可行性，评估技术互补度、合作模式和风险。`)}
                          >
                            AI 分析合作可行性
                          </Button>
                          <div className="flex items-center gap-2">
                            {!isAccepted && !isIgnored && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleAccept(key)}>
                                  <CheckCircle2 className="h-3 w-3" /> 发起对接
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleIgnore(key)}>
                                  <XCircle className="h-3 w-3" /> 暂不
                                </Button>
                              </>
                            )}
                            {isIgnored && (
                              <Button variant="link" size="sm" onClick={() => { setIgnoredKeys(prev => { const n = new Set(prev); n.delete(key); return n; }); }}>
                                撤销
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
