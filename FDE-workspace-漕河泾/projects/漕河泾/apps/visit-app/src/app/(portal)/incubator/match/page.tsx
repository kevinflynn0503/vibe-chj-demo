/**
 * 订单匹配 — AI 对话式匹配
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Send, MapPin, Zap, Network, Sparkles, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChatMessages } from '@/lib/mock-data';
import type { ChatMessage, MatchItem } from '@/lib/schema';

/* ── 用户消息 ── */
function UserMsg({ content }: { content: string }) {
  return (
    <div className="flex justify-end animate-fade-in-up">
      <div className="max-w-[75%] rounded-2xl rounded-br-md grad-purple px-5 py-3.5 text-[13px] font-medium text-white shadow-lg shadow-purple-500/20">
        {content}
      </div>
    </div>
  );
}

/* ── AI 消息 ── */
function AiMsg({ message }: { message: ChatMessage }) {
  return (
    <div className="flex items-start gap-3 animate-fade-in-up">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm">
        <Bot className="h-4 w-4 text-slate-500" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-gray-100 bg-white px-5 py-4 shadow-card">
        <div className="space-y-1.5 text-[13px] text-gray-700 leading-relaxed">
          {message.content.split('\n').filter(Boolean).map((l, i) => {
            if (l.includes('→') && l.includes('匹配')) return <p key={i} className="font-bold text-gray-900">{l.replace(/\*\*/g, '')}</p>;
            if (l.includes('推荐组合')) return (
              <div key={i} className="mt-3 rounded-xl border border-purple-100 bg-purple-50/50 px-4 py-3 text-[13px] font-semibold text-purple-700">
                {l.replace(/\*\*/g, '').replace(/📌\s*/, '')}
              </div>
            );
            if (l === '---') return <hr key={i} className="my-3 border-gray-100" />;
            return <p key={i} className="text-gray-500">{l.replace(/\*\*/g, '')}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

/* ── 匹配卡片 ── */
function MatchCard({ item, rank }: { item: MatchItem; rank: number }) {
  const scoreColor = item.match_score >= 80 ? 'text-emerald-600' : item.match_score >= 60 ? 'text-blue-600' : 'text-amber-600';
  const scoreBg = item.match_score >= 80 ? 'bg-emerald-50' : item.match_score >= 60 ? 'bg-blue-50' : 'bg-amber-50';
  const scoreBar = item.match_score >= 80 ? 'bg-emerald-500' : item.match_score >= 60 ? 'bg-blue-500' : 'bg-amber-500';

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-px">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className={cn(
            'flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-extrabold',
            rank <= 2 ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-100 text-gray-400'
          )}>
            {rank}
          </span>
          <div>
            <h4 className="text-[14px] font-bold text-gray-900">{item.name}</h4>
            {item.sub_task && <p className="mt-0.5 text-[11px] text-gray-400">对接: {item.sub_task}</p>}
          </div>
        </div>
        <div className={cn('rounded-xl px-3 py-2 text-center', scoreBg)}>
          <p className={cn('text-[20px] font-extrabold tabular-nums leading-none', scoreColor)}>{item.match_score}</p>
          <p className="mt-0.5 text-[9px] font-medium text-gray-400">匹配度</p>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
        <div className={cn('h-1.5 rounded-full transition-all duration-1000', scoreBar)} style={{ width: `${item.match_score}%` }} />
      </div>

      <p className="mt-3 text-[12px] text-gray-400 leading-relaxed">{item.match_reason}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-600">
          <Zap className="h-2.5 w-2.5" />活跃度 {item.activity_score}
        </span>
        <span className="flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-500">
          <MapPin className="h-2.5 w-2.5" />{item.location}
        </span>
        {item.products?.map(p => (
          <span key={p} className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-600">{p}</span>
        ))}
      </div>
    </div>
  );
}

/* ── 主页面 ── */
export default function MatchPage() {
  const router = useRouter();
  const msgs = getChatMessages();
  const [input, setInput] = useState('');
  const lastAi = [...msgs].reverse().find(m => m.role === 'assistant');
  const result = lastAi?.match_result;

  return (
    <div className="flex h-full flex-col">
      {/* 面包屑 */}
      <div className="shrink-0 border-b border-gray-100 bg-white px-8 py-3">
        <button onClick={() => router.push('/incubator')} className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
          <ArrowLeft className="h-3.5 w-3.5" />
          孵化器管理
          <span className="text-gray-200">/</span>
          <span className="font-semibold text-gray-900">AI 订单匹配</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧对话 */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="mx-auto max-w-2xl space-y-5">
              {msgs.length === 0 && (
                <div className="py-20 text-center animate-fade-in-up">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl grad-purple shadow-lg shadow-purple-500/20">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-[18px] font-extrabold text-gray-900">订单 / 资源智能匹配</h2>
                  <p className="mt-2 text-[13px] text-gray-400">描述需求，AI 帮你匹配最适合的孵化企业</p>
                  <div className="mx-auto mt-8 max-w-sm space-y-3">
                    {['仪电集团有个自动洗车项目，谁能做？', '哪些企业可以给蔚来供应传感器？'].map(q => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="block w-full rounded-2xl border border-gray-100 bg-white px-5 py-4 text-left text-[13px] font-medium text-gray-700 transition-all duration-200 hover:border-purple-100 hover:shadow-card-hover hover:-translate-y-px cursor-pointer"
                      >
                        <span className="text-purple-500 mr-2">→</span>{q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {msgs.map(m => m.role === 'user'
                ? <UserMsg key={m.id} content={m.content} />
                : <AiMsg key={m.id} message={m} />
              )}
            </div>
          </div>

          {/* 输入区 */}
          <div className="shrink-0 border-t border-gray-100 bg-white px-8 py-4">
            <div className="mx-auto flex max-w-2xl items-center gap-3">
              <input
                type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder="描述你的需求…"
                className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-[13px] text-gray-900 outline-none placeholder:text-gray-300 transition-all duration-200 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
              />
              <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl grad-purple text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:shadow-purple-500/30 hover:scale-[1.03] cursor-pointer">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 右侧结果面板 */}
        {result && (
          <div className="w-[400px] shrink-0 overflow-y-auto border-l border-gray-100 bg-gray-50/50">
            <div className="border-b border-gray-100 bg-white px-6 py-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg grad-purple shadow-md shadow-purple-500/20">
                  <Network className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900">匹配结果</h3>
                  <p className="text-[11px] text-gray-400">{result.matches.length} 家企业匹配</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-4">
              {result.combination_suggestion && (
                <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-card">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-purple-500">推荐组合</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-gray-600">{result.combination_suggestion}</p>
                </div>
              )}
              {result.matches.map((item, i) => (
                <MatchCard key={item.enterprise_id} item={item} rank={i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
