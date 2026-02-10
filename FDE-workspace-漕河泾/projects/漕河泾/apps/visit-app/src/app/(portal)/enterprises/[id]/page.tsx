/**
 * 企业画像详情 — Qichacha Style
 * 密集信息网格 + 顶部固定 Tab
 */
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft, FileText, Video, Building2, Clock, ListChecks,
  Shield, ExternalLink, ChevronRight, CheckCircle2, AlertCircle,
  MapPin, Users, Calendar, Tag, TrendingUp, Briefcase, Globe, Rocket,
  Phone, Mail, Globe2, Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEnterprise, getVisitRecords, getDemands, getBackgroundReport, getAssessments } from '@/lib/mock-data';
import { VISIT_TYPE_LABELS, DEMAND_TYPE_LABELS, GRADE_STYLES, TOUCH_STATUS_LABELS } from '@/lib/schema';
import type { VisitType, DemandType, DemandStatus } from '@/lib/schema';
import { generateReport, linkMinute, exportToFeishu } from '@/lib/host-api';

type TabKey = 'basic' | 'visits' | 'demands' | 'policy';

const TABS: { key: TabKey; label: string; count?: number }[] = [
  { key: 'basic', label: '基本信息' },
  { key: 'visits', label: '走访记录' },
  { key: 'demands', label: '需求清单' },
  { key: 'policy', label: '政策状态' },
];

const GRADE_TAG: Record<string, string> = {
  A: 'tag-green', B: 'tag-blue', C: 'tag-orange', unqualified: 'tag-gray',
};

export default function EnterprisePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const enterprise = getEnterprise(id);
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  if (!enterprise) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <div className="empty-state">
          <p className="text-sm text-slate-500">未找到企业 {id}</p>
          <button className="btn btn-default btn-sm mt-3" onClick={() => router.back()}>返回</button>
        </div>
      </div>
    );
  }

  const visits = getVisitRecords(id);
  const demands = getDemands(id);
  const report = getBackgroundReport(id);
  const assessments = getAssessments().filter(a => a.enterprise_id === id);
  const name = enterprise.short_name ?? enterprise.name;

  // Update tab counts
  const tabsWithCounts = TABS.map(t => {
    if (t.key === 'visits') return { ...t, count: visits.length };
    if (t.key === 'demands') return { ...t, count: demands.length };
    return t;
  });

  return (
    <div className="min-h-screen bg-[#F5F6F7] pb-10">
      {/* 顶部详情头卡 — 统一模板B */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          {/* 返回按钮 — 统一样式 */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              返回企业库
            </button>
            <div className="flex items-center gap-2">
              <button className="btn btn-default btn-sm" onClick={() => linkMinute(name)}>
                <Video className="h-3.5 w-3.5" /> 关联妙记
              </button>
              <button className="btn btn-default btn-sm" onClick={() => exportToFeishu(name, '企业画像')}>
                <ExternalLink className="h-3.5 w-3.5" /> 导出飞书
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => generateReport(name)}>
                <FileText className="h-3.5 w-3.5" /> 生成背调
              </button>
            </div>
          </div>

          {/* 主要信息区域 */}
          <div>
            <div className="flex gap-6">
              {/* Logo */}
              <div className="shrink-0 w-24 h-24 rounded-lg bg-blue-600 text-white flex items-center justify-center text-3xl font-bold border border-blue-500">
                {enterprise.name.substring(0, 1)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900 truncate">{enterprise.name}</h1>
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded border",
                    enterprise.is_incubated 
                      ? "bg-purple-50 text-purple-700 border-purple-200" 
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  )}>
                    {enterprise.is_incubated ? "在孵" : "存续"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>021-5423XXXX</span>
                    <button className="text-blue-600 hover:underline ml-1 text-xs">查看</button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>contact@{enterprise.short_name || 'company'}.com</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe2 className="h-3.5 w-3.5 text-slate-400" />
                    <a href="#" className="text-blue-600 hover:underline">www.{enterprise.short_name || 'company'}.com</a>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate max-w-[300px]">{enterprise.office_address}</span>
                  </div>
                </div>

                {/* 核心指标网格 - Qichacha 风格 */}
                <div className="grid grid-cols-4 gap-4 bg-slate-50 border border-slate-100 rounded-lg p-4">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">法定代表人</div>
                    <div className="text-base font-semibold text-blue-600 flex items-center gap-1">
                      {enterprise.legal_person || '-'}
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded border border-red-100 font-normal">关联</span>
                    </div>
                  </div>
                  <div className="space-y-1 border-l border-slate-200 pl-4">
                    <div className="text-xs text-slate-500">注册资本</div>
                    <div className="text-base font-medium text-slate-900">{enterprise.registered_capital || '-'}</div>
                  </div>
                  <div className="space-y-1 border-l border-slate-200 pl-4">
                    <div className="text-xs text-slate-500">成立日期</div>
                    <div className="text-base font-medium text-slate-900">{enterprise.established_date || '-'}</div>
                  </div>
                  <div className="space-y-1 border-l border-slate-200 pl-4">
                    <div className="text-xs text-slate-500">统一社会信用代码</div>
                    <div className="text-sm font-medium text-slate-900 font-mono break-all">{enterprise.unified_code || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI 摘要 (Mini) */}
            {enterprise.ai_summary && (
              <div className="mt-4 flex items-start gap-2 text-sm bg-blue-50/50 p-3 rounded border border-blue-100/50">
                <span className="shrink-0 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">AI Insight</span>
                <span className="text-slate-700">{enterprise.ai_summary}</span>
              </div>
            )}
          </div>

          {/* Sticky Tabs */}
          <div className="sticky top-0 z-10 bg-white border-t border-slate-200 mt-4">
            <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto">
              {tabsWithCounts.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'relative py-3 text-sm font-medium transition-colors border-b-2',
                    activeTab === tab.key
                      ? 'text-[#3370FF] border-[#3370FF]'
                      : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1.5 text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 — 统一 p-4 sm:p-6 */}
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6">
        {activeTab === 'basic' && <BasicTab enterprise={enterprise} report={report} />}
        {activeTab === 'visits' && <VisitsTab visits={visits} router={router} />}
        {activeTab === 'demands' && <DemandsTab demands={demands} />}
        {activeTab === 'policy' && <PolicyTab assessments={assessments} />}
      </div>
    </div>
  );
}

/* ── Tab Components ── */

function BasicTab({ enterprise, report }: { enterprise: any; report: any }) {
  const fields = [
    { label: '企业类型', value: enterprise.is_incubated ? '在孵企业' : '园区企业' },
    { label: '所属行业', value: enterprise.industry },
    { label: '细分领域', value: enterprise.industry_sub },
    { label: '员工规模', value: enterprise.employee_count + '人' },
    { label: '纳税资质', value: '一般纳税人' }, // Mock
    { label: '参保人数', value: Math.floor(enterprise.employee_count * 0.9) + '人' }, // Mock
    { label: '曾用名', value: '-' },
    { label: '注册地址', value: enterprise.registered_address, full: true },
    { label: '经营范围', value: enterprise.description || '暂无描述', full: true },
  ];

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* 左侧：工商信息 */}
      <div className="col-span-8 space-y-4">
        <div className="enterprise-card">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            工商信息
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {fields.map((f, i) => (
              <div key={i} className={cn("flex flex-col gap-1", f.full && "col-span-2")}>
                <span className="text-xs text-slate-500">{f.label}</span>
                <span className="text-sm text-slate-900">{f.value || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 产业链位置 */}
        <div className="enterprise-card">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            产业链定位
          </h3>
          <div className="flex items-center gap-4">
             <div className="flex-1 p-4 bg-slate-50 rounded border border-slate-100 text-center">
                <div className="text-xs text-slate-500 mb-1">供应链位置</div>
                <div className="text-sm font-semibold text-slate-900">{enterprise.supply_chain_position}</div>
             </div>
             <div className="text-slate-300">→</div>
             <div className="flex-1 p-4 bg-slate-50 rounded border border-slate-100 text-center">
                <div className="text-xs text-slate-500 mb-1">发展阶段</div>
                <div className="text-sm font-semibold text-slate-900">{enterprise.development_stage}</div>
             </div>
          </div>
        </div>

        {/* 报告内容 */}
        {report && (
          <div className="enterprise-card">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
              深度背调
            </h3>
            <div className="space-y-4">
              {Object.values(report.report_content).map((section: any, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded border border-slate-100">
                  <div className="font-semibold text-sm text-slate-900 mb-2">{section.title}</div>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{section.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 右侧：标签与风险 */}
      <div className="col-span-4 space-y-4">
        <div className="enterprise-card">
          <h3 className="text-sm font-bold text-slate-900 mb-3">企业标签</h3>
          <div className="flex flex-wrap gap-2">
            {enterprise.industry_tags?.map((t: string) => (
              <span key={t} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">{t}</span>
            ))}
          </div>
        </div>
        
        <div className="enterprise-card">
          <h3 className="text-sm font-bold text-slate-900 mb-3">风险扫描</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm p-2 bg-green-50 text-green-700 rounded border border-green-100">
              <span>经营异常</span>
              <span>无</span>
            </div>
            <div className="flex items-center justify-between text-sm p-2 bg-green-50 text-green-700 rounded border border-green-100">
              <span>行政处罚</span>
              <span>无</span>
            </div>
             <div className="flex items-center justify-between text-sm p-2 bg-slate-50 text-slate-500 rounded border border-slate-100">
              <span>法律诉讼</span>
              <span>2条</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisitsTab({ visits, router }: { visits: any[]; router: any }) {
  if (visits.length === 0) return <EmptyState text="暂无走访记录" />;

  return (
    <div className="space-y-4">
      {visits.map(v => (
        <div key={v.id} className="enterprise-card hover:border-blue-300 transition-colors cursor-pointer group" onClick={() => router.push(`/visit/confirm/${v.id}`)}>
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-3">
               <span className="text-base font-semibold text-slate-900">{v.visit_date}</span>
               <span className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">{v.visitor_name}</span>
               <span className="text-sm text-slate-500">{v.visitor_department}</span>
             </div>
             <div className="flex items-center gap-2">
                <span className={cn("text-xs px-2 py-0.5 rounded-full border", v.is_confirmed ? "bg-green-50 text-green-600 border-green-200" : "bg-amber-50 text-amber-600 border-amber-200")}>
                  {v.is_confirmed ? "已确认" : "待确认"}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3 rounded text-sm mb-2">
            <div>
              <span className="text-slate-500 block mb-1">访谈对象</span>
              <span className="text-slate-900 font-medium">{v.counterpart_name} {v.counterpart_title}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">关键发现</span>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                {v.key_findings?.slice(0, 2).map((k: string, i: number) => (
                  <li key={i} className="truncate">{k}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DemandsTab({ demands }: { demands: any[] }) {
  if (demands.length === 0) return <EmptyState text="暂无需求" />;

  const statusMap: Record<string, string> = { pending: '待处理', processing: '处理中', done: '已完成' };
  const statusClass: Record<string, string> = { 
    pending: 'bg-amber-50 text-amber-700 border-amber-200', 
    processing: 'bg-blue-50 text-blue-700 border-blue-200', 
    done: 'bg-green-50 text-green-700 border-green-200' 
  };

  return (
    <div className="enterprise-card p-0 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
          <tr>
            <th className="px-4 py-3">需求内容</th>
            <th className="px-4 py-3 w-32">类型</th>
            <th className="px-4 py-3 w-32">分配部门</th>
            <th className="px-4 py-3 w-24">状态</th>
            <th className="px-4 py-3 w-32">时间</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {demands.map(d => (
            <tr key={d.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-900 font-medium">{d.demand_content}</td>
              <td className="px-4 py-3"><span className="tag-blue">{DEMAND_TYPE_LABELS[d.demand_type as DemandType]}</span></td>
              <td className="px-4 py-3 text-slate-600">{d.assigned_department || '-'}</td>
              <td className="px-4 py-3">
                <span className={cn("px-2 py-0.5 text-xs rounded border", statusClass[d.status])}>
                  {statusMap[d.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500 font-mono">{d.created_at.split('T')[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PolicyTab({ assessments }: { assessments: any[] }) {
  if (assessments.length === 0) return <EmptyState text="暂无政策评估" />;

  return (
    <div className="space-y-4">
      {assessments.map(a => (
        <div key={a.id} className="enterprise-card">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-slate-900">{a.policy_type}</h3>
              <span className={cn("px-2 py-0.5 text-xs rounded font-medium", GRADE_STYLES[a.grade as keyof typeof GRADE_STYLES].bg, GRADE_STYLES[a.grade as keyof typeof GRADE_STYLES].text)}>
                {GRADE_STYLES[a.grade as keyof typeof GRADE_STYLES].label}
              </span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-slate-500 text-xs">得分 {a.grade_score}</span>
            </div>
            <div className="text-xs text-slate-500">更新于 {a.updated_at.split('T')[0]}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {a.screening_details.map((d: any, i: number) => (
               <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                 <div className="flex items-center gap-2">
                   {d.result === 'pass' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                   {d.result === 'fail' && <AlertCircle className="h-4 w-4 text-red-500" />}
                   {d.result === 'pending' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                   <span className="text-sm text-slate-700">{d.rule_name}</span>
                 </div>
                 <div className="text-xs text-slate-500 text-right">
                   <div>{d.enterprise_value || '未获取'}</div>
                   <div className="scale-90 opacity-70">要求: {d.required_value}</div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-12 text-center">
      <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
        <Briefcase className="h-6 w-6 text-slate-300" />
      </div>
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  );
}
