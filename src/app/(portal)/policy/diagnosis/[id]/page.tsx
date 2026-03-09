/**
 * 申报诊断页面
 * 
 * 对"有意愿"企业进行前置材料审核与诊断
 * 显示：诊断结论、各项指标评分、材料清单、建议
 * 对应需求：UR-203 申报诊断
 */
'use client';

import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, ChevronLeft, CheckCircle2, AlertCircle, XCircle, Clock,
  FileText, Upload, MessageCircle, ChevronRight, Shield,
  Lightbulb, BarChart3, Bot, Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { fetchAssessment } from '@/services/policy';
import { fetchEnterprise } from '@/services/enterprise';
import { sendChat } from '@/lib/host-api';
import { toast } from 'sonner';
import { Button, DetailSkeleton } from '@/components/ui';
import type { ScreeningDetail, PolicyAssessment, Enterprise } from '@/lib/schema';

// 模拟诊断材料清单
const diagnosisMaterials = [
  { name: '营业执照副本', required: true, status: 'collected' as const },
  { name: '近三年审计报告', required: true, status: 'collected' as const },
  { name: '研发费用辅助账', required: true, status: 'missing' as const },
  { name: '知识产权证书', required: true, status: 'collected' as const },
  { name: '研发人员花名册', required: true, status: 'missing' as const },
  { name: '科技成果转化证明', required: false, status: 'collected' as const },
  { name: '产学研合作协议', required: false, status: 'not_required' as const },
  { name: '高新收入佐证材料', required: true, status: 'missing' as const },
];

// 诊断项详情
interface DiagnosisItem {
  category: string;
  items: {
    name: string;
    weight: number;
    score: number;
    maxScore: number;
    status: 'pass' | 'warning' | 'fail' | 'pending';
    detail: string;
    suggestion?: string;
  }[];
}

function getDiagnosisItems(screeningDetails: ScreeningDetail[]): DiagnosisItem[] {
  return [
    {
      category: '核心指标',
      items: screeningDetails.map(d => ({
        name: d.rule_name,
        weight: 15,
        score: d.result === 'pass' ? 15 : d.result === 'pending' ? 8 : 0,
        maxScore: 15,
        status: d.result === 'pass' ? 'pass' as const : d.result === 'pending' ? 'warning' as const : 'fail' as const,
        detail: `企业值: ${d.enterprise_value ?? '未获取'} | 要求: ${d.required_value ?? '-'}`,
        suggestion: d.result !== 'pass' ? `需进一步确认${d.rule_name}` : undefined,
      })),
    },
    {
      category: '加分项',
      items: [
        { name: '产学研合作', weight: 5, score: 0, maxScore: 5, status: 'pending' as const, detail: '暂未获取合作信息', suggestion: '走访时了解是否有产学研合作' },
        { name: '科技成果转化', weight: 5, score: 3, maxScore: 5, status: 'warning' as const, detail: '有1项转化记录，达标需3项以上', suggestion: '梳理近三年科技成果转化明细' },
        { name: '企业成长性', weight: 5, score: 5, maxScore: 5, status: 'pass' as const, detail: '近三年营收/净利稳步增长' },
      ],
    },
  ];
}

export default function DiagnosisPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<PolicyAssessment | undefined>(undefined);
  const [enterprise, setEnterprise] = useState<Enterprise | undefined>(undefined);
  const [reviewStatus, setReviewStatus] = useState<'pending' | 'approved' | 'returned' | 'rejected'>('pending');

  useEffect(() => {
    async function load() {
      const a = await fetchAssessment(id);
      setAssessment(a);
      if (a) {
        const e = await fetchEnterprise(a.enterprise_id);
        setEnterprise(e);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (!assessment) {
    return (
      <div className="min-h-screen bg-surface-card flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted">未找到筛选记录</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => router.push('/policy')}>返回政策服务</Button>
        </div>
      </div>
    );
  }

  const name = enterprise?.short_name ?? enterprise?.name ?? assessment.enterprise_name;
  const diagnosisItems = getDiagnosisItems(assessment.screening_details);
  const totalScore = diagnosisItems.flatMap(d => d.items).reduce((s, i) => s + i.score, 0);
  const maxScore = diagnosisItems.flatMap(d => d.items).reduce((s, i) => s + i.maxScore, 0);
  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const collectedCount = diagnosisMaterials.filter(m => m.status === 'collected').length;
  const requiredMissing = diagnosisMaterials.filter(m => m.required && m.status === 'missing').length;

  const diagLevel = scorePercent >= 80 ? 'high' : scorePercent >= 60 ? 'medium' : 'low';
  const diagConclusion: Record<string, { label: string; cls: string; desc: string }> = {
    high: { label: '建议申报', cls: 'bg-neutral-50 text-success border-line-light', desc: '各项指标表现优异，建议尽快启动申报流程' },
    medium: { label: '补强后申报', cls: 'bg-neutral-50 text-warning border-line-light', desc: '部分指标需补充确认，建议完善后申报' },
    low: { label: '暂缓申报', cls: 'bg-neutral-50 text-error border-line-light', desc: '多项关键指标不达标，建议暂缓并制定改进计划' },
  };

  const conclusion = diagConclusion[diagLevel];

  return (
    <div className="min-h-full">
      {/* 头部 */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <Button variant="ghost" size="sm" onClick={() => router.push('/policy/tasks')} className="mb-3">
            <ChevronLeft className="h-3.5 w-3.5" />
            返回触达任务
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-lg font-semibold text-text-primary">{name} · 申报诊断</h1>
                <span className={cn("text-tag px-1.5 py-0.5 rounded border font-medium", conclusion.cls)}>
                  {conclusion.label}
                </span>
                <span className="flex items-center gap-1 text-tag text-brand bg-neutral-50 px-1.5 py-0.5 rounded">
                  <Bot className="h-3 w-3" /> AI 诊断
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">{assessment.policy_type} · 综合得分 {scorePercent}% · AI 置信度: 中高</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" icon={<FileText />} onClick={() => router.push(`/policy/screening/${id}`)}>
                查看筛选
              </Button>
              <Button variant="primary" size="sm" icon={<Upload />}>
                导出诊断报告
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container space-y-6">

        {/* 诊断结论 */}
        <div className={cn("rounded-lg border p-4", conclusion.cls)}>
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{conclusion.label}</span>
                <span className="flex items-center gap-0.5 text-tag opacity-70"><Bot className="h-3 w-3" /> AI 综合评估</span>
              </div>
              <p className="text-xs mt-0.5 opacity-80">{conclusion.desc}</p>
            </div>
          </div>
        </div>

        {/* 审核状态 */}
        {reviewStatus !== 'pending' && (
          <div className={cn("rounded-lg border p-3 flex items-center gap-2 text-sm font-medium",
            reviewStatus === 'approved' ? 'bg-neutral-50 text-success border-line-light' :
            reviewStatus === 'returned' ? 'bg-neutral-50 text-warning border-line-light' :
            'bg-neutral-50 text-error border-line-light'
          )}>
            {reviewStatus === 'approved' && <><CheckCircle2 className="h-4 w-4" /> 已审核通过，可进入申报流程</>}
            {reviewStatus === 'returned' && <><AlertCircle className="h-4 w-4" /> 已退回补充，已通知企业补齐材料</>}
            {reviewStatus === 'rejected' && <><XCircle className="h-4 w-4" /> 已驳回，建议暂缓申报</>}
          </div>
        )}

        {/* 概览指标 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-card border border-line rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold text-text-primary tabular-nums">{scorePercent}%</div>
            <div className="text-xs text-text-muted mt-0.5">综合得分</div>
          </div>
          <div className="bg-surface-card border border-line rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success tabular-nums">{assessment.screening_details.filter(d => d.result === 'pass').length}</div>
            <div className="text-xs text-text-muted mt-0.5">指标达标</div>
          </div>
          <div className="bg-surface-card border border-line rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-warning tabular-nums">{assessment.screening_details.filter(d => d.result === 'pending').length}</div>
            <div className="text-xs text-text-muted mt-0.5">待确认</div>
          </div>
          <div className="bg-surface-card border border-line rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold text-text-primary tabular-nums">{collectedCount}/{diagnosisMaterials.length}</div>
            <div className="text-xs text-text-muted mt-0.5">材料就绪</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* 左：诊断详情 */}
          <div className="lg:col-span-3 space-y-4">
            {diagnosisItems.map((cat, ci) => (
              <div key={ci} className="bg-surface-card border border-line rounded-lg">
                <div className="px-4 py-3 border-b border-line-light flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-brand" />
                  <h2 className="text-sm font-semibold text-text-primary">{cat.category}</h2>
                </div>
                <div className="divide-y divide-line-light">
                  {cat.items.map((item, ii) => (
                    <div key={ii} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {item.status === 'pass' && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                          {item.status === 'warning' && <AlertCircle className="h-3.5 w-3.5 text-warning" />}
                          {item.status === 'fail' && <XCircle className="h-3.5 w-3.5 text-error" />}
                          {item.status === 'pending' && <Clock className="h-3.5 w-3.5 text-text-muted" />}
                          <span className="text-sm font-medium text-text-primary">{item.name}</span>
                        </div>
                        <span className={cn("text-xs tabular-nums font-bold",
                          item.status === 'pass' ? 'text-success' :
                          item.status === 'warning' ? 'text-warning' :
                          item.status === 'fail' ? 'text-error' : 'text-text-muted'
                        )}>
                          {item.score}/{item.maxScore}
                        </span>
                      </div>
                      <div className="text-xs text-text-muted pl-5.5">{item.detail}</div>
                      {item.suggestion && (
                        <div className="flex items-center gap-1.5 text-xs text-warning mt-1.5 pl-5.5">
                          <Lightbulb className="h-3 w-3 shrink-0" />
                          {item.suggestion}
                        </div>
                      )}
                      {/* 进度条 */}
                      <div className="mt-2 h-1 bg-neutral-50 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all",
                          item.status === 'pass' ? 'bg-success' :
                          item.status === 'warning' ? 'bg-warning' :
                          item.status === 'fail' ? 'bg-error' : 'bg-text-muted'
                        )} style={{ width: `${(item.score / item.maxScore) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 右：材料清单 + 建议 */}
          <div className="lg:col-span-2 space-y-4">

            {/* 材料清单 */}
            <div className="bg-surface-card border border-line rounded-lg">
              <div className="px-4 py-3 border-b border-line-light flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary">申报材料</h2>
                <span className="text-xs text-text-muted">{collectedCount}/{diagnosisMaterials.length} 就绪</span>
              </div>
              {requiredMissing > 0 && (
                <div className="mx-4 mt-3 p-2.5 bg-neutral-50 border border-line-light rounded text-xs text-warning flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {requiredMissing} 项必备材料缺失
                </div>
              )}
              <div className="p-4 space-y-2">
                {diagnosisMaterials.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {m.status === 'collected' && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                    {m.status === 'missing' && <XCircle className="h-3.5 w-3.5 text-error" />}
                    {m.status === 'not_required' && <Clock className="h-3.5 w-3.5 text-text-muted" />}
                    <span className={cn("text-xs flex-1",
                      m.status === 'collected' ? 'text-text-secondary' :
                      m.status === 'missing' ? 'text-error' : 'text-text-muted'
                    )}>
                      {m.name}
                      {m.required && <span className="text-error ml-0.5">*</span>}
                    </span>
                    {m.status === 'missing' && (
                      <Button variant="link" size="sm" onClick={() => sendChat(`请向企业催收「${m.name}」材料。`)}>催收</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI 建议 */}
            <div className="bg-surface-card border border-line rounded-lg">
              <div className="px-4 py-3 border-b border-line-light flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">改进建议</h2>
                <span className="flex items-center gap-0.5 text-tag text-brand bg-neutral-50 px-1.5 py-0.5 rounded"><Bot className="h-3 w-3" /> AI 生成</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="p-3 bg-neutral-50 border border-line-light rounded-lg text-xs text-text-secondary leading-relaxed">
                  <strong>优先补齐缺失材料：</strong>研发费用辅助账和研发人员花名册是必审材料，建议立即联系企业财务和人事部门收集。
                </div>
                <div className="p-3 bg-neutral-50 border border-line-light rounded-lg text-xs text-text-secondary leading-relaxed">
                  <strong>高新收入确认：</strong>目前高新技术产品收入占比数据缺失，建议走访时重点确认，至少需达60%。
                </div>
                <div className="p-3 bg-neutral-50 border border-line-light rounded-lg text-xs text-text-secondary leading-relaxed">
                  <strong>科技成果转化：</strong>当前只有1项记录，高新认定需累计15项以上。建议梳理近三年已有成果转化项目。
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-surface-card border border-line rounded-lg">
              <div className="px-4 py-3 border-b border-line-light">
                <h2 className="text-sm font-semibold text-text-primary">下一步</h2>
              </div>
              <div className="divide-y divide-line-light">
                <Button variant="link" size="sm" onClick={() => router.push(`/enterprises/${assessment.enterprise_id}`)}
                  className="w-full flex items-center justify-between px-4 py-3 !p-3">
                  <span>查看企业画像</span>
                  <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
                </Button>
                <Button variant="link" size="sm" onClick={() => router.push(`/policy/screening/${id}`)}
                  className="w-full flex items-center justify-between px-4 py-3 !p-3">
                  <span>查看AI筛选详情</span>
                  <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
                </Button>
                <Button variant="primary" size="sm"
                  className="w-full flex items-center justify-between px-4 py-3"
                  onClick={() => {}}>
                  <span>发起申报流程</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 底部审核操作栏 ── */}
        {reviewStatus === 'pending' && (
          <div className="bg-surface-card border border-line rounded-lg p-4 flex items-center justify-between sticky bottom-4 border-t border-line">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Bot className="h-4 w-4 text-brand" />
              审核 AI 诊断结果，决定是否推进申报
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={() => {
                sendChat(`请为「${name}」进行更深入的高新认定申报诊断分析，重点确认得分较低的指标项。`);
              }}>
                <Sparkles className="h-3.5 w-3.5" /> AI 深度诊断
              </Button>
              <Button variant="default" size="sm" className="text-error hover:bg-neutral-50" onClick={() => {
                setReviewStatus('rejected');
                toast.info('已驳回，建议暂缓申报');
              }}>
                <XCircle className="h-3.5 w-3.5" /> 驳回
              </Button>
              <Button variant="default" size="sm" className="text-warning hover:bg-neutral-50" onClick={() => {
                setReviewStatus('returned');
                toast.info('已退回，通知企业补充材料');
              }}>
                <AlertCircle className="h-3.5 w-3.5" /> 退回补充
              </Button>
              <Button variant="primary" size="sm" onClick={() => {
                setReviewStatus('approved');
                toast.success('审核通过，可进入申报流程');
              }}>
                <CheckCircle2 className="h-3.5 w-3.5" /> 审核通过
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
