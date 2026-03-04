/**
 * 背调报告页 — 统一模板B
 * 左：报告章节  右：沟通清单（谈话提纲 + 必问问题 + 洞察）
 */
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ChevronLeft, ExternalLink, FileText, MessageCircle,
  HelpCircle, Lightbulb, CheckCircle2, BookOpen, Sparkles, Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchBackgroundReport, fetchEnterprise } from '@/services/enterprise';
import { exportToFeishu, sendChat } from '@/lib/host-api';
import { DetailSkeleton, Button } from '@/components/ui';

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Awaited<ReturnType<typeof fetchBackgroundReport>>>(undefined);
  const [enterprise, setEnterprise] = useState<Awaited<ReturnType<typeof fetchEnterprise>>>(undefined);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [rep, ent] = await Promise.all([
          fetchBackgroundReport(id),
          fetchEnterprise(id),
        ]);
        if (!cancelled) {
          setReport(rep);
          setEnterprise(ent);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const name = enterprise?.short_name ?? enterprise?.name ?? id;

  if (loading) return <DetailSkeleton />;

  if (!report) {
    return (
      <div className="min-h-screen bg-surface-card flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted">暂无背调报告</p>
          <p className="text-xs text-text-muted mt-1">可在企业详情页点击「生成背调」创建</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => router.back()}>返回</Button>
        </div>
      </div>
    );
  }

  const sections = Object.values(report.report_content);
  const checklist = report.communication_checklist;

  return (
    <div className="min-h-full">
      {/* 头部 — 统一模板B */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-3">
            <ChevronLeft className="h-3.5 w-3.5" /> 返回企业详情
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-text-primary">{name} · 背调报告</h1>
                <span className="flex items-center gap-1 text-tag text-brand bg-[rgba(27,27,27,0.06)] px-1.5 py-0.5 rounded">
                  <Bot className="h-3 w-3" /> AI 生成
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                <span className="font-mono">{report.created_at.split('T')[0]}</span>
                {report.created_by && <span>· {report.created_by}</span>}
                <span className={cn(
                  'text-tag px-1.5 py-0.5 rounded border',
                  report.status === 'published'
                    ? 'bg-success-light text-success border-line-light'
                    : 'bg-warning-light text-warning border-line-light'
                )}>
                  {report.status === 'published' ? '已发布' : '草稿'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {report.feishu_doc_url && (
                <Button size="sm" onClick={() => window.open(report.feishu_doc_url)}
                  icon={<ExternalLink className="h-3.5 w-3.5" />}>
                  飞书文档
                </Button>
              )}
              <Button size="sm" onClick={() => exportToFeishu(name, '背调报告')}
                icon={<BookOpen className="h-3.5 w-3.5" />}>
                导出
              </Button>
              <Button variant="primary" size="sm" onClick={() => sendChat(`请基于「${name}」的背调报告进行深度分析：评估企业核心竞争力、投资价值、潜在合作点和风险因素。`)}
                icon={<Sparkles className="h-3.5 w-3.5" />}>
                AI 深度分析
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 内容 — 两栏：报告 + 沟通清单 */}
      <div className="page-container space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* 左：报告章节 (3/5) */}
          <div className="lg:col-span-3 space-y-4">
            {sections.map((section, i) => (
              <div key={i} className="bg-surface-card border border-line rounded-lg">
                <div className="px-4 py-3 border-b border-line flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-text-primary">{section.title}</h2>
                  {section.source && (
                    <span className="text-tag px-1.5 py-0.5 bg-[rgba(27,27,27,0.06)] text-text-muted rounded border border-line">{section.source}</span>
                  )}
                </div>
                <div className="px-4 py-4 text-sm leading-relaxed whitespace-pre-line text-text-secondary">
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
                <div className="bg-surface-card border border-line rounded-lg">
                  <div className="px-4 py-3 border-b border-line flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-brand" />
                    <h3 className="text-sm font-semibold text-text-primary">话术要点</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {checklist.talking_points.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 必问问题 */}
              {checklist && checklist.must_ask_questions.length > 0 && (
                <div className="bg-surface-card border border-line rounded-lg">
                  <div className="px-4 py-3 border-b border-line flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-warning" />
                    <h3 className="text-sm font-semibold text-text-primary">必问问题</h3>
                    <span className="text-tag px-1.5 py-0.5 bg-warning-light text-warning rounded border border-line-light">{checklist.must_ask_questions.length} 项</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {checklist.must_ask_questions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className="shrink-0 w-4 h-4 rounded bg-warning-light text-warning text-tag font-bold flex items-center justify-center border border-line-light">{i + 1}</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 关键洞察 */}
              {checklist && checklist.key_insights.length > 0 && (
                <div className="bg-surface-card border border-line rounded-lg">
                  <div className="px-4 py-3 border-b border-line flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-brand" />
                    <h3 className="text-sm font-semibold text-text-primary">关键洞察</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {checklist.key_insights.map((ins, i) => (
                      <div key={i} className="p-3 rounded-lg text-xs text-text-secondary bg-[rgba(27,27,27,0.06)] border border-line leading-relaxed">
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
