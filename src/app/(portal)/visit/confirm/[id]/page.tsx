/**
 * 走访记录确认页
 * 
 * 统一布局：bg-white border-b 头部 + 内容区
 * 左：Markdown 渲染（可切换编辑）  右：覆盖度面板
 */
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft, CheckCircle2, XCircle, Edit3, FileVideo,
  AlertCircle, Eye, FileText, Save, Bot, Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn, formatVisitRecordAsMarkdown } from '@/lib/utils';
import { fetchVisitRecord } from '@/services/visit';
import { VISIT_TYPE_LABELS } from '@/lib/schema';
import type { VisitType, VisitRecord } from '@/lib/schema';
import { sendChat } from '@/lib/host-api';
import { toast } from 'sonner';
import { Button, DetailSkeleton } from '@/components/ui';

export default function ConfirmPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<VisitRecord | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');

  useEffect(() => {
    async function load() {
      const data = await fetchVisitRecord(recordId);
      setRecord(data);
      if (data) setMarkdownContent(formatVisitRecordAsMarkdown(data));
      setLoading(false);
    }
    load();
  }, [recordId]);

  if (loading) return <DetailSkeleton />;

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted">未找到走访记录 {recordId}</p>
          <Button variant="default" size="sm" className="mt-3" onClick={() => router.back()}>返回</Button>
        </div>
      </div>
    );
  }

  const coverage = record.key_question_coverage;

  const handleConfirm = () => {
    toast.success('走访记录已确认入库');
    router.push('/visit/records');
  };

  const handleReject = () => {
    sendChat(`驳回走访记录 ${record.id},请重新从飞书妙记提取内容`);
    toast.info('已驳回,通知 Agent 重新提取');
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success('修改已保存');
  };

  return (
    <div className="min-h-full pb-10">
      {/* ═══ 头部 — 统一模式 ═══ */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-3.5 w-3.5" /> 返回走访看板
            </Button>
            <Button variant="default" size="sm" onClick={() => router.push(`/enterprises/${record.enterprise_id}`)}>
              <Eye className="h-3.5 w-3.5" /> 企业画像
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-text-primary">走访记录确认</h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                <span className="font-medium text-text-secondary">{record.enterprise_name}</span>
                <span>·</span>
                <span className="tabular-nums">{record.visit_date}</span>
                <span>·</span>
                <span>{record.visitor_name}</span>
                {record.visit_type && (
                  <>
                    <span>·</span>
                    <span className="text-tag px-1.5 py-0.5 bg-neutral-50 text-brand rounded">
                      {VISIT_TYPE_LABELS[record.visit_type as VisitType]}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 内容区 ═══ */}
      <div className="page-container space-y-6">
        {/* 来源提示 */}
        <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 border border-line rounded-[10px]">
          <FileVideo className="h-4 w-4 text-brand shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">数据来源: 飞书妙记 · AI 自动提取</p>
            <p className="text-tag text-brand mt-0.5">提取时间: {record.visit_date} · 准确率: 高</p>
          </div>
          {isEditing ? (
            <Button variant="primary" size="sm" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" /> 保存修改
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
              <Edit3 className="h-3.5 w-3.5" /> 编辑
            </Button>
          )}
        </div>

        {/* 主内容: 左 Markdown + 右覆盖度 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左: Markdown 内容 */}
          <div className="lg:col-span-2">
            <div className="bg-surface-card border border-line rounded-[10px] p-6">
              {isEditing ? (
                <textarea
                  value={markdownContent}
                  onChange={e => setMarkdownContent(e.target.value)}
                  className="w-full text-sm resize-none border border-line rounded-lg p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:border-brand"
                  style={{ minHeight: '500px' }}
                  placeholder="编辑 Markdown 内容..."
                />
              ) : (
                <div className="prose prose-slate prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdownContent}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          {/* 右: 覆盖度面板 */}
          <div className="space-y-4">
            {/* 走访对象 */}
            <div className="bg-surface-card border border-line rounded-[10px] p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">走访对象</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">姓名</span>
                  <span className="font-medium text-text-primary">{record.counterpart_name ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">职位</span>
                  <span className="font-medium text-text-primary">{record.counterpart_title ?? '-'}</span>
                </div>
              </div>
            </div>

            {/* 赛道问题覆盖 */}
            {coverage?.track_questions && (
              <div className="bg-surface-card border border-line rounded-[10px] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">赛道问题覆盖</h3>
                  <span className="flex items-center gap-0.5 text-tag text-brand bg-neutral-50 px-1.5 py-0.5 rounded">
                    <Bot className="h-3 w-3" /> AI 检测
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={cn(
                    'text-2xl font-bold tabular-nums',
                    coverage.track_questions.covered === coverage.track_questions.total
                      ? 'text-success' : 'text-warning'
                  )}>
                    {coverage.track_questions.covered}
                  </span>
                  <span className="text-text-muted">/</span>
                  <span className="text-lg font-semibold text-text-muted">
                    {coverage.track_questions.total}
                  </span>
                </div>
                <div className="h-1.5 bg-neutral-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${(coverage.track_questions.covered / coverage.track_questions.total) * 100}%` }}
                  />
                </div>
                {coverage.track_questions.missed.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-tag font-medium text-warning">缺失问题:</p>
                    {coverage.track_questions.missed.map((q, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                        <AlertCircle className="h-3 w-3 text-warning shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 政策问题覆盖 */}
            {coverage?.policy_questions && (
              <div className="bg-surface-card border border-line rounded-[10px] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">政策问题覆盖</h3>
                  <span className="flex items-center gap-0.5 text-tag text-brand bg-neutral-50 px-1.5 py-0.5 rounded">
                    <Bot className="h-3 w-3" /> AI 检测
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={cn(
                    'text-2xl font-bold tabular-nums',
                    coverage.policy_questions.covered === coverage.policy_questions.total
                      ? 'text-success' : 'text-warning'
                  )}>
                    {coverage.policy_questions.covered}
                  </span>
                  <span className="text-text-muted">/</span>
                  <span className="text-lg font-semibold text-text-muted">
                    {coverage.policy_questions.total}
                  </span>
                </div>
                <div className="h-1.5 bg-neutral-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all"
                    style={{ width: `${(coverage.policy_questions.covered / coverage.policy_questions.total) * 100}%` }}
                  />
                </div>
                {coverage.policy_questions.missed.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-tag font-medium text-warning">缺失问题:</p>
                    {coverage.policy_questions.missed.map((q, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                        <AlertCircle className="h-3 w-3 text-warning shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="bg-surface-card border border-line rounded-[10px] p-4 flex items-center justify-between sticky bottom-4"
          style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02)' }}>
          <div className="flex items-center gap-2">
            {record.is_confirmed ? (
              <span className="flex items-center gap-1.5 text-success text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                已确认入库
              </span>
            ) : (
              <span className="text-xs text-text-muted">
                审核 AI 提取内容后确认入库
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" onClick={handleReject}>
              <XCircle className="h-3.5 w-3.5" /> 驳回重提
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirm}>
              <CheckCircle2 className="h-3.5 w-3.5" /> 确认入库
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
