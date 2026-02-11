/**
 * 走访记录确认页
 * 
 * 统一布局：bg-white border-b 头部 + 内容区
 * 左：Markdown 渲染（可切换编辑）  右：覆盖度面板
 */
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft, CheckCircle2, XCircle, Edit3, FileVideo,
  AlertCircle, Eye, FileText, Save, Bot, Sparkles
} from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">未找到走访记录 {recordId}</p>
          <button className="btn btn-default btn-sm mt-3" onClick={() => router.back()}>返回</button>
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
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              返回走访看板
            </button>
            <button className="btn btn-default btn-sm" onClick={() => router.push(`/enterprises/${record.enterprise_id}`)}>
              <Eye className="h-3.5 w-3.5" /> 企业画像
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900">走访记录确认</h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{record.enterprise_name}</span>
                <span>·</span>
                <span className="font-mono">{record.visit_date}</span>
                <span>·</span>
                <span>{record.visitor_name}</span>
                {record.visit_type && (
                  <>
                    <span>·</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
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
      <div className="page-container space-y-4">
        {/* 来源提示 */}
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-[10px]">
          <FileVideo className="h-4 w-4 text-blue-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">数据来源: 飞书妙记 · AI 自动提取</p>
            <p className="text-[10px] text-blue-600 mt-0.5">提取时间: {record.visit_date} · 准确率: 高</p>
          </div>
          {isEditing ? (
            <button onClick={handleSave} className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700">
              <Save className="h-3.5 w-3.5" /> 保存修改
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-default">
              <Edit3 className="h-3.5 w-3.5" /> 编辑
            </button>
          )}
        </div>

        {/* 主内容: 左 Markdown + 右覆盖度 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左: Markdown 内容 */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-[10px] p-6">
              {isEditing ? (
                <textarea
                  value={markdownContent}
                  onChange={e => setMarkdownContent(e.target.value)}
                  className="w-full font-mono text-sm resize-none border border-slate-200 rounded-lg p-4 focus:border-[#3370FF] focus:outline-none focus:ring-1 focus:ring-[#3370FF]/20"
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
            <div className="bg-white border border-slate-200 rounded-[10px] p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">走访对象</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">姓名</span>
                  <span className="font-medium text-slate-900">{record.counterpart_name ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">职位</span>
                  <span className="font-medium text-slate-900">{record.counterpart_title ?? '-'}</span>
                </div>
              </div>
            </div>

            {/* 赛道问题覆盖 */}
            {coverage?.track_questions && (
              <div className="bg-white border border-slate-200 rounded-[10px] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">赛道问题覆盖</h3>
                  <span className="flex items-center gap-0.5 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">
                    <Bot className="h-3 w-3" /> AI 检测
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={cn(
                    'text-2xl font-bold tabular-nums',
                    coverage.track_questions.covered === coverage.track_questions.total
                      ? 'text-emerald-600' : 'text-amber-600'
                  )}>
                    {coverage.track_questions.covered}
                  </span>
                  <span className="text-slate-400">/</span>
                  <span className="text-lg font-semibold text-slate-400">
                    {coverage.track_questions.total}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${(coverage.track_questions.covered / coverage.track_questions.total) * 100}%` }}
                  />
                </div>
                {coverage.track_questions.missed.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[10px] font-medium text-amber-600">缺失问题:</p>
                    {coverage.track_questions.missed.map((q, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <AlertCircle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 政策问题覆盖 */}
            {coverage?.policy_questions && (
              <div className="bg-white border border-slate-200 rounded-[10px] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">政策问题覆盖</h3>
                  <span className="flex items-center gap-0.5 text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">
                    <Bot className="h-3 w-3" /> AI 检测
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={cn(
                    'text-2xl font-bold tabular-nums',
                    coverage.policy_questions.covered === coverage.policy_questions.total
                      ? 'text-emerald-600' : 'text-amber-600'
                  )}>
                    {coverage.policy_questions.covered}
                  </span>
                  <span className="text-slate-400">/</span>
                  <span className="text-lg font-semibold text-slate-400">
                    {coverage.policy_questions.total}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(coverage.policy_questions.covered / coverage.policy_questions.total) * 100}%` }}
                  />
                </div>
                {coverage.policy_questions.missed.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[10px] font-medium text-amber-600">缺失问题:</p>
                    {coverage.policy_questions.missed.map((q, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <AlertCircle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
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
        <div className="bg-white border border-slate-200 rounded-[10px] p-4 flex items-center justify-between sticky bottom-4"
          style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02)' }}>
          <div className="flex items-center gap-2">
            {record.is_confirmed ? (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                已确认入库
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                审核 AI 提取内容后确认入库
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-default btn-sm" onClick={handleReject}>
              <XCircle className="h-3.5 w-3.5" /> 驳回重提
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleConfirm}>
              <CheckCircle2 className="h-3.5 w-3.5" /> 确认入库
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
