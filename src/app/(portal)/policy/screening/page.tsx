/**
 * 订单匹配页 — AI 融入版
 * 
 * 改造点：
 * 1. 增加 AI 匹配入口（输入需求 → AI 匹配）
 * 2. 匹配结果标注 AI 生成状态
 * 3. 每条结果增加"AI 深度分析"按钮
 * 4. 增加采纳/忽略操作
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft, ChevronLeft, Award, MapPin, Zap, Lightbulb, ChevronRight, Filter, SortAsc,
  Sparkles, Bot, CheckCircle2, XCircle, Send, Search, Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchMatchResult } from '@/services/incubator';
import { sendChat, matchOrder } from '@/lib/host-api';
import { Button, PageSkeleton } from '@/components/ui';
import type { MatchResult } from '@/lib/schema';

export default function MatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [showResult, setShowResult] = useState(true); // demo 默认展示结果
  const [inputQuery, setInputQuery] = useState('');
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const data = await fetchMatchResult();
      setResult(data ?? null);
      setLoading(false);
    }
    load();
  }, []);

  // 模拟从小北传入的上下文
  const context = {
    query: "仪电有个智慧城市项目，需要AI视觉方案",
    source: "小北对话",
    timestamp: "10:30"
  };

  const handleNewMatch = () => {
    if (!inputQuery.trim()) return;
    matchOrder(inputQuery);
    setInputQuery('');
  };

  const handleAccept = (id: string) => {
    setAcceptedIds(prev => new Set([...prev, id]));
    setIgnoredIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleIgnore = (id: string) => {
    setIgnoredIds(prev => new Set([...prev, id]));
    setAcceptedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  if (loading) return <PageSkeleton />;
  if (!result) return null;

  return (
    <div className="min-h-full">
      {/* 头部 */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-3">
            <ChevronLeft className="h-3.5 w-3.5" />
            返回孵化管理
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-text-primary">AI 订单匹配</h1>
              <p className="text-xs text-text-muted mt-0.5">输入大企业需求，AI 自动在孵化企业中匹配能力</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* AI 匹配入口 */}
          <div className="bg-surface-card border border-line rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-[rgba(27,27,27,0.06)] rounded-lg">
                <Rocket className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-primary">发起新匹配</h2>
                <p className="text-tag text-text-muted">描述大企业需求，AI 将自动拆解并匹配孵化企业</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="例如：仪电有个智慧城市项目，需要AI视觉方案..."
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNewMatch()}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[rgba(27,27,27,0.06)] border border-line rounded-lg hover:border-line-hover focus:border-brand focus:outline-none transition-colors"
                />
              </div>
              <Button
                variant="primary"
                size="md"
                className="shrink-0"
                onClick={handleNewMatch}
              >
                <Sparkles className="h-4 w-4" /> AI 匹配
              </Button>
            </div>
          </div>

          {/* 已有匹配结果 */}
          {showResult && (
            <>
              {/* 需求上下文 + AI 标识 */}
              <div className="bg-[rgba(27,27,27,0.06)] border border-line-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-brand">当前需求</div>
                  <span className="flex items-center gap-1 text-tag text-brand bg-[rgba(27,27,27,0.06)] px-1.5 py-0.5 rounded border border-line-light">
                    <Bot className="h-3 w-3" /> AI 已分析 · 拆解为 {result.sub_tasks?.length || 0} 个子任务
                  </span>
                </div>
                <div className="text-base font-medium text-text-primary">&ldquo;{context.query}&rdquo;</div>
                {result.sub_tasks && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {result.sub_tasks.map(t => (
                      <span key={t} className="bg-surface-card text-brand px-2 py-1 rounded border border-line-light text-xs font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 匹配列表 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-text-primary">推荐企业 ({result.matches.length})</h2>
                    <span className="text-tag px-1.5 py-0.5 bg-[rgba(27,27,27,0.06)] text-brand rounded flex items-center gap-1">
                      <Bot className="h-3 w-3" /> AI 推荐
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">按匹配度排序</span>
                </div>

                {result.matches.map((m, i) => {
                  const isAccepted = acceptedIds.has(m.enterprise_id);
                  const isIgnored = ignoredIds.has(m.enterprise_id);

                  return (
                    <div key={m.enterprise_id} className={cn(
                      "bg-surface-card border rounded-lg p-4 transition-all",
                      isAccepted ? "border-success bg-[rgba(27,27,27,0.06)]" :
                      isIgnored ? "border-line opacity-50" :
                      "border-line hover:border-brand"
                    )}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                            i === 0 ? "bg-brand text-white" : "bg-[rgba(27,27,27,0.06)] text-text-muted"
                          )}>
                            {i + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-semibold text-text-primary">{m.name}</span>
                              {isAccepted && <span className="text-tag px-1.5 py-0.5 bg-[rgba(27,27,27,0.06)] text-success rounded flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" />已采纳</span>}
                              {isIgnored && <span className="text-tag px-1.5 py-0.5 bg-[rgba(27,27,27,0.06)] text-text-muted rounded">已忽略</span>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                              <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {m.location}</span>
                              <span>·</span>
                              <span className="flex items-center gap-0.5"><Zap className="h-3 w-3" /> 活跃度 {m.activity_score}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-11 sm:pl-0">
                          <div className="text-right">
                            <div className="text-lg font-bold text-brand font-mono">{m.match_score}%</div>
                            <div className="text-xs text-text-muted">匹配度</div>
                          </div>
                        </div>
                      </div>

                      {/* 匹配原因 */}
                      <div className="bg-[rgba(27,27,27,0.06)] rounded p-3 text-sm text-text-secondary leading-relaxed mb-3 border border-line-light">
                        <span className="font-semibold text-text-primary">匹配原因：</span>
                        {m.match_reason}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {m.products?.map(p => (
                          <span key={p} className="text-tag px-1.5 py-0.5 bg-[rgba(27,27,27,0.06)] text-text-muted rounded border border-line-light">{p}</span>
                        ))}
                      </div>

                      {/* 操作栏：AI 分析 + 采纳/忽略 */}
                      <div className="flex items-center justify-between pt-3 border-t border-line-light">
                        <button
                          className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                          onClick={() => sendChat(`请深度分析「${m.name}」与当前需求「${context.query}」的匹配可行性，包括技术能力评估、合作风险和建议对接方案。`)}
                        >
                          <Sparkles className="h-3.5 w-3.5" /> AI 深度分析
                        </button>
                        <div className="flex items-center gap-2">
                          {!isAccepted && !isIgnored && (
                            <>
                              <button
                                className="flex items-center gap-1 text-xs font-medium text-success bg-[rgba(27,27,27,0.06)] hover:opacity-90 px-3 py-1.5 rounded border border-line-light transition-colors"
                                onClick={() => handleAccept(m.enterprise_id)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> 采纳对接
                              </button>
                              <button
                                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary px-2 py-1.5"
                                onClick={() => handleIgnore(m.enterprise_id)}
                              >
                                <XCircle className="h-3.5 w-3.5" /> 忽略
                              </button>
                            </>
                          )}
                          {isAccepted && (
                            <div className="flex items-center gap-2">
                              <button
                                className="flex items-center gap-1 text-xs font-medium text-brand bg-[rgba(27,27,27,0.06)] hover:bg-surface-hover-btn px-3 py-1.5 rounded border border-line transition-colors"
                                onClick={() => sendChat(`请为「${m.name}」与需求方之间起草一封对接邮件，包含双方业务概况、合作切入点和建议会议时间。`)}
                              >
                                <Send className="h-3 w-3" /> 起草对接邮件
                              </button>
                              <button
                                className="flex items-center gap-1 text-xs font-medium text-success bg-[rgba(27,27,27,0.06)] hover:opacity-90 px-3 py-1.5 rounded border border-line-light transition-colors"
                                onClick={() => sendChat(`请安排与「${m.name}」的对接会议，生成会议议程和准备材料清单。`)}
                              >
                                安排见面
                              </button>
                              <button
                                className="flex items-center gap-1 text-xs text-text-muted hover:text-brand"
                                onClick={() => router.push(`/enterprises/${m.enterprise_id}`)}
                              >
                                企业详情 <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          {isIgnored && (
                            <button
                              className="text-xs text-text-muted hover:text-brand"
                              onClick={() => { setIgnoredIds(prev => { const n = new Set(prev); n.delete(m.enterprise_id); return n; }); }}
                            >
                              撤销忽略
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 组合建议 */}
              {result.combination_suggestion && (
                <div className="bg-surface-card border border-line rounded-lg p-5 border-l-4 border-l-warning">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-warning" />
                      <h3 className="text-sm font-semibold text-text-primary">AI 组合建议</h3>
                    </div>
                    <span className="flex items-center gap-1 text-tag text-brand bg-[rgba(27,27,27,0.06)] px-1.5 py-0.5 rounded">
                      <Bot className="h-3 w-3" /> AI 生成
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">
                    {result.combination_suggestion}
                  </p>
                  <button
                    className="flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
                    onClick={() => sendChat(`请对推荐组合方案进行深度可行性分析，评估技术互补性、项目协调复杂度和风险。`)}
                  >
                    <Sparkles className="h-3.5 w-3.5" /> AI 分析组合可行性
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
