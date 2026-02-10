/**
 * 订单匹配页 — 对话 + 匹配结果
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Send,
  Link2,
  MapPin,
  Zap,
  Package,
  Network,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChatMessages } from '@/lib/mock-data';
import type { ChatMessage, MatchItem } from '@/lib/schema';

/* ──── 对话气泡 ──── */

function UserMsg({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-lg rounded-br-sm bg-purple-700 px-4 py-3 text-[13px] leading-relaxed text-white shadow-sm">
        {content}
      </div>
    </div>
  );
}

function AiMsg({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-lg rounded-bl-sm border border-border bg-card px-4 py-3 shadow-subtle">
        <div className="space-y-2 text-[13px] leading-relaxed text-foreground">
          {message.content.split('\n').filter(Boolean).map((line, i) => {
            if (line.includes('→') && line.includes('匹配到')) return <p key={i} className="font-medium">{line.replace(/\*\*/g, '')}</p>;
            if (line.includes('推荐组合')) return (
              <div key={i} className="mt-2 rounded-lg border border-purple-200 bg-purple-50/60 px-3.5 py-2.5 text-[13px] font-medium text-purple-800">
                {line.replace(/\*\*/g, '').replace(/📌\s*/, '')}
              </div>
            );
            if (line === '---') return <hr key={i} className="my-2 border-border" />;
            return <p key={i}>{line.replace(/\*\*/g, '')}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

/* ──── 匹配卡片 ──── */

function MatchCard({ item, rank }: { item: MatchItem; rank: number }) {
  const scoreColor = item.match_score >= 80 ? 'text-emerald-600' : item.match_score >= 60 ? 'text-blue-600' : 'text-amber-600';

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-subtle transition-all duration-200 hover:shadow-elevated hover:-translate-y-px">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className={cn('flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold tabular-nums', rank <= 2 ? 'bg-purple-700 text-white' : 'bg-muted text-muted-foreground')}>
            {rank}
          </span>
          <div>
            <h4 className="text-[13px] font-semibold text-foreground">{item.name}</h4>
            {item.sub_task && <p className="mt-0.5 text-[11px] text-muted-foreground">对接: {item.sub_task}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className={cn('text-lg font-bold tabular-nums', scoreColor)}>{item.match_score}</p>
          <p className="text-[10px] text-muted-foreground">匹配度</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{item.match_reason}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className={cn('flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]',
          item.activity_score >= 80 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-border bg-muted text-muted-foreground'
        )}>
          <Zap className="h-2.5 w-2.5" />{item.activity_score}
        </span>
        <span className="flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5" />{item.location}
        </span>
        {item.products?.map(p => (
          <span key={p} className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            <Package className="h-2.5 w-2.5" />{p}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ──── 引导 ──── */

function EmptyGuide({ onSelect }: { onSelect: (q: string) => void }) {
  const qs = [
    '仪电集团有个自动洗车项目，谁能做？',
    '芯视科技刚完成融资，有什么合作机会？',
    '哪些企业可以给蔚来供应传感器？',
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
        <Network className="h-6 w-6 text-purple-600" />
      </div>
      <h2 className="text-sm font-semibold text-foreground">订单 / 资源智能匹配</h2>
      <p className="mt-1 text-xs text-muted-foreground">描述需求，AI 拆解子任务并匹配孵化企业</p>
      <div className="mt-6 w-full max-w-sm space-y-2">
        {qs.map(q => (
          <button key={q} onClick={() => onSelect(q)}
            className="block w-full rounded-lg border border-border bg-card px-4 py-2.5 text-left text-[13px] text-foreground shadow-subtle transition-all duration-150 hover:border-purple-200 hover:bg-purple-50/30 hover:shadow-elevated hover:-translate-y-px">
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ──── 主页面 ──── */

export default function MatchPage() {
  const router = useRouter();
  const msgs = getChatMessages();
  const [inputValue, setInputValue] = useState('');
  const lastAi = [...msgs].reverse().find(m => m.role === 'assistant');
  const matchResult = lastAi?.match_result;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="shrink-0 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />运营概览
            </button>
            <span className="text-xs text-border">/</span>
            <span className="text-xs font-medium text-foreground">订单匹配</span>
          </div>
          {matchResult && (
            <button className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-3 text-xs text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground">
              <Network className="h-3 w-3" />查看关系图
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧对话 */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="mx-auto max-w-2xl space-y-4">
              {msgs.length === 0 && <EmptyGuide onSelect={q => setInputValue(q)} />}
              {msgs.map(m => m.role === 'user' ? <UserMsg key={m.id} content={m.content} /> : <AiMsg key={m.id} message={m} />)}
            </div>
          </div>
          <div className="shrink-0 border-t bg-card px-8 py-3">
            <div className="mx-auto flex max-w-2xl items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="描述需求，如: A企业有个XX项目，谁能做？"
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                onKeyDown={e => { if (e.key === 'Enter') { /* TODO */ } }}
              />
              <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-700 text-white shadow-sm transition-all duration-150 hover:bg-purple-800 hover:-translate-y-px active:translate-y-0">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 右侧匹配结果 */}
        {matchResult && (
          <div className="w-[380px] shrink-0 overflow-y-auto border-l bg-card">
            <div className="flex items-center gap-2 border-b px-5 py-3">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <h3 className="text-xs font-semibold text-foreground">匹配结果</h3>
                <p className="text-[11px] text-muted-foreground">{matchResult.matches.length} 家企业</p>
              </div>
            </div>
            <div className="space-y-4 p-4">
              {matchResult.combination_suggestion && (
                <div className="rounded-lg border border-purple-200 bg-purple-50/50 px-4 py-3 shadow-subtle">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-purple-700">推荐组合</p>
                  <p className="mt-1 text-xs leading-relaxed text-purple-800">{matchResult.combination_suggestion}</p>
                </div>
              )}
              {matchResult.matches.map((item, i) => <MatchCard key={item.enterprise_id} item={item} rank={i + 1} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
