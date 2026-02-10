/**
 * 走访准备详情页
 * 
 * 核心功能：展示企业概况 + 背调报告摘要 + 沟通清单（谈话提纲 + 必问问题）
 * 对应需求：UR-101 背调报告 + UR-102 沟通清单 + UR-103 3+3关键问题
 */
'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  ArrowLeft, FileText, Building2, Users, MapPin, Briefcase,
  MessageCircle, HelpCircle, Lightbulb, CheckCircle2, ChevronRight,
  Calendar, Phone, ExternalLink, Shield, Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEnterprise, getBackgroundReport, getVisitRecords } from '@/lib/mock-data';
import { generateReport } from '@/lib/host-api';

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
  const enterprise = getEnterprise(id);
  const report = getBackgroundReport(id);
  const visits = getVisitRecords(id);

  // 政策联动参数
  const fromPolicy = searchParams.get('from') === 'policy';
  const policyName = searchParams.get('policy') || '高新技术企业认定';

  if (!enterprise) {
    return (
      <div className="min-h-screen bg-[#F5F6F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-slate-500">未找到企业 {id}</p>
          <button className="btn btn-primary btn-sm mt-4" onClick={() => router.push('/visit')}>返回看板</button>
        </div>
      </div>
    );
  }

  const name = enterprise.short_name ?? enterprise.name;
  const checklist = report?.communication_checklist;

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => router.push('/visit')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回走访看板
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold shrink-0",
                enterprise.is_incubated ? "bg-violet-50 text-violet-600 border border-violet-100" : "bg-blue-50 text-blue-600 border border-blue-100"
              )}>
                {name.charAt(0)}
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">走访准备 · {name}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  {enterprise.industry && <span>{enterprise.industry}</span>}
                  {enterprise.development_stage && <><span>·</span><span>{enterprise.development_stage}</span></>}
                  {visits.length > 0 && <><span>·</span><span>已走访 {visits.length} 次</span></>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-default btn-sm" onClick={() => router.push(`/enterprises/${id}`)}>
                <Building2 className="h-3.5 w-3.5" /> 企业详情
              </button>
              {report ? (
                <button className="btn btn-primary btn-sm" onClick={() => router.push(`/enterprises/${id}/report`)}>
                  <FileText className="h-3.5 w-3.5" /> 查看背调报告
                </button>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => generateReport(name)}>
                  <FileText className="h-3.5 w-3.5" /> 生成背调报告
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* 政策联动提示 */}
        {fromPolicy && (
          <div className="flex items-center gap-3 px-4 py-3 bg-violet-50 border border-violet-200 rounded-lg">
            <Shield className="h-5 w-5 text-violet-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-violet-900">政策触达走访 · {policyName}</p>
              <p className="text-xs text-violet-700 mt-0.5">本次走访同时承担政策触达任务，请务必询问下方"政策必问问题"</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-violet-600 bg-violet-100 px-2 py-1 rounded border border-violet-200">
              <Bot className="h-3 w-3" /> 科创部门 · 7 条必问
            </span>
          </div>
        )}

        {/* ── 企业快照 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500 mb-1">法定代表人</div>
            <div className="text-sm font-bold text-slate-900">{enterprise.legal_person || '-'}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500 mb-1">注册资本</div>
            <div className="text-sm font-bold text-slate-900">{enterprise.registered_capital || '-'}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500 mb-1">员工规模</div>
            <div className="text-sm font-bold text-slate-900">{enterprise.employee_count ? `${enterprise.employee_count.toLocaleString()} 人` : '-'}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500 mb-1">办公地址</div>
            <div className="text-sm font-bold text-slate-900 truncate">{enterprise.office_address || '-'}</div>
          </div>
        </div>

        {/* ── 两栏：沟通清单 + 历史走访 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 左：沟通清单（核心功能） */}
          <div className="space-y-4">
            {checklist ? (
              <>
                {/* 话术要点 */}
                <div className="bg-white border border-slate-200 rounded-lg">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-[#3370FF]" />
                    <h2 className="text-sm font-bold text-slate-900">话术要点</h2>
                  </div>
                  <div className="p-4 space-y-2">
                    {checklist.talking_points.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 必问问题 */}
                <div className="bg-white border border-slate-200 rounded-lg">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-500" />
                    <h2 className="text-sm font-bold text-slate-900">必问问题</h2>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-100">{checklist.must_ask_questions.length} 项</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {checklist.must_ask_questions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="shrink-0 w-4 h-4 rounded bg-amber-50 text-amber-600 text-[10px] font-bold flex items-center justify-center border border-amber-100">{i + 1}</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 政策必问问题（政策×走访联动） */}
                {fromPolicy && (
                  <div className="bg-white border-2 border-violet-200 rounded-lg">
                    <div className="px-4 py-3 border-b border-violet-100 bg-violet-50/50 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-violet-600" />
                      <h2 className="text-sm font-bold text-violet-900">政策必问问题</h2>
                      <span className="text-[10px] px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded border border-violet-200">科创7条 · {policyName}</span>
                    </div>
                    <div className="p-4 space-y-2">
                      {POLICY_MUST_ASK.map((q, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <span className="shrink-0 w-4 h-4 rounded bg-violet-50 text-violet-600 text-[10px] font-bold flex items-center justify-center border border-violet-100">{i + 1}</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 关键洞察 */}
                {checklist.key_insights.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-lg">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-[#3370FF]" />
                      <h2 className="text-sm font-bold text-slate-900">关键洞察</h2>
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
              </>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
                <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-1">暂无沟通清单</p>
                <p className="text-xs text-slate-400 mb-4">生成背调报告后将自动生成沟通清单</p>
                <button className="btn btn-primary btn-sm" onClick={() => generateReport(name)}>
                  <FileText className="h-3.5 w-3.5" /> 生成背调报告
                </button>
              </div>
            )}
          </div>

          {/* 右：历史走访 + AI 摘要 */}
          <div className="space-y-4">
            {/* AI 摘要 */}
            {enterprise.ai_summary && (
              <div className="bg-white border border-slate-200 rounded-lg">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">AI 摘要</h2>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-700 leading-relaxed">{enterprise.ai_summary}</p>
                </div>
              </div>
            )}

            {/* 历史走访 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">历史走访</h2>
                <span className="text-xs text-slate-400">{visits.length} 次</span>
              </div>
              {visits.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {visits.slice(0, 5).map(v => (
                    <div key={v.id}
                      className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
                      onClick={() => router.push(`/visit/confirm/${v.id}`)}
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-900">{v.visit_date}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{v.visitor_name} · {v.visitor_department}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded border",
                          v.is_confirmed ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          {v.is_confirmed ? '已确认' : '待确认'}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-xs text-slate-400">暂无走访记录</div>
              )}
            </div>

            {/* 快捷操作 */}
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">快捷操作</h2>
              </div>
              <div className="divide-y divide-slate-100">
                <button onClick={() => router.push(`/enterprises/${id}`)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                  <span>查看企业完整画像</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button onClick={() => router.push(`/enterprises/${id}/report`)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                  <span>查看背调报告全文</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button onClick={() => router.push('/visit/records')}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                  <span>所有走访记录</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
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
    <Suspense fallback={<div className="min-h-screen bg-[#F5F6F7] flex items-center justify-center"><p className="text-sm text-slate-400">加载中...</p></div>}>
      <VisitPrepContent />
    </Suspense>
  );
}
