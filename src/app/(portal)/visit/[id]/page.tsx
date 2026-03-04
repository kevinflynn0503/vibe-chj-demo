/**
 * 走访准备详情页
 * 
 * 核心功能：展示企业概况 + 背调报告摘要 + 沟通清单（谈话提纲 + 必问问题）
 * 对应需求：UR-101 背调报告 + UR-102 沟通清单 + UR-103 3+3关键问题
 */
'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import {
  ChevronLeft, FileText, Building2, Users, MapPin, Briefcase,
  MessageCircle, HelpCircle, Lightbulb, CheckCircle2, ChevronRight,
  Calendar, Phone, ExternalLink, Shield, Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchEnterprise, fetchBackgroundReport } from '@/services/enterprise';
import { fetchVisitRecords } from '@/services/visit';
import { generateReport } from '@/lib/host-api';
import { Button, DetailSkeleton } from '@/components/ui';
import type { Enterprise, BackgroundReport, VisitRecord } from '@/lib/schema';

// 科创7条必问话术（政策服务场景）
const POLICY_MUST_ASK = [
  '贵司目前有多少研发人员？占员工总数比例？',
  '近三年研发费用投入分别是多少？占营收比例？',
  '目前持有多少项自主知识产权（发明专利/实用新型/软著）？',
  '高新技术产品（服务）收入占总收入比例？',
  '是否有意愿申报高新技术企业认定？此前是否申报过？',
  '目前是否有完整的研发管理制度文件？',
  '近三年是否有税务处罚记录？',
];

function VisitPrepContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [enterprise, setEnterprise] = useState<Enterprise | undefined>(undefined);
  const [report, setReport] = useState<BackgroundReport | undefined>(undefined);
  const [visits, setVisits] = useState<VisitRecord[]>([]);

  useEffect(() => {
    async function load() {
      const [ent, rpt, recs] = await Promise.all([
        fetchEnterprise(id),
        fetchBackgroundReport(id),
        fetchVisitRecords(id),
      ]);
      setEnterprise(ent);
      setReport(rpt);
      setVisits(recs ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  // 政策联动参数
  const fromPolicy = searchParams.get('from') === 'policy';
  const policyName = searchParams.get('policy') || '高新技术企业认定';

  if (loading) return <DetailSkeleton />;

  if (!enterprise) {
    return (
      <div className="min-h-screen bg-surface-card flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-text-muted">未找到企业 {id}</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => router.push('/visit')}>返回看板</Button>
        </div>
      </div>
    );
  }

  const name = enterprise.short_name ?? enterprise.name;
  const checklist = report?.communication_checklist;

  return (
    <div className="min-h-full bg-surface-card">
      {/* 头部 */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <Button variant="ghost" size="sm" onClick={() => router.push('/visit')} className="mb-3">
            <ChevronLeft className="h-3.5 w-3.5" /> 返回走访看板
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold shrink-0",
                enterprise.is_incubated ? "bg-[rgba(27,27,27,0.06)] text-brand border border-line-light" : "bg-[rgba(27,27,27,0.06)] text-brand border border-line-light"
              )}>
                {name.charAt(0)}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-text-primary">走访准备 · {name}</h1>
                <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                  {enterprise.industry && <span>{enterprise.industry}</span>}
                  {enterprise.development_stage && <><span>·</span><span>{enterprise.development_stage}</span></>}
                  {visits.length > 0 && <><span>·</span><span>已走访 {visits.length} 次</span></>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={() => router.push(`/enterprises/${id}`)}>
                <Building2 className="h-3.5 w-3.5" /> 企业详情
              </Button>
              {report ? (
                <Button variant="primary" size="sm" onClick={() => router.push(`/enterprises/${id}/report`)}>
                  <FileText className="h-3.5 w-3.5" /> 查看背调报告
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={() => generateReport(name)}>
                  <FileText className="h-3.5 w-3.5" /> 生成背调报告
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container space-y-6">

        {/* 政策联动提示 */}
        {fromPolicy && (
          <div className="flex items-center gap-3 px-4 py-3 bg-[rgba(27,27,27,0.06)] border border-line rounded-lg">
            <Shield className="h-5 w-5 text-brand shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">政策触达走访 · {policyName}</p>
              <p className="text-xs text-text-secondary mt-0.5">本次走访同时承担政策触达任务，请务必询问下方"政策必问问题"</p>
            </div>
            <span className="flex items-center gap-1 text-tag text-brand bg-[rgba(27,27,27,0.06)] px-2 py-1 rounded border border-line">
              <Bot className="h-3 w-3" /> 科创部门 · 7 条必问
            </span>
          </div>
        )}

        {/* ── 企业快照 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-card border border-line rounded-lg p-4">
            <div className="text-xs text-text-muted mb-1">法定代表人</div>
            <div className="text-sm font-semibold text-text-primary">{enterprise.legal_person || '-'}</div>
          </div>
          <div className="bg-surface-card border border-line rounded-lg p-4">
            <div className="text-xs text-text-muted mb-1">注册资本</div>
            <div className="text-sm font-semibold text-text-primary">{enterprise.registered_capital || '-'}</div>
          </div>
          <div className="bg-surface-card border border-line rounded-lg p-4">
            <div className="text-xs text-text-muted mb-1">员工规模</div>
            <div className="text-sm font-semibold text-text-primary">{enterprise.employee_count ? `${enterprise.employee_count.toLocaleString()} 人` : '-'}</div>
          </div>
          <div className="bg-surface-card border border-line rounded-lg p-4">
            <div className="text-xs text-text-muted mb-1">办公地址</div>
            <div className="text-sm font-semibold text-text-primary truncate">{enterprise.office_address || '-'}</div>
          </div>
        </div>

        {/* ── 两栏：沟通清单 + 历史走访 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 左：沟通清单（核心功能） */}
          <div className="space-y-4">
            {checklist ? (
              <>
                {/* 话术要点 */}
                <div className="bg-surface-card border border-line rounded-lg">
                  <div className="px-4 py-3 border-b border-line-light flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-brand" />
                    <h2 className="text-sm font-semibold text-text-primary">话术要点</h2>
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

                {/* 必问问题 */}
                <div className="bg-surface-card border border-line rounded-lg">
                  <div className="px-4 py-3 border-b border-line-light flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-warning" />
                    <h2 className="text-sm font-semibold text-text-primary">必问问题</h2>
                    <span className="text-tag px-1.5 py-0.5 bg-[rgba(27,27,27,0.06)] text-warning rounded border border-line-light">{checklist.must_ask_questions.length} 项</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {checklist.must_ask_questions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className="shrink-0 w-4 h-4 rounded bg-[rgba(27,27,27,0.06)] text-warning text-tag font-bold flex items-center justify-center border border-line-light">{i + 1}</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 政策必问问题（政策×走访联动） */}
                {fromPolicy && (
                  <div className="bg-surface-card border-2 border-line rounded-lg">
                    <div className="px-4 py-3 border-b border-line-light bg-[rgba(27,27,27,0.06)] flex items-center gap-2">
                      <Shield className="h-4 w-4 text-brand" />
                      <h2 className="text-sm font-semibold text-text-primary">政策必问问题</h2>
                      <span className="text-tag px-1.5 py-0.5 bg-[rgba(27,27,27,0.06)] text-brand rounded border border-line">科创7条 · {policyName}</span>
                    </div>
                    <div className="p-4 space-y-2">
                      {POLICY_MUST_ASK.map((q, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                          <span className="shrink-0 w-4 h-4 rounded bg-[rgba(27,27,27,0.06)] text-brand text-tag font-bold flex items-center justify-center border border-line-light">{i + 1}</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 关键洞察 */}
                {checklist.key_insights.length > 0 && (
                  <div className="bg-surface-card border border-line rounded-lg">
                    <div className="px-4 py-3 border-b border-line-light flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-brand" />
                      <h2 className="text-sm font-semibold text-text-primary">关键洞察</h2>
                    </div>
                    <div className="p-4 space-y-2">
                      {checklist.key_insights.map((ins, i) => (
                        <div key={i} className="p-3 rounded-lg text-xs text-text-secondary bg-[rgba(27,27,27,0.06)] border border-line-light leading-relaxed">
                          {ins}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-surface-card border border-line rounded-lg p-8 text-center">
                <FileText className="h-10 w-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-muted mb-1">暂无沟通清单</p>
                <p className="text-xs text-text-muted mb-4">生成背调报告后将自动生成沟通清单</p>
                <Button variant="primary" size="sm" onClick={() => generateReport(name)}>
                  <FileText className="h-3.5 w-3.5" /> 生成背调报告
                </Button>
              </div>
            )}
          </div>

          {/* 右：历史走访 + AI 摘要 */}
          <div className="space-y-4">
            {/* AI 摘要 */}
            {enterprise.ai_summary && (
              <div className="bg-surface-card border border-line rounded-lg">
                <div className="px-4 py-3 border-b border-line-light">
                  <h2 className="text-sm font-semibold text-text-primary">AI 摘要</h2>
                </div>
                <div className="p-4">
                  <p className="text-xs text-text-secondary leading-relaxed">{enterprise.ai_summary}</p>
                </div>
              </div>
            )}

            {/* 历史走访 */}
            <div className="bg-surface-card border border-line rounded-lg">
              <div className="px-4 py-3 border-b border-line-light flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary">历史走访</h2>
                <span className="text-xs text-text-muted">{visits.length} 次</span>
              </div>
              {visits.length > 0 ? (
                <div className="divide-y divide-line-light">
                  {visits.slice(0, 5).map(v => (
                    <div key={v.id}
                      className="px-4 py-3 hover:bg-surface-hover-row transition-colors cursor-pointer flex items-center justify-between"
                      onClick={() => router.push(`/visit/confirm/${v.id}`)}
                    >
                      <div>
                        <div className="text-sm font-medium text-text-primary">{v.visit_date}</div>
                        <div className="text-xs text-text-muted mt-0.5">{v.visitor_name} · {v.visitor_department}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-tag px-1.5 py-0.5 rounded border",
                          v.is_confirmed ? "bg-[rgba(27,27,27,0.06)] text-success border-line-light" : "bg-[rgba(27,27,27,0.06)] text-warning border-line-light"
                        )}>
                          {v.is_confirmed ? '已确认' : '待确认'}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-xs text-text-muted">暂无走访记录</div>
              )}
            </div>

            {/* 快捷操作 */}
            <div className="bg-surface-card border border-line rounded-lg">
              <div className="px-4 py-3 border-b border-line-light">
                <h2 className="text-sm font-semibold text-text-primary">快捷操作</h2>
              </div>
              <div className="divide-y divide-line-light">
                <div className="flex items-center justify-between px-4 py-3 hover:bg-surface-hover-row transition-colors gap-2">
                  <Button variant="link" size="sm" onClick={() => router.push(`/enterprises/${id}`)} className="flex-1 justify-start">查看企业完整画像</Button>
                  <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
                </div>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-surface-hover-row transition-colors gap-2">
                  <Button variant="link" size="sm" onClick={() => router.push(`/enterprises/${id}/report`)} className="flex-1 justify-start">查看背调报告全文</Button>
                  <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
                </div>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-surface-hover-row transition-colors gap-2">
                  <Button variant="link" size="sm" onClick={() => router.push('/visit/records')} className="flex-1 justify-start">所有走访记录</Button>
                  <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VisitPrepPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-card flex items-center justify-center"><p className="text-sm text-text-muted">加载中...</p></div>}>
      <VisitPrepContent />
    </Suspense>
  );
}
