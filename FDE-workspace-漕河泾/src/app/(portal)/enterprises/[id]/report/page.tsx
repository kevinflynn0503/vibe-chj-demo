/**
 * 背调报告页 — 统一模板B
 * 左：报告章节  右：沟通清单（谈话提纲 + 必问问题 + 洞察）
 */
'use client';

import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, ExternalLink, FileText, MessageCircle,
  HelpCircle, Lightbulb, CheckCircle2, BookOpen, Sparkles, Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBackgroundReport, getEnterprise } from '@/lib/mock-data';
import { exportToFeishu, sendChat } from '@/lib/host-api';

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const report = getBackgroundReport(id);
  const enterprise = getEnterprise(id);
  const name = enterprise?.short_name ?? enterprise?.name ?? id;

  if (!report) {
    return (
      <div className="min-h-screen bg-[#F5F6F7] flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">暂无背调报告</p>
          <p className="text-xs text-slate-400 mt-1">可在企业详情页点击「生成背调」创建</p>
          <button className="btn btn-primary btn-sm mt-4" onClick={() => router.back()}>返回</button>
        </div>
      </div>
    );
  }

  const sections = Object.values(report.report_content);
  const checklist = report.communication_checklist;

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 — 统一模板B */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回企业详情
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{name} · 背调报告</h1>
                <span className="flex items-center gap-1 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">
                  <Bot className="h-3 w-3" /> AI 生成
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-mono">{report.created_at.split('T')[0]}</span>
                {report.created_by && <span>· {report.created_by}</span>}
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded border',
                  report.status === 'published'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                )}>
                  {report.status === 'published' ? '已发布' : '草稿'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {report.feishu_doc_url && (
                <button className="btn btn-default btn-sm" onClick={() => window.open(report.feishu_doc_url)}>
                  <ExternalLink className="h-3.5 w-3.5" /> 飞书文档
                </button>
              )}
              <button className="btn btn-default btn-sm" onClick={() => exportToFeishu(name, '背调报告')}>
                <BookOpen className="h-3.5 w-3.5" /> 导出
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => sendChat(`请基于「${name}」的背调报告进行深度分析：评估企业核心竞争力、投资价值、潜在合作点和风险因素。`)}>
                <Sparkles className="h-3.5 w-3.5" /> AI 深度分析
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 内容 — 两栏：报告 + 沟通清单 */}
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* 左：报告章节 (3/5) */}
          <div className="lg:col-span-3 space-y-4">
            {sections.map((section, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">{section.title}</h2>
                  {section.source && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100">{section.source}</span>
                  )}
                </div>
                <div className="px-4 py-4 text-sm leading-relaxed whitespace-pre-line text-slate-600">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* 右：沟通清单 (2/5) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="sticky top-4 space-y-4">

              {/* 话术要点 */}
              {checklist && checklist.talking_points.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-[#3370FF]" />
                    <h3 className="text-sm font-bold text-slate-900">话术要点</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {checklist.talking_points.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 必问问题 */}
              {checklist && checklist.must_ask_questions.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900">必问问题</h3>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-100">{checklist.must_ask_questions.length} 项</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {checklist.must_ask_questions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="shrink-0 w-4 h-4 rounded bg-amber-50 text-amber-600 text-[10px] font-bold flex items-center justify-center border border-amber-100">{i + 1}</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 关键洞察 */}
              {checklist && checklist.key_insights.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-[#3370FF]" />
                    <h3 className="text-sm font-bold text-slate-900">关键洞察</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {checklist.key_insights.map((ins, i) => (
                      <div key={i} className="p-3 rounded-lg text-xs text-slate-700 bg-blue-50/50 border border-blue-100 leading-relaxed">
                        {ins}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
