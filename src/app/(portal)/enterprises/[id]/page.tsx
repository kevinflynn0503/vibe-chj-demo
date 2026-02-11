/**
 * 企业画像详情 — 多维度信息展示
 * 
 * Tab 体系：
 * 1. AI 分析 — AI 综合评估报告
 * 2. 基本信息 — 工商信息、产业链
 * 3. 财务信息 — 营收、利润、纳税
 * 4. 知识产权 — 专利、商标、软著
 * 5. 团队股东 — 核心团队、股权结构
 * 6. 走访记录
 * 7. 需求清单
 * 8. 政策状态
 */
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, FileText, Video, Building2, Clock, ListChecks,
  Shield, ExternalLink, ChevronRight, CheckCircle2, AlertCircle,
  MapPin, Users, Calendar, Tag, TrendingUp, Briefcase, Globe, Rocket,
  Phone, Mail, Globe2, Copy, Sparkles, Bot, BarChart3,
  Award, BookOpen, Landmark, UserCheck, TrendingDown, DollarSign,
  Lightbulb, Scale, Cpu, PieChart, Star, Zap, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEnterprise, getVisitRecords, getDemands, getBackgroundReport, getAssessments } from '@/lib/mock-data';
import { VISIT_TYPE_LABELS, DEMAND_TYPE_LABELS, GRADE_STYLES, TOUCH_STATUS_LABELS } from '@/lib/schema';
import type { VisitType, DemandType, DemandStatus } from '@/lib/schema';
import { generateReport, linkMinute, exportToFeishu, sendChat } from '@/lib/host-api';

type TabKey = 'ai' | 'basic' | 'finance' | 'ip' | 'team' | 'visits' | 'demands' | 'policy';

const TABS: { key: TabKey; label: string; count?: number }[] = [
  { key: 'ai', label: 'AI 分析' },
  { key: 'basic', label: '基本信息' },
  { key: 'finance', label: '财务信息' },
  { key: 'ip', label: '知识产权' },
  { key: 'team', label: '团队股东' },
  { key: 'visits', label: '走访记录' },
  { key: 'demands', label: '需求清单' },
  { key: 'policy', label: '政策状态' },
];

export default function EnterprisePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const enterprise = getEnterprise(id);
  const [activeTab, setActiveTab] = useState<TabKey>('ai');

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
    <div className="min-h-full pb-10">
      {/* 顶部头卡 */}
      <div className="detail-header">
        <div className="detail-header-inner">
          {/* 返回 + 操作 */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3370FF] transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> 返回企业库
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

          {/* 主要信息 */}
          <div className="flex gap-6">
            <div className="shrink-0 w-20 h-20 rounded-lg bg-blue-600 text-white flex items-center justify-center text-2xl font-bold border border-blue-500">
              {enterprise.name.substring(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-slate-900 truncate">{enterprise.name}</h1>
                <span className={cn("px-2 py-0.5 text-xs font-medium rounded border",
                  enterprise.is_incubated ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                )}>{enterprise.is_incubated ? "在孵" : "存续"}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> 021-5423XXXX</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /> contact@{enterprise.short_name || 'co'}.com</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" />{enterprise.office_address}</span>
              </div>
              {/* 核心指标 */}
              <div className="grid grid-cols-4 gap-4 bg-slate-50 border border-slate-100 rounded-lg p-3">
                <div>
                  <div className="text-[10px] text-slate-400">法定代表人</div>
                  <div className="text-sm font-semibold text-blue-600">{enterprise.legal_person || '-'}</div>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <div className="text-[10px] text-slate-400">注册资本</div>
                  <div className="text-sm font-medium text-slate-900">{enterprise.registered_capital || '-'}</div>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <div className="text-[10px] text-slate-400">成立日期</div>
                  <div className="text-sm font-medium text-slate-900">{enterprise.established_date || '-'}</div>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <div className="text-[10px] text-slate-400">员工规模</div>
                  <div className="text-sm font-medium text-slate-900">{enterprise.employee_count || '-'} 人</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex items-center gap-1 overflow-x-auto border-t border-slate-100 pt-1">
            {tabsWithCounts.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative px-3 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap',
                  activeTab === tab.key
                    ? 'text-[#3370FF] border-[#3370FF]'
                    : 'text-slate-500 border-transparent hover:text-slate-900'
                )}>
                {tab.key === 'ai' && <Sparkles className="h-3 w-3 inline mr-1" />}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="page-container space-y-4">
        {activeTab === 'ai' && <AITab enterprise={enterprise} report={report} assessments={assessments} />}
        {activeTab === 'basic' && <BasicTab enterprise={enterprise} report={report} />}
        {activeTab === 'finance' && <FinanceTab enterprise={enterprise} />}
        {activeTab === 'ip' && <IPTab enterprise={enterprise} />}
        {activeTab === 'team' && <TeamTab enterprise={enterprise} />}
        {activeTab === 'visits' && <VisitsTab visits={visits} router={router} />}
        {activeTab === 'demands' && <DemandsTab demands={demands} />}
        {activeTab === 'policy' && <PolicyTab assessments={assessments} />}
      </div>
    </div>
  );
}

/* ═══ AI 分析 Tab ═══ */
function AITab({ enterprise, report, assessments }: { enterprise: any; report: any; assessments: any[] }) {
  const name = enterprise.short_name ?? enterprise.name;

  // Mock AI 综合评估
  const aiScore = {
    overall: 82,
    growth: 85,
    innovation: 78,
    financial: 80,
    risk: 88,
    policy: assessments.length > 0 ? assessments[0].grade_score : 72,
  };

  return (
    <div className="space-y-6">
      {/* AI 综合评分 */}
      <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-5">
        <div className="flex items-start gap-4">
          <div className="bg-[#3370FF] text-white rounded-xl w-16 h-16 flex flex-col items-center justify-center shrink-0">
            <span className="text-2xl font-bold font-mono">{aiScore.overall}</span>
            <span className="text-[9px] opacity-80">综合评分</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-bold text-slate-900">AI 综合评估</h3>
              <span className="text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">✦ AI 生成</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {enterprise.ai_summary || `「${name}」是一家${enterprise.industry}领域的${enterprise.development_stage}企业，注册资本${enterprise.registered_capital}，员工${enterprise.employee_count}人。综合评估企业发展势头良好，创新能力中上，建议持续关注。`}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button className="btn btn-primary btn-sm" onClick={() => sendChat(`请对「${name}」进行深度综合分析，从市场地位、技术壁垒、财务健康、团队实力、政策机会五个维度出具详细报告。`)}>
                <Sparkles className="h-3.5 w-3.5" /> AI 深度分析
              </button>
              <button className="btn btn-default btn-sm" onClick={() => sendChat(`请用 Deep Research 搜集「${name}」最新的公开信息、新闻、融资动态、专利申请等。`)}>
                <Search className="h-3.5 w-3.5" /> Deep Research
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 维度评分 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: '成长性', score: aiScore.growth, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: TrendingUp },
          { label: '创新力', score: aiScore.innovation, color: 'text-blue-600', bg: 'bg-blue-50', icon: Lightbulb },
          { label: '财务健康', score: aiScore.financial, color: 'text-amber-600', bg: 'bg-amber-50', icon: DollarSign },
          { label: '风险控制', score: aiScore.risk, color: 'text-violet-600', bg: 'bg-violet-50', icon: Shield },
          { label: '政策匹配', score: aiScore.policy, color: 'text-[#3370FF]', bg: 'bg-blue-50', icon: Award },
        ].map((dim, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <dim.icon className={cn("h-5 w-5 mx-auto mb-2", dim.color)} />
            <div className={cn("text-2xl font-bold font-mono", dim.color)}>{dim.score}</div>
            <div className="text-xs text-slate-500 mt-1">{dim.label}</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className={cn("h-full rounded-full", dim.bg.replace('50', '400'))} style={{ width: `${dim.score}%`, backgroundColor: dim.score >= 80 ? '#10b981' : dim.score >= 60 ? '#3370FF' : '#f59e0b' }} />
            </div>
          </div>
        ))}
      </div>

      {/* AI 洞察卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 发展潜力 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" /> 发展潜力
          </h3>
          <div className="space-y-2">
            {[
              { text: '过去三年营收 CAGR 约 35%，高于行业均值', level: 'positive' },
              { text: `${enterprise.industry}赛道处于快速增长期，市场空间广阔`, level: 'positive' },
              { text: '团队核心成员具备行业 10+ 年经验', level: 'positive' },
              { text: '客户集中度偏高，前三大客户占比约 60%', level: 'warning' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className={cn("shrink-0 mt-0.5", item.level === 'positive' ? 'text-emerald-500' : 'text-amber-500')}>
                  {item.level === 'positive' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                </span>
                <span className="text-slate-600">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 风险提示 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-violet-500" /> 风险扫描
          </h3>
          <div className="space-y-2">
            {[
              { text: '无经营异常、行政处罚记录', level: 'safe' },
              { text: '2 条司法诉讼（已结案，非核心业务相关）', level: 'info' },
              { text: '无股权冻结、质押记录', level: 'safe' },
              { text: '知识产权诉讼 0 条', level: 'safe' },
            ].map((item, i) => (
              <div key={i} className={cn("flex items-center justify-between p-2 rounded border text-xs",
                item.level === 'safe' ? 'bg-green-50 text-green-700 border-green-100' :
                item.level === 'info' ? 'bg-slate-50 text-slate-600 border-slate-100' :
                'bg-red-50 text-red-700 border-red-100'
              )}>
                <span>{item.text}</span>
                {item.level === 'safe' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
              </div>
            ))}
          </div>
          <button className="mt-3 text-xs text-[#3370FF] hover:underline flex items-center gap-1"
            onClick={() => sendChat(`请对「${enterprise.short_name ?? enterprise.name}」进行深度风险扫描。`)}>
            <Sparkles className="h-3 w-3" /> 请求 AI 深度风险扫描
          </button>
        </div>

        {/* 合作建议 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" /> AI 合作建议
          </h3>
          <div className="space-y-3 text-xs text-slate-600">
            <p>基于企业画像和园区服务能力，AI 建议：</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2"><span className="text-[#3370FF] font-bold shrink-0">1.</span> 推荐申请高新技术企业认定（匹配度{assessments.length > 0 ? assessments[0].grade_score : 75}%）</div>
              <div className="flex items-start gap-2"><span className="text-[#3370FF] font-bold shrink-0">2.</span> 对接园区内传感器/芯片供应链企业，促进产业协作</div>
              <div className="flex items-start gap-2"><span className="text-[#3370FF] font-bold shrink-0">3.</span> 关注企业人才需求，可推荐园区人才服务</div>
            </div>
          </div>
        </div>

        {/* 行业对标 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" /> 行业对标
          </h3>
          <div className="space-y-3">
            {[
              { label: '营收规模', enterprise: '8,500万', benchmark: '6,200万', better: true },
              { label: '研发投入占比', enterprise: '14.2%', benchmark: '10.5%', better: true },
              { label: '毛利率', enterprise: '42%', benchmark: '45%', better: false },
              { label: '专利数量', enterprise: '28项', benchmark: '35项', better: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-500 w-24">{item.label}</span>
                <span className={cn("font-mono font-bold", item.better ? 'text-emerald-600' : 'text-amber-600')}>{item.enterprise}</span>
                <span className="text-slate-400">行业: {item.benchmark}</span>
                {item.better ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-amber-500" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 深度背调报告 */}
      {report && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" /> 深度背调报告
            <span className="text-[10px] text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">✦ AI 生成</span>
          </h3>
          <div className="space-y-3">
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
  );
}

/* ═══ 基本信息 Tab ═══ */
function BasicTab({ enterprise, report }: { enterprise: any; report: any }) {
  const fields = [
    { label: '企业类型', value: enterprise.is_incubated ? '在孵企业' : '园区企业' },
    { label: '所属行业', value: enterprise.industry },
    { label: '细分领域', value: enterprise.industry_sub },
    { label: '员工规模', value: enterprise.employee_count + '人' },
    { label: '纳税资质', value: '一般纳税人' },
    { label: '参保人数', value: Math.floor(enterprise.employee_count * 0.9) + '人' },
    { label: '统一信用代码', value: enterprise.unified_code || '-' },
    { label: '注册地址', value: enterprise.registered_address, full: true },
    { label: '经营范围', value: enterprise.description || '暂无', full: true },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-600 rounded-full" /> 工商信息
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

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-600 rounded-full" /> 产业链定位
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 p-4 bg-slate-50 rounded border border-slate-100 text-center">
            <div className="text-xs text-slate-500 mb-1">供应链位置</div>
            <div className="text-sm font-semibold text-slate-900">{enterprise.supply_chain_position}</div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
          <div className="flex-1 p-4 bg-slate-50 rounded border border-slate-100 text-center">
            <div className="text-xs text-slate-500 mb-1">发展阶段</div>
            <div className="text-sm font-semibold text-slate-900">{enterprise.development_stage}</div>
          </div>
        </div>
      </div>

      {/* 标签 */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3">企业标签</h3>
        <div className="flex flex-wrap gap-2">
          {enterprise.industry_tags?.map((t: string) => (
            <span key={t} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ 财务信息 Tab ═══ */
function FinanceTab({ enterprise }: { enterprise: any }) {
  const name = enterprise.short_name ?? enterprise.name;

  // Mock 财务数据
  const financialYears = [
    { year: '2025', revenue: '8,500万', profit: '1,200万', tax: '420万', rdRatio: '14.2%', growth: '+28%' },
    { year: '2024', revenue: '6,600万', profit: '880万', tax: '310万', rdRatio: '13.5%', growth: '+35%' },
    { year: '2023', revenue: '4,900万', profit: '520万', tax: '180万', rdRatio: '12.8%', growth: '+42%' },
  ];

  const financialIndicators = [
    { label: '2025 营收', value: '8,500万', change: '+28%', up: true },
    { label: '净利润', value: '1,200万', change: '+36%', up: true },
    { label: '纳税总额', value: '420万', change: '+35%', up: true },
    { label: '研发投入占比', value: '14.2%', change: '+0.7%', up: true },
  ];

  return (
    <div className="space-y-4">
      {/* 关键指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {financialIndicators.map((fi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500 mb-1">{fi.label}</div>
            <div className="text-xl font-bold font-mono text-slate-900">{fi.value}</div>
            <div className={cn("text-xs font-medium mt-1 flex items-center gap-1", fi.up ? 'text-emerald-600' : 'text-red-500')}>
              {fi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {fi.change}
            </div>
          </div>
        ))}
      </div>

      {/* 历年财务 */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">历年财务数据</h3>
          <button className="text-xs text-[#3370FF] hover:underline flex items-center gap-1"
            onClick={() => sendChat(`请分析「${name}」的财务数据趋势，评估其盈利能力、成长性和财务健康度。`)}>
            <Sparkles className="h-3 w-3" /> AI 财务分析
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="px-4 py-3 text-left font-medium">年份</th>
                <th className="px-4 py-3 text-right font-medium">营业收入</th>
                <th className="px-4 py-3 text-right font-medium">净利润</th>
                <th className="px-4 py-3 text-right font-medium">纳税额</th>
                <th className="px-4 py-3 text-right font-medium">研发占比</th>
                <th className="px-4 py-3 text-right font-medium">增长率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {financialYears.map((fy, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{fy.year}</td>
                  <td className="px-4 py-3 text-right font-mono">{fy.revenue}</td>
                  <td className="px-4 py-3 text-right font-mono">{fy.profit}</td>
                  <td className="px-4 py-3 text-right font-mono">{fy.tax}</td>
                  <td className="px-4 py-3 text-right font-mono">{fy.rdRatio}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-emerald-600 font-medium">{fy.growth}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 资产负债 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3">资产结构</h3>
          <div className="space-y-2">
            {[
              { label: '总资产', value: '2.1亿' },
              { label: '净资产', value: '1.3亿' },
              { label: '资产负债率', value: '38.2%' },
              { label: '流动比率', value: '2.1' },
              { label: '速动比率', value: '1.8' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-b-0">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-sm font-mono font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3">融资记录</h3>
          <div className="space-y-3">
            {[
              { round: 'B 轮', amount: '5,000万', date: '2024-06', investor: '深创投' },
              { round: 'A 轮', amount: '2,000万', date: '2022-03', investor: '松禾资本' },
              { round: '天使轮', amount: '500万', date: '2020-08', investor: '个人投资者' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-xs font-bold text-[#3370FF] bg-blue-50 px-2 py-0.5 rounded">{item.round}</span>
                <div className="flex-1">
                  <span className="text-sm font-mono font-bold text-slate-900">{item.amount}</span>
                  <span className="text-xs text-slate-400 ml-2">{item.investor}</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ 知识产权 Tab ═══ */
function IPTab({ enterprise }: { enterprise: any }) {
  const name = enterprise.short_name ?? enterprise.name;

  return (
    <div className="space-y-4">
      {/* 知识产权概览 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: '发明专利', value: 12, icon: Lightbulb, color: 'text-blue-600' },
          { label: '实用新型', value: 8, icon: Cpu, color: 'text-emerald-600' },
          { label: '外观设计', value: 3, icon: PieChart, color: 'text-violet-600' },
          { label: '软件著作权', value: 15, icon: BookOpen, color: 'text-amber-600' },
          { label: '商标', value: 5, icon: Award, color: 'text-red-500' },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 text-center">
            <item.icon className={cn("h-5 w-5 mx-auto mb-2", item.color)} />
            <div className={cn("text-2xl font-bold font-mono", item.color)}>{item.value}</div>
            <div className="text-xs text-slate-500 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 专利列表 */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">专利列表（Top 10）</h3>
          <button className="text-xs text-[#3370FF] hover:underline flex items-center gap-1"
            onClick={() => sendChat(`请分析「${name}」的知识产权布局，评估其技术壁垒和专利质量。`)}>
            <Sparkles className="h-3 w-3" /> AI 分析知识产权
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { title: '一种基于深度学习的传感器数据融合方法', type: '发明', status: '已授权', date: '2024-08-15', no: 'CN2024XXXX1' },
            { title: '毫米波雷达信号处理装置', type: '发明', status: '已授权', date: '2024-03-22', no: 'CN2024XXXX2' },
            { title: '多传感器协同感知系统', type: '发明', status: '实审', date: '2025-01-10', no: 'CN2025XXXX1' },
            { title: '激光雷达点云数据处理方法', type: '发明', status: '实审', date: '2025-06-18', no: 'CN2025XXXX2' },
            { title: '车载传感器安装支架', type: '实用新型', status: '已授权', date: '2023-11-05', no: 'CN2023XXXX1' },
            { title: '传感器数据采集管理系统 V2.0', type: '软著', status: '已登记', date: '2024-05-12', no: '2024SR0XXXX' },
          ].map((p, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded border shrink-0",
                p.type === '发明' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                p.type === '实用新型' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                'bg-amber-50 text-amber-600 border-amber-100'
              )}>{p.type}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-900 truncate">{p.title}</div>
                <div className="text-xs text-slate-400 font-mono">{p.no}</div>
              </div>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded",
                p.status === '已授权' || p.status === '已登记' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
              )}>{p.status}</span>
              <span className="text-xs text-slate-400 font-mono">{p.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 商标 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-bold text-slate-900 mb-3">商标注册</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['SenseTech', '芯视感知', 'DeepSense', '智驾之眼', '芯视云'].map((tm, i) => (
            <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded text-center">
              <div className="text-sm font-bold text-slate-900">{tm}</div>
              <div className="text-[10px] text-emerald-500 mt-1">已注册</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ 团队股东 Tab ═══ */
function TeamTab({ enterprise }: { enterprise: any }) {
  const name = enterprise.short_name ?? enterprise.name;

  // Mock 团队数据
  const coreTeam = [
    { name: enterprise.legal_person || '张明远', title: '创始人 & CEO', background: '清华电子系硕士，15年行业经验，前华为自动驾驶部门负责人', avatar: '张' },
    { name: '李思远', title: 'CTO', background: '浙大计算机博士，前百度 Apollo 核心工程师，持有 8 项核心专利', avatar: '李' },
    { name: '王芳', title: 'COO', background: 'MBA，10年运营管理经验，前滴滴区域运营总监', avatar: '王' },
    { name: '陈志华', title: '研发总监', background: '中科院自动化所博士后，深度学习与传感器融合专家', avatar: '陈' },
  ];

  const shareholders = [
    { name: enterprise.legal_person || '张明远', ratio: '42%', type: '自然人' },
    { name: '深创投', ratio: '18%', type: '机构' },
    { name: '松禾资本', ratio: '12%', type: '机构' },
    { name: '李思远', ratio: '10%', type: '自然人' },
    { name: '员工持股平台', ratio: '8%', type: '其他' },
    { name: '其他', ratio: '10%', type: '其他' },
  ];

  return (
    <div className="space-y-4">
      {/* 核心团队 */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">核心团队</h3>
          <button className="text-xs text-[#3370FF] hover:underline flex items-center gap-1"
            onClick={() => sendChat(`请搜集「${name}」核心团队成员的公开背景信息、行业声誉和关联企业。`)}>
            <Sparkles className="h-3 w-3" /> AI 调研团队
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {coreTeam.map((p, i) => (
            <div key={i} className="px-4 py-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {p.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-slate-900">{p.name}</span>
                  <span className="text-xs text-[#3370FF] bg-blue-50 px-1.5 py-0.5 rounded">{p.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{p.background}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 股东结构 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-bold text-slate-900 mb-4">股东结构</h3>
        <div className="space-y-2">
          {shareholders.map((sh, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded border shrink-0",
                  sh.type === '自然人' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  sh.type === '机构' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                  'bg-slate-50 text-slate-500 border-slate-100'
                )}>{sh.type}</span>
                <span className="text-sm text-slate-900">{sh.name}</span>
              </div>
              <span className="text-sm font-bold font-mono text-slate-900 w-16 text-right">{sh.ratio}</span>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#3370FF] rounded-full" style={{ width: sh.ratio }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 员工构成 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-bold text-slate-900 mb-3">员工构成</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '总员工数', value: enterprise.employee_count || 120 },
            { label: '研发人员', value: Math.round((enterprise.employee_count || 120) * 0.45), ratio: '45%' },
            { label: '硕士及以上', value: Math.round((enterprise.employee_count || 120) * 0.3), ratio: '30%' },
            { label: '参保人数', value: Math.round((enterprise.employee_count || 120) * 0.9) },
          ].map((item, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
              <div className="text-xl font-bold font-mono text-slate-900">{item.value}</div>
              <div className="text-xs text-slate-500 mt-1">{item.label}</div>
              {item.ratio && <div className="text-[10px] text-[#3370FF] mt-0.5">占比 {item.ratio}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ 走访记录 Tab ═══ */
function VisitsTab({ visits, router }: { visits: any[]; router: any }) {
  if (visits.length === 0) return <EmptyState text="暂无走访记录" />;

  return (
    <div className="space-y-3">
      {visits.map(v => (
        <div key={v.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer group"
          onClick={() => router.push(`/visit/confirm/${v.id}`)}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-900">{v.visit_date}</span>
              <span className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">{v.visitor_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs px-2 py-0.5 rounded-full border",
                v.is_confirmed ? "bg-green-50 text-green-600 border-green-200" : "bg-amber-50 text-amber-600 border-amber-200"
              )}>{v.is_confirmed ? "已确认" : "待确认"}</span>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded text-sm">
            <div>
              <span className="text-slate-500 block mb-1 text-xs">访谈对象</span>
              <span className="text-slate-900 font-medium text-xs">{v.counterpart_name} {v.counterpart_title}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1 text-xs">关键发现</span>
              <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-xs">
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

/* ═══ 需求清单 Tab ═══ */
function DemandsTab({ demands }: { demands: any[] }) {
  if (demands.length === 0) return <EmptyState text="暂无需求，可通过 AI 走访提取" />;

  const statusMap: Record<string, string> = { pending: '待处理', processing: '处理中', done: '已完成' };
  const statusClass: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    done: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 text-xs">
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
              <td className="px-4 py-3"><span className="tag-blue text-xs">{DEMAND_TYPE_LABELS[d.demand_type as DemandType]}</span></td>
              <td className="px-4 py-3 text-slate-600 text-xs">{d.assigned_department || '-'}</td>
              <td className="px-4 py-3">
                <span className={cn("px-2 py-0.5 text-xs rounded border", statusClass[d.status])}>
                  {statusMap[d.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500 font-mono text-xs">{d.created_at.split('T')[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══ 政策状态 Tab ═══ */
function PolicyTab({ assessments }: { assessments: any[] }) {
  if (assessments.length === 0) return <EmptyState text="暂无政策评估" />;

  return (
    <div className="space-y-4">
      {assessments.map(a => (
        <div key={a.id} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-slate-900">{a.policy_type}</h3>
              <span className={cn("px-2 py-0.5 text-xs rounded font-medium",
                GRADE_STYLES[a.grade as keyof typeof GRADE_STYLES].bg,
                GRADE_STYLES[a.grade as keyof typeof GRADE_STYLES].text
              )}>{GRADE_STYLES[a.grade as keyof typeof GRADE_STYLES].label}</span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-slate-500 text-xs">得分 {a.grade_score}</span>
            </div>
            <div className="text-xs text-slate-500">更新于 {a.updated_at.split('T')[0]}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
