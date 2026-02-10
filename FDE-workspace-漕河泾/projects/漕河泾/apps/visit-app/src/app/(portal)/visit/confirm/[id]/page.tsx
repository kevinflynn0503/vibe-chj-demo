/**
 * 走访记录确认页 — Markdown 文档风格
 * 左:Markdown 渲染(可切换编辑)  右:覆盖度面板
 */
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Edit3, FileVideo, AlertCircle, Eye, FileText, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn, formatVisitRecordAsMarkdown } from '@/lib/utils';
import { getVisitRecords } from '@/lib/mock-data';
import { VISIT_TYPE_LABELS } from '@/lib/schema';
import type { VisitType } from '@/lib/schema';
import { sendChat } from '@/lib/host-api';
import { toast } from 'sonner';

export default function ConfirmPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;

  const records = getVisitRecords();
  const record = records.find(r => r.id === recordId);

  const [isEditing, setIsEditing] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(
    record ? formatVisitRecordAsMarkdown(record) : ''
  );

  if (!record) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="card p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-6">未找到走访记录 {recordId}</p>
            <button className="btn btn-default" onClick={() => router.back()}>返回</button>
          </div>
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
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* 顶部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="btn btn-ghost">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">走访记录确认</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                <span className="font-medium text-slate-700">{record.enterprise_name}</span>
                <span>·</span>
                <span className="font-mono">{record.visit_date}</span>
                <span>·</span>
                <span>{record.visitor_name}</span>
                {record.visit_type && (
                  <>
                    <span>·</span>
                    <span className="tag tag-blue">{VISIT_TYPE_LABELS[record.visit_type as VisitType]}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            className="btn btn-default"
            onClick={() => router.push(`/enterprises/${record.enterprise_id}`)}
          >
            <Eye className="h-4 w-4" /> 企业画像
          </button>
        </div>

        {/* 来源提示 */}
        <div className="flex items-center gap-3 px-6 py-4 bg-blue-50 border border-blue-200 rounded-xl">
          <FileVideo className="h-5 w-5 text-blue-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">数据来源:飞书妙记 · AI 自动提取</p>
            <p className="text-xs text-blue-700 mt-0.5">提取时间:{record.visit_date} · 准确率:高</p>
          </div>
          {isEditing ? (
            <button onClick={handleSave} className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700">
              <Save className="h-4 w-4" /> 保存修改
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-default">
              <Edit3 className="h-4 w-4" /> 编辑
            </button>
          )}
        </div>

        {/* 主内容:左 Markdown + 右覆盖度 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左:Markdown 内容 */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              {isEditing ? (
                <textarea
                  value={markdownContent}
                  onChange={e => setMarkdownContent(e.target.value)}
                  className="input font-mono text-sm resize-none"
                  style={{ minHeight: '600px' }}
                  placeholder="编辑 Markdown 内容..."
                />
              ) : (
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdownContent}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          {/* 右:覆盖度面板 */}
          <div className="space-y-6">
            {/* 走访对象 */}
            <div className="card p-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">走访对象</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">姓名</span>
                  <span className="font-medium text-slate-900">{record.counterpart_name ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">职位</span>
                  <span className="font-medium text-slate-900">{record.counterpart_title ?? '-'}</span>
                </div>
              </div>
            </div>

            {/* 赛道问题覆盖 */}
            {coverage?.track_questions && (
              <div className="card p-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">赛道问题覆盖</h3>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className={cn(
                    'text-3xl font-bold tabular-nums',
                    coverage.track_questions.covered === coverage.track_questions.total
                      ? 'text-emerald-600' : 'text-amber-600'
                  )}>
                    {coverage.track_questions.covered}
                  </span>
                  <span className="text-slate-400">/</span>
                  <span className="text-xl font-semibold text-slate-400">
                    {coverage.track_questions.total}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${(coverage.track_questions.covered / coverage.track_questions.total) * 100}%` }}
                  />
                </div>
                {coverage.track_questions.missed.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-amber-600">缺失问题:</p>
                    {coverage.track_questions.missed.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 政策问题覆盖 */}
            {coverage?.policy_questions && (
              <div className="card p-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">政策问题覆盖</h3>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className={cn(
                    'text-3xl font-bold tabular-nums',
                    coverage.policy_questions.covered === coverage.policy_questions.total
                      ? 'text-emerald-600' : 'text-amber-600'
                  )}>
                    {coverage.policy_questions.covered}
                  </span>
                  <span className="text-slate-400">/</span>
                  <span className="text-xl font-semibold text-slate-400">
                    {coverage.policy_questions.total}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(coverage.policy_questions.covered / coverage.policy_questions.total) * 100}%` }}
                  />
                </div>
                {coverage.policy_questions.missed.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-amber-600">缺失问题:</p>
                    {coverage.policy_questions.missed.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
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
        <div className="card p-6 flex items-center justify-between sticky bottom-6 shadow-lg">
          <div className="flex items-center gap-3">
            {record.is_confirmed ? (
              <span className="flex items-center gap-2 text-emerald-600 font-medium">
                <CheckCircle2 className="h-5 w-5" />
                已确认入库
              </span>
            ) : (
              <span className="text-sm text-slate-500">
                审核 AI 提取内容后确认入库
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button className="btn btn-default" onClick={handleReject}>
              <XCircle className="h-4 w-4" /> 驳回重提
            </button>
            <button className="btn btn-primary" onClick={handleConfirm}>
              <CheckCircle2 className="h-4 w-4" /> 确认入库
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
