/**
 * 订单匹配结果页
 * 
 * 统一规范：
 * - 头部：bg-white border-b → max-w-[1200px] mx-auto px-4 sm:px-6 py-4
 * - 返回按钮：text-xs text-slate-500 hover:text-[#3370FF], ArrowLeft h-3.5, mb-3
 * - 标题：text-lg font-bold text-slate-900
 * - 内容：max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6
 * - 背景：min-h-screen bg-[#F5F6F7]
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Award, MapPin, Zap, Lightbulb, ChevronRight, Filter, SortAsc
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockMatchResult } from '@/lib/mock-data';

export default function MatchPage() {
  const router = useRouter();

  // 模拟从小北传入的上下文
  const context = {
    query: "仪电有个智慧城市项目，需要AI视觉方案",
    source: "小北对话",
    timestamp: "10:30"
  };

  const result = mockMatchResult;

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 — 统一模板B */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回孵化管理
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900">匹配结果</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>来源: {context.source}</span>
                <span>·</span>
                <span>{context.timestamp}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="btn btn-default btn-sm">
                <Filter className="h-3.5 w-3.5" /> 筛选
              </button>
              <button className="btn btn-default btn-sm">
                <SortAsc className="h-3.5 w-3.5" /> 排序
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 内容 — 统一 max-w-[1200px]（内部用 max-w-3xl 居中匹配结果） */}
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* 需求上下文卡片 */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
            <div className="text-xs font-semibold text-blue-600 mb-1">当前需求</div>
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
              <h2 className="text-sm font-bold text-slate-900">推荐企业 ({result.matches.length})</h2>
              <span className="text-xs text-slate-500">按匹配度排序</span>
            </div>

            {result.matches.map((m, i) => (
              <div key={m.enterprise_id} className="bg-white border border-slate-200 rounded-lg p-4 hover:border-[#3370FF] transition-colors cursor-pointer" onClick={() => router.push(`/enterprises/${m.enterprise_id}`)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                      i === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-base font-bold text-slate-900">{m.name}</div>
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
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                </div>

                {/* 匹配原因 */}
                <div className="bg-slate-50 rounded p-3 text-sm text-slate-600 leading-relaxed mb-3 border border-slate-100">
                  <span className="font-semibold text-slate-900">匹配原因：</span>
                  {m.match_reason}
                </div>

                <div className="flex flex-wrap gap-2">
                  {m.products?.map(p => (
                    <span key={p} className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 组合建议 */}
          {result.combination_suggestion && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 border-l-4 border-l-amber-400">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">组合建议</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {result.combination_suggestion}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
