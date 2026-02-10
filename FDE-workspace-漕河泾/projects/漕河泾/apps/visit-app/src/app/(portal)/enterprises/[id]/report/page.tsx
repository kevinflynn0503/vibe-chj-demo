/**
 * 背调报告页
 */
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink, RefreshCw, Loader2, FileText, Lightbulb, MessageSquare, CheckSquare, FileOutput } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEnterprise, getBackgroundReport } from '@/lib/mock-data';
import type { ReportSection, CommunicationChecklist } from '@/lib/schema';

function Block({ section, index, defaultOpen }: { section: ReportSection; index: number; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const srcMap: Record<string, string> = { '企业数据库': 'bg-[#3370ff]/5 text-[#3370ff] border-[#3370ff]/20', '企查查': 'bg-[#34c724]/5 text-[#34c724] border-[#34c724]/20', 'deep research': 'bg-[#7b67ee]/5 text-[#7b67ee] border-[#7b67ee]/20', '走访记录': 'bg-[#ff7d00]/5 text-[#ff7d00] border-[#ff7d00]/20' };
  const srcCls = Object.entries(srcMap).find(([k]) => (section.source ?? '').includes(k))?.[1] ?? 'bg-[#f0f1f5] text-[#8f959e] border-[#dee0e3]';

  return (
    <div className="rounded-lg border border-[#dee0e3] bg-white">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-[#f5f6f8]/50">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-[#f0f1f5] text-[10px] font-bold text-[#8f959e]">{index}</span>
          <h3 className="text-[13px] font-medium text-[#1f2329]">{section.title.replace(/^[一二三四五六七八九十]+、/, '')}</h3>
        </div>
        <div className="flex items-center gap-2">
          {section.source && <span className={cn('rounded border px-1.5 py-0.5 text-[10px]', srcCls)}>{section.source}</span>}
          {open ? <ChevronUp className="h-4 w-4 text-[#8f959e]" /> : <ChevronDown className="h-4 w-4 text-[#8f959e]" />}
        </div>
      </button>
      {open && <div className="border-t border-[#f0f1f5] px-4 py-3.5 space-y-1 text-[13px] leading-relaxed text-[#1f2329]">
        {section.content.split('\n').filter(Boolean).map((l, i) => <p key={i}>{l.replace(/\*\*/g, '')}</p>)}
      </div>}
    </div>
  );
}

function Checklist({ c }: { c: CommunicationChecklist }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#ffc440]/30 bg-[#fef8e8]">
        <div className="flex items-center gap-2 border-b border-[#ffc440]/20 px-4 py-2.5">
          <Lightbulb className="h-3.5 w-3.5 text-[#dc8c07]" />
          <h4 className="text-[11px] font-semibold text-[#6b5700]">关键洞察</h4>
        </div>
        <div className="space-y-1.5 px-4 py-3">{c.key_insights.map((ins, i) => <p key={i} className="text-[13px] text-[#6b5700]">{ins.replace(/^⚡\s*/, '')}</p>)}</div>
      </div>
      <div className="rounded-lg border border-[#dee0e3] bg-white">
        <div className="flex items-center gap-2 border-b border-[#f0f1f5] px-4 py-2.5">
          <MessageSquare className="h-3.5 w-3.5 text-[#8f959e]" />
          <h4 className="text-[11px] font-semibold text-[#646a73]">谈话提纲</h4>
        </div>
        <div className="divide-y divide-[#f0f1f5]">{c.talking_points.map((p, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#3370ff]/10 text-[10px] font-bold text-[#3370ff]">{i+1}</span>
            <p className="text-[13px] text-[#1f2329]">{p}</p>
          </div>
        ))}</div>
      </div>
      <div className="rounded-lg border border-[#3370ff]/20 bg-[#3370ff]/[0.03]">
        <div className="flex items-center gap-2 border-b border-[#3370ff]/10 px-4 py-2.5">
          <CheckSquare className="h-3.5 w-3.5 text-[#3370ff]" />
          <h4 className="text-[11px] font-semibold text-[#3370ff]">必问问题</h4>
        </div>
        <div className="divide-y divide-[#3370ff]/10">{c.must_ask_questions.map((q, i) => {
          const m = q.match(/^\[(.+?)\]\s*/); const tag = m?.[1]; const text = m ? q.slice(m[0].length) : q;
          return (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-[#dee0e3] text-[#3370ff]" />
              <div>{tag && <span className="mb-0.5 inline-block rounded bg-white px-1.5 py-0.5 text-[10px] text-[#8f959e]">{tag}</span>}<p className="text-[13px] text-[#1f2329]">{text}</p></div>
            </div>
          );
        })}</div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const enterprise = getEnterprise(id);
  const report = getBackgroundReport(id);
  if (!enterprise) return <div className="flex h-full items-center justify-center"><p className="text-[13px] text-[#8f959e]">企业不存在</p></div>;
  const sections = report ? Object.values(report.report_content) : [];

  return (
    <div className="min-h-full bg-[#f5f6f8]">
      <div className="border-b border-[#dee0e3] bg-white px-8 py-4">
        <button onClick={() => router.push(`/enterprises/${id}`)} className="mb-2 flex items-center gap-1.5 text-[12px] text-[#8f959e] hover:text-[#646a73]"><ArrowLeft className="h-3.5 w-3.5" />{enterprise.short_name ?? enterprise.name}</button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-[#1f2329]">背调报告 — {enterprise.short_name ?? enterprise.name}</h1>
            {report && <p className="mt-0.5 text-[11px] text-[#8f959e]">{report.created_by} · {new Date(report.created_at).toLocaleString('zh-CN')} · <span className={report.status === 'published' ? 'text-[#34c724]' : 'text-[#8f959e]'}>{report.status === 'published' ? '已发布' : '草稿'}</span></p>}
          </div>
          <div className="flex gap-2">
            {report?.feishu_doc_url && <a href={report.feishu_doc_url} target="_blank" rel="noopener noreferrer" className="flex h-8 items-center gap-1.5 rounded-md border border-[#dee0e3] px-3 text-[12px] text-[#646a73] hover:bg-[#f5f6f8]"><ExternalLink className="h-3.5 w-3.5" />在飞书中打开</a>}
            <button className="flex h-8 items-center gap-1.5 rounded-md border border-[#dee0e3] px-3 text-[12px] text-[#646a73] hover:bg-[#f5f6f8]"><FileOutput className="h-3.5 w-3.5" />导出</button>
            <button className="flex h-8 items-center gap-1.5 rounded-md bg-[#3370ff] px-3 text-[12px] font-medium text-white hover:bg-[#245bdb]"><RefreshCw className="h-3.5 w-3.5" />重新生成</button>
          </div>
        </div>
      </div>
      <div className="px-8 py-5">
        {!report && <div className="mx-auto max-w-lg rounded-lg border border-[#dee0e3] bg-white py-20 text-center"><FileText className="mx-auto mb-3 h-8 w-8 text-[#dee0e3]" /><p className="text-[13px] text-[#8f959e]">尚未生成背调报告</p><button className="mt-4 rounded-md bg-[#3370ff] px-4 py-2 text-[13px] text-white hover:bg-[#245bdb]">立即生成</button></div>}
        {report?.status === 'generating' && <div className="mx-auto max-w-lg rounded-lg border border-[#dee0e3] bg-white py-20 text-center"><Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#3370ff]" /><p className="text-[13px] text-[#1f2329]">正在生成…</p></div>}
        {report && report.status !== 'generating' && (
          <div className="grid grid-cols-[1fr_340px] gap-6">
            <div className="space-y-3">{sections.map((s, i) => <Block key={i} section={s} index={i+1} defaultOpen={i<2} />)}</div>
            <div className="sticky top-4 self-start">{report.communication_checklist && <Checklist c={report.communication_checklist} />}</div>
          </div>
        )}
      </div>
    </div>
  );
}
