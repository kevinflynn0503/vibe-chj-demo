/**
 * 走访记录确认页
 * 左：AI 提取内容（可编辑）  右：关键问题覆盖度面板
 * 底部操作：确认入库 / 驳回 / 人工补充
 */
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Edit3, FileVideo, AlertCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVisitRecords } from '@/lib/mock-data';
import { VISIT_TYPE_LABELS } from '@/lib/schema';
import { sendChat } from '@/lib/host-api';
import { toast } from 'sonner';

export default function ConfirmPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;

  const records = getVisitRecords();
  const record = records.find(r => r.id === recordId);

  // 可编辑字段
  const [findings, setFindings] = useState(record?.key_findings?.join('\n') ?? '');
  const [demands, setDemands] = useState(record?.demands?.join('\n') ?? '');
  const [followUp, setFollowUp] = useState(record?.follow_up ?? '');
  const [notes, setNotes] = useState(record?.human_notes ?? '');

  if (!record) {
    return (
      <div className="p-5">
        <div className="empty-state">
          <p>未找到走访记录 {recordId}</p>
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
    sendChat(`驳回走访记录 ${record.id}，请重新从飞书妙记提取内容`);
    toast.info('已驳回，通知 Agent 重新提取');
  };

  return (
    <div className="p-5 space-y-4">
      {/* 顶部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn-default btn-sm">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回
          </button>
          <div>
            <h1 className="text-[16px] font-semibold">走访记录确认</h1>
            <div className="flex items-center gap-2 mt-0.5 text-[12px] text-secondary">
              <span>{record.enterprise_name}</span>
              <span>·</span>
              <span>{record.visit_date}</span>
              <span>·</span>
              <span>{record.visitor_name}</span>
              {record.visit_type && (
                <>
                  <span>·</span>
                  <span className="tag tag-blue">{VISIT_TYPE_LABELS[record.visit_type]}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          className="btn btn-text btn-sm"
          onClick={() => router.push(`/enterprises/${record.enterprise_id}`)}
        >
          <Eye className="h-3.5 w-3.5" />
          查看企业画像
        </button>
      </div>

      {/* 来源提示 */}
      <div className="alert-bar alert-bar-info">
        <FileVideo className="h-4 w-4 shrink-0" />
        <span>数据来源：飞书妙记 · {record.visit_date} · AI 自动提取</span>
      </div>

      {/* 主内容区 — 左右分栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左：可编辑内容 (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* 企业最新情况 */}
          <div className="card p-4 space-y-2">
            <label className="text-[13px] font-semibold flex items-center gap-1.5">
              <Edit3 className="h-3.5 w-3.5 text-[var(--primary)]" />
              企业最新情况 / 关键发现
            </label>
            <textarea
              value={findings}
              onChange={e => setFindings(e.target.value)}
              rows={4}
              className="input resize-none"
              placeholder="AI 提取的关键发现..."
            />
          </div>

          {/* 企业诉求 */}
          <div className="card p-4 space-y-2">
            <label className="text-[13px] font-semibold flex items-center gap-1.5">
              <Edit3 className="h-3.5 w-3.5 text-[var(--primary)]" />
              企业诉求列表
            </label>
            <textarea
              value={demands}
              onChange={e => setDemands(e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="每行一个诉求..."
            />
            <p className="text-[11px] text-placeholder">每行一条，可增删修改</p>
          </div>

          {/* 下一步计划 */}
          <div className="card p-4 space-y-2">
            <label className="text-[13px] font-semibold flex items-center gap-1.5">
              <Edit3 className="h-3.5 w-3.5 text-[var(--primary)]" />
              下一步计划 / Follow-up
            </label>
            <textarea
              value={followUp}
              onChange={e => setFollowUp(e.target.value)}
              rows={2}
              className="input resize-none"
              placeholder="后续行动..."
            />
          </div>

          {/* 人工备注 */}
          <div className="card p-4 space-y-2">
            <label className="text-[13px] font-semibold flex items-center gap-1.5">
              <Edit3 className="h-3.5 w-3.5 text-secondary" />
              人工补充（可选）
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="input resize-none"
              placeholder="手动补充内容..."
            />
          </div>
        </div>

        {/* 右：覆盖度面板 (1/3) */}
        <div className="space-y-4">
          {/* 对话方信息 */}
          <div className="card p-4 space-y-3">
            <h3 className="text-[13px] font-semibold">走访对象</h3>
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-secondary">对方姓名</span>
                <span className="font-medium">{record.counterpart_name ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">职位</span>
                <span className="font-medium">{record.counterpart_title ?? '-'}</span>
              </div>
            </div>
          </div>

          {/* 赛道问题覆盖度 */}
          {coverage?.track_questions && (
            <div className="card p-4 space-y-3">
              <h3 className="text-[13px] font-semibold">赛道问题覆盖度</h3>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-[20px] font-bold',
                  coverage.track_questions.covered === coverage.track_questions.total
                    ? 'text-[var(--success)]'
                    : 'text-[var(--warning)]'
                )}>
                  {coverage.track_questions.covered}/{coverage.track_questions.total}
                </span>
                <span className="text-[12px] text-secondary">已覆盖</span>
              </div>
              {/* 进度条 */}
              <div className="h-2 rounded-full bg-[var(--bg-hover)]">
                <div
                  className="h-2 rounded-full bg-[var(--success)] transition-all"
                  style={{ width: `${(coverage.track_questions.covered / coverage.track_questions.total) * 100}%` }}
                />
              </div>
              {/* 遗漏项 */}
              {coverage.track_questions.missed.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] text-placeholder">遗漏问题：</p>
                  {coverage.track_questions.missed.map((q, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[12px] text-[var(--warning)]">
                      <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      {q}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 政策问题覆盖度 */}
          {coverage?.policy_questions && (
            <div className="card p-4 space-y-3">
              <h3 className="text-[13px] font-semibold">政策问题覆盖度</h3>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-[20px] font-bold',
                  coverage.policy_questions.covered === coverage.policy_questions.total
                    ? 'text-[var(--success)]'
                    : 'text-[var(--warning)]'
                )}>
                  {coverage.policy_questions.covered}/{coverage.policy_questions.total}
                </span>
                <span className="text-[12px] text-secondary">已覆盖</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-hover)]">
                <div
                  className="h-2 rounded-full bg-[var(--primary)] transition-all"
                  style={{ width: `${(coverage.policy_questions.covered / coverage.policy_questions.total) * 100}%` }}
                />
              </div>
              {coverage.policy_questions.missed.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] text-placeholder">遗漏问题：</p>
                  {coverage.policy_questions.missed.map((q, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[12px] text-[var(--warning)]">
                      <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      {q}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="card p-4 flex items-center justify-between">
        <div className="text-[12px] text-placeholder">
          {record.is_confirmed ? '此记录已确认入库' : '请审核 AI 提取内容后确认'}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-default" onClick={handleReject}>
            <XCircle className="h-4 w-4" />
            驳回重新提取
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            <CheckCircle2 className="h-4 w-4" />
            确认并入库
          </button>
        </div>
      </div>
    </div>
  );
}
