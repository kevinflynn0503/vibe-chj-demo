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
import { useState } from 'react';
import {
  ArrowLeft, Award, MapPin, Zap, Lightbulb, ChevronRight, Filter, SortAsc,
  Sparkles, Bot, CheckCircle2, XCircle, Send, Search, Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockMatchResult } from '@/lib/mock-data';
import { sendChat, matchOrder } from '@/lib/host-api';

export default function MatchPage() {
  const router = useRouter();
  const [showResult, setShowResult] = useState(true); // demo 默认展示结果
  const [inputQuery, setInputQuery] = useState('');
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());

  // 模拟从小北传入的上下文
  const context = {
    query: "仪电有个智慧城市项目，需要AI视觉方案",
    source: "小北对话",
    timestamp: "10:30"
  };

  const result = mockMatchResult;

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

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回孵化管理
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900">AI 订单匹配</h1>
              <p className="text-xs text-slate-500 mt-0.5">输入大企业需求，AI 自动在孵化企业中匹配能力</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* AI 匹配入口 */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-violet-50 rounded-lg">
                <Rocket className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">发起新匹配</h2>
                <p className="text-[10px] text-slate-500">描述大企业需求，AI 将自动拆解并匹配孵化企业</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="例如：仪电有个智慧城市项目，需要AI视觉方案..."
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNewMatch()}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:border-[#3370FF] focus:outline-none transition-colors"
                />
              </div>
              <button
                className="btn btn-primary shrink-0 py-2.5 px-4"
                onClick={handleNewMatch}
              >
                <Sparkles className="h-4 w-4" /> AI 匹配
              </button>
            </div>
          </div>

          {/* 已有匹配结果 */}
          {showResult && (
            <>
              {/* 需求上下文 + AI 标识 */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-blue-600">当前需求</div>
                  <span className="flex items-center gap-1 text-[10px] text-[#3370FF] bg-blue-100 px-1.5 py-0.5 rounded">
                    <Bot className="h-3 w-3" /> AI 已分析 · 拆解为 {result.sub_tasks?.length || 0} 个子任务
                  </span>
                </div>
                <div className="text-base font-medium text-slate-900">&ldquo;{context.query}&rdquo;</div>
                {result.sub_tasks && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {result.sub_tasks.map(t => (
                      <span key={t} className="bg-white text-blue-600 px-2 py-1 rounded border border-blue-100 text-xs font-medium">
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
                    <h2 className="text-sm font-bold text-slate-900">推荐企业 ({result.matches.length})</h2>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-[#3370FF] rounded flex items-center gap-1">
                      <Bot className="h-3 w-3" /> AI 推荐
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">按匹配度排序</span>
                </div>

                {result.matches.map((m, i) => {
                  const isAccepted = acceptedIds.has(m.enterprise_id);
                  const isIgnored = ignoredIds.has(m.enterprise_id);

                  return (
                    <div key={m.enterprise_id} className={cn(
                      "bg-white border rounded-lg p-4 transition-all",
                      isAccepted ? "border-emerald-300 bg-emerald-50/30" :
                      isIgnored ? "border-slate-200 opacity-50" :
                      "border-slate-200 hover:border-[#3370FF]"
                    )}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                            i === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                          )}>
                            {i + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-slate-900">{m.name}</span>
                              {isAccepted && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" />已采纳</span>}
                              {isIgnored && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">已忽略</span>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {m.location}</span>
                              <span>·</span>
                              <span className="flex items-center gap-0.5"><Zap className="h-3 w-3" /> 活跃度 {m.activity_score}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-11 sm:pl-0">
                          <div className="text-right">
                            <div className="text-lg font-bold text-[#3370FF] font-mono">{m.match_score}%</div>
                            <div className="text-xs text-slate-400">匹配度</div>
                          </div>
                        </div>
                      </div>

                      {/* 匹配原因 */}
                      <div className="bg-slate-50 rounded p-3 text-sm text-slate-600 leading-relaxed mb-3 border border-slate-100">
                        <span className="font-semibold text-slate-900">匹配原因：</span>
                        {m.match_reason}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {m.products?.map(p => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100">{p}</span>
                        ))}
                      </div>

                      {/* 操作栏：AI 分析 + 采纳/忽略 */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <button
                          className="flex items-center gap-1 text-xs font-medium text-[#3370FF] hover:underline"
                          onClick={() => sendChat(`请深度分析「${m.name}」与当前需求「${context.query}」的匹配可行性，包括技术能力评估、合作风险和建议对接方案。`)}
                        >
                          <Sparkles className="h-3.5 w-3.5" /> AI 深度分析
                        </button>
                        <div className="flex items-center gap-2">
                          {!isAccepted && !isIgnored && (
                            <>
                              <button
                                className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded border border-emerald-200 transition-colors"
                                onClick={() => handleAccept(m.enterprise_id)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> 采纳对接
                              </button>
                              <button
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5"
                                onClick={() => handleIgnore(m.enterprise_id)}
                              >
                                <XCircle className="h-3.5 w-3.5" /> 忽略
                              </button>
                            </>
                          )}
                          {isAccepted && (
                            <div className="flex items-center gap-2">
                              <button
                                className="flex items-center gap-1 text-xs font-medium text-[#3370FF] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded border border-blue-200 transition-colors"
                                onClick={() => sendChat(`请为「${m.name}」与需求方之间起草一封对接邮件，包含双方业务概况、合作切入点和建议会议时间。`)}
                              >
                                <Send className="h-3 w-3" /> 起草对接邮件
                              </button>
                              <button
                                className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded border border-emerald-200 transition-colors"
                                onClick={() => sendChat(`请安排与「${m.name}」的对接会议，生成会议议程和准备材料清单。`)}
                              >
                                安排见面
                              </button>
                              <button
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#3370FF]"
                                onClick={() => router.push(`/enterprises/${m.enterprise_id}`)}
                              >
                                企业详情 <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          {isIgnored && (
                            <button
                              className="text-xs text-slate-500 hover:text-[#3370FF]"
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
                <div className="bg-white border border-slate-200 rounded-lg p-5 border-l-4 border-l-amber-400">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      <h3 className="text-sm font-bold text-slate-900">AI 组合建议</h3>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">
                      <Bot className="h-3 w-3" /> AI 生成
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                    {result.combination_suggestion}
                  </p>
                  <button
                    className="flex items-center gap-1.5 text-xs font-medium text-[#3370FF] hover:underline"
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
