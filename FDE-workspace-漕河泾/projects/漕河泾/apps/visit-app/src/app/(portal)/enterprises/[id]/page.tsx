/**
 * 企业画像详情页
 */
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, FileText, Clock, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Link2, Briefcase, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEnterprise, getVisitRecords, getDemands, getBackgroundReport } from '@/lib/mock-data';
import { VISIT_TYPE_LABELS, DEMAND_TYPE_LABELS, type VisitRecord } from '@/lib/schema';

/* ── Tab ── */
const TABS = ['基本信息', '走访记录', '需求清单', '服务记录'] as const;
type Tab = typeof TABS[number];

/* ── 走访卡片 ── */
const DEPT_DOT: Record<string, string> = { '产促部': 'bg-blue-500', '科创中心': 'bg-emerald-500', '园区发展中心': 'bg-purple-500', '孵化器': 'bg-amber-500' };
const DEPT_BORDER: Record<string, string> = { '产促部': 'border-l-blue-500', '科创中心': 'border-l-emerald-500', '园区发展中心': 'border-l-purple-500', '孵化器': 'border-l-amber-500' };

function VisitCard({ record }: { record: VisitRecord }) {
  const [open, setOpen] = useState(false);
  const dept = record.visitor_department ?? '';
  return (
    <div className="relative ml-6 pl-6">
      <div className={cn('absolute -left-[5px] top-5 h-2.5 w-2.5 rounded-full ring-2 ring-white', DEPT_DOT[dept] ?? 'bg-gray-400')} />
      <div className={cn(
        'rounded-2xl border border-gray-100 bg-white border-l-[3px] transition-all duration-200 hover:shadow-card-hover hover:-translate-y-px',
        DEPT_BORDER[dept] ?? 'border-l-gray-200'
      )}>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[13px] font-bold text-gray-900">{record.visit_date}</span>
              <span className="rounded-lg bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">{record.visitor_name} · {dept}</span>
            </div>
            <div className="flex items-center gap-2">
              {!record.is_confirmed && (
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600">
                  <AlertTriangle className="h-3 w-3" />待确认
                </span>
              )}
              <button onClick={() => setOpen(!open)} className="text-gray-300 hover:text-gray-500 cursor-pointer transition-colors">
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {record.key_findings?.slice(0, open ? undefined : 2).map((f, i) => (
            <div key={i} className="mt-2 flex items-start gap-2 text-[13px] text-gray-700">
              <span className="mt-[7px] block h-1 w-1 shrink-0 rounded-full bg-gray-300" />{f}
            </div>
          ))}
          {open && record.demands && record.demands.length > 0 && (
            <div className="mt-4 border-t border-gray-50 pt-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-300">企业诉求</p>
              {record.demands.map((d, i) => <p key={i} className="text-[13px] text-gray-500">→ {d}</p>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Section ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-card overflow-hidden">
      <div className="border-b border-gray-50 px-6 py-4">
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-gray-400">{title}</h3>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex gap-4 py-2 text-[13px]">
      <span className="w-24 shrink-0 text-gray-400 font-medium">{label}</span>
      <span className={value ? 'text-gray-900' : 'text-gray-300'}>{value ?? '暂无'}</span>
    </div>
  );
}

export default function EnterprisePage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const enterprise = getEnterprise(id);
  const [activeTab, setActiveTab] = useState<Tab>('基本信息');

  if (!enterprise) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-[14px] text-gray-400">企业不存在</p>
    </div>
  );

  const report = getBackgroundReport(id);
  const visits = getVisitRecords(id);
  const demands = getDemands(id);

  const renderReportText = (key: string) => {
    const section = report?.report_content[key];
    if (!section) return <p className="text-[13px] text-gray-300">生成背调报告后自动补全</p>;
    return (
      <div className="space-y-1.5 text-[13px] text-gray-700 leading-relaxed">
        {section.content.split('\n').filter(Boolean).map((line, i) => <p key={i}>{line.replace(/\*\*/g, '')}</p>)}
        <p className="mt-2 text-[11px] text-gray-400">来源: {section.source}</p>
      </div>
    );
  };

  const initials = (enterprise.short_name ?? enterprise.name).replace(/上海|有限公司|科技|（.*?）/g, '').slice(0, 2);

  return (
    <div className="min-h-full">
      {/* 页头 */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-[1000px] px-8 pt-6 pb-0">
          <button onClick={() => router.push('/enterprises')} className="mb-4 flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" />企业画像库
          </button>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-[16px] font-extrabold text-white shadow-lg shadow-blue-500/20">
                {initials}
              </div>
              <div>
                <h1 className="text-[20px] font-extrabold text-gray-900">{enterprise.name}</h1>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {enterprise.industry && (
                    <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">{enterprise.industry}</span>
                  )}
                  {enterprise.industry_sub && (
                    <span className="rounded-lg bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">{enterprise.industry_sub}</span>
                  )}
                  {enterprise.development_stage && (
                    <span className="rounded-lg bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">{enterprise.development_stage}</span>
                  )}
                  {enterprise.is_incubated && (
                    <span className="rounded-lg bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-600">孵化企业</span>
                  )}
                </div>
                <div className="mt-2 flex gap-5 text-[12px] text-gray-400">
                  {enterprise.registered_capital && <span>注册资本 <strong className="text-gray-700">{enterprise.registered_capital}</strong></span>}
                  {enterprise.employee_count && <span>员工 <strong className="text-gray-700">{enterprise.employee_count}人</strong></span>}
                  {enterprise.last_visited_at && <span>最近走访 <strong className="text-gray-700">{enterprise.last_visited_at}</strong></span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {report && (
                <button onClick={() => router.push(`/enterprises/${id}/report`)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-[13px] font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 cursor-pointer">
                  查看背调报告
                </button>
              )}
              <button onClick={() => router.push(`/enterprises/${id}/report`)} className="inline-flex h-10 items-center gap-2 rounded-xl grad-blue px-5 text-[13px] font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-500/30 hover:scale-[1.02] cursor-pointer">
                <FileText className="h-3.5 w-3.5" />{report ? '重新生成' : '生成背调报告'}
              </button>
            </div>
          </div>
        </div>

        {/* Tab */}
        <div className="mt-5 flex gap-0 px-8 mx-auto max-w-[1000px]">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'relative px-5 py-3.5 text-[13px] font-medium transition-colors cursor-pointer',
                activeTab === tab ? 'font-bold text-blue-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {tab}
              {tab === '走访记录' && visits.length > 0 && <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">{visits.length}</span>}
              {tab === '需求清单' && demands.length > 0 && <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">{demands.length}</span>}
              {activeTab === tab && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full grad-blue" />}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto max-w-[1000px] px-8 py-6">
        {activeTab === '基本信息' && (
          <div className="space-y-5">
            {enterprise.ai_summary && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-6 shadow-card">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-blue-500">AI 企业摘要</p>
                <p className="text-[14px] leading-relaxed text-gray-800">{enterprise.ai_summary}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-5">
              <Section title="工商信息">
                <Field label="企业全名" value={enterprise.name} />
                <Field label="统一信用代码" value={enterprise.unified_code} />
                <Field label="法定代表人" value={enterprise.legal_person} />
                <Field label="成立日期" value={enterprise.established_date} />
                <Field label="注册资本" value={enterprise.registered_capital} />
                <Field label="注册地址" value={enterprise.registered_address} />
              </Section>
              <Section title="产业定位">
                <Field label="一级产业" value={enterprise.industry} />
                <Field label="二级产业" value={enterprise.industry_sub} />
                <Field label="产业链位置" value={enterprise.supply_chain_position} />
                <Field label="发展阶段" value={enterprise.development_stage} />
                <Field label="员工规模" value={enterprise.employee_count ? `${enterprise.employee_count}人` : undefined} />
              </Section>
              <Section title="股权结构">{renderReportText('equity')}</Section>
              <Section title="融资情况">{renderReportText('funding')}</Section>
              <Section title="核心团队">{renderReportText('team')}</Section>
              <Section title="产品与技术">{renderReportText('products')}</Section>
              <Section title="行业动态">{renderReportText('dynamics')}</Section>
              <Section title="产业链分析">{renderReportText('supply_chain')}</Section>
            </div>
            {report?.feishu_doc_url && (
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <Link2 className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">背调报告 · 飞书文档</p>
                    <p className="text-[11px] text-gray-400">{report.created_by} · {new Date(report.created_at).toLocaleDateString('zh-CN')}</p>
                  </div>
                </div>
                <a href={report.feishu_doc_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-500 hover:underline">
                  在飞书中打开 <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === '走访记录' && (
          visits.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white py-20 text-center shadow-card">
              <Clock className="mx-auto mb-3 h-10 w-10 text-gray-200" />
              <p className="text-[14px] font-medium text-gray-400">暂无走访记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4 text-[11px] text-gray-400">
                {Object.entries(DEPT_DOT).map(([d, c]) => (
                  <span key={d} className="flex items-center gap-1.5">
                    <span className={cn('h-2 w-2 rounded-full', c)} />{d}
                  </span>
                ))}
              </div>
              <div className="relative">
                <div className="absolute left-[5px] top-5 bottom-5 w-px bg-gray-100" />
                <div className="space-y-3">
                  {visits.map(v => <VisitCard key={v.id} record={v} />)}
                </div>
              </div>
            </div>
          )
        )}

        {activeTab === '需求清单' && (
          demands.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white py-20 text-center shadow-card">
              <p className="text-[14px] font-medium text-gray-400">暂无企业需求</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">需求内容</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">类型</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">负责部门</th>
                    <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {demands.map(d => {
                    const statusMap: Record<string, { l: string; c: string }> = {
                      pending: { l: '待处理', c: 'bg-amber-50 text-amber-600' },
                      processing: { l: '处理中', c: 'bg-blue-50 text-blue-600' },
                      done: { l: '已完成', c: 'bg-emerald-50 text-emerald-600' },
                    };
                    const s = statusMap[d.status] ?? statusMap.pending;
                    return (
                      <tr key={d.id} className="border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-[13px] font-medium text-gray-900">{d.demand_content}</td>
                        <td className="px-4 py-4 text-[12px] text-gray-500">{d.demand_type ? DEMAND_TYPE_LABELS[d.demand_type] : '—'}</td>
                        <td className="px-4 py-4 text-[12px] text-gray-500">{d.assigned_department ?? '—'}</td>
                        <td className="px-4 py-4 text-right">
                          <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', s.c)}>{s.l}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === '服务记录' && (
          <div className="rounded-2xl border border-gray-100 bg-white py-20 text-center shadow-card">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-200" />
            <p className="text-[14px] font-medium text-gray-400">服务记录将在 0.3 版本上线</p>
            <p className="mt-1 text-[12px] text-gray-300">包括服务包发放、租赁合同、合作历史等</p>
          </div>
        )}
      </div>
    </div>
  );
}
