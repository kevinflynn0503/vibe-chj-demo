/**
 * 走访工作台 — AI 融入版
 * 
 * 改造点：
 * 1. 头部增加「新增走访」入口
 * 2. 准备阶段卡片：展示 AI 生成状态 + 一键生成走访准备
 * 3. 确认阶段卡片：标注 AI 提取状态
 * 4. 跟进阶段：点击进入跟进详情页（AI 建议），而非企业库
 * 5. 走访阶段卡片：标注背调就绪状态
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  Search, AlertCircle, FileText, CheckCircle2, Target, Clock,
  ChevronRight, Building2, Calendar, User, Plus, MoreHorizontal,
  MapPin, Users, Phone, Sparkles, Bot, ArrowRight, Lightbulb
} from 'lucide-react';
import { getEnterprises, getVisitRecords, getDemands, getBackgroundReport } from '@/lib/mock-data';
import { generateReport } from '@/lib/host-api';
import { cn } from '@/lib/utils';

export default function VisitWorkbench() {
  const router = useRouter();
  const enterprises = getEnterprises();
  const records = getVisitRecords();
  const demands = getDemands();
  const [search, setSearch] = useState('');

  const prepareList = useMemo(() => {
    const visitedIds = new Set(records.map(r => r.enterprise_id));
    return enterprises
      .filter(e => !visitedIds.has(e.id))
      .slice(0, 6);
  }, [enterprises, records]);

  const visitList = useMemo(() => [
    { ent: enterprises[0], time: '10:00', date: '今天', type: '首次拜访', contact: '周敏 CEO', owner: '蔡建' },
    { ent: enterprises[1], time: '14:00', date: '今天', type: '政策宣讲', contact: '张伟 供应链总监', owner: '薛坤' },
    { ent: enterprises[2], time: '09:30', date: '明天', type: '需求对接', contact: '王磊 CEO', owner: '赵婧' },
  ], [enterprises]);

  const confirmList = useMemo(() => records
    .filter(r => !r.is_confirmed)
    .map(r => ({
      ...r,
      enterprise: enterprises.find(e => e.id === r.enterprise_id),
    })), [records, enterprises]);

  const followList = useMemo(() => demands
    .filter(d => d.status === 'pending')
    .slice(0, 6)
    .map(d => ({
      enterprise: enterprises.find(e => e.id === d.enterprise_id)!,
      demand: d,
    })), [demands, enterprises]);

  const total = prepareList.length + visitList.length + confirmList.length + followList.length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 头部卡片 */}
      <div className="shrink-0 px-4 sm:px-6 pt-4">
        <div className="max-w-[1200px] mx-auto bg-white rounded-[10px] border border-slate-200 p-4"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="section-title mb-1">走访任务看板</div>
              <p className="text-xs text-slate-500 ml-[13px]">走访全流程：准备 → 走访 → 确认 → 跟进 · {total} 项任务</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="搜索..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:border-[#3370FF] focus:outline-none focus:shadow-[0_0_0_3px_rgba(51,112,255,0.06)] transition-all" />
              </div>
              <button className="btn btn-default btn-sm shrink-0" onClick={() => router.push('/visit/records')}>
                <FileText className="h-3.5 w-3.5" /> 走访记录
              </button>
              <button className="btn btn-primary btn-sm shrink-0" onClick={() => router.push('/enterprises')}>
                <Plus className="h-3.5 w-3.5" /> 新增走访
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 看板 */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="max-w-[1200px] mx-auto h-full flex gap-4 p-4 sm:p-6" style={{ minWidth: '1100px' }}>

          {/* ─── 准备阶段 ─── */}
          <Col title="准备阶段" count={prepareList.length} color="bg-blue-500">
            {prepareList.map(ent => {
              const hasReport = !!getBackgroundReport(ent.id);
              return (
                <Card key={ent.id} onClick={() => router.push(`/visit/${ent.id}`)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-semibold text-slate-900 leading-snug">{ent.short_name ?? ent.name}</div>
                    <div className={cn("w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0 ml-2",
                      ent.is_incubated ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-blue-600"
                    )}>{(ent.short_name ?? ent.name).charAt(0)}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {ent.industry && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{ent.industry}</span>}
                    {ent.development_stage && <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded">{ent.development_stage}</span>}
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500">
                    {ent.employee_count && <div className="flex items-center gap-1"><Users className="h-3 w-3" />{ent.employee_count.toLocaleString()} 人</div>}
                    {ent.legal_person && <div className="flex items-center gap-1"><User className="h-3 w-3" />法人: {ent.legal_person}</div>}
                  </div>

                  {/* AI 状态区域 */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    {hasReport ? (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />
                          <Bot className="h-3 w-3" />
                          AI 已生成背调+清单
                        </span>
                        <button
                          className="text-[10px] text-[#3370FF] font-medium hover:underline"
                          onClick={(e) => { e.stopPropagation(); router.push(`/visit/${ent.id}`); }}
                        >查看准备 →</button>
                      </div>
                    ) : (
                      <button
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium text-[#3370FF] bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 transition-colors"
                        onClick={(e) => { e.stopPropagation(); generateReport(ent.short_name ?? ent.name); }}
                      >
                        <Sparkles className="h-3 w-3" />
                        一键 AI 生成走访准备
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </Col>

          {/* ─── 走访阶段 ─── */}
          <Col title="走访阶段" count={visitList.length} color="bg-violet-500">
            {visitList.map((item, i) => {
              const hasReport = !!getBackgroundReport(item.ent.id);
              return (
                <Card key={i} onClick={() => router.push(`/visit/${item.ent.id}`)}>
                  <div className="text-sm font-semibold text-slate-900 mb-2">{item.ent.short_name ?? item.ent.name}</div>
                  <div className="flex items-center gap-2 mb-2 p-2 bg-violet-50 rounded border border-violet-100">
                    <Calendar className="h-4 w-4 text-violet-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-violet-700">{item.date} {item.time}</div>
                      <div className="text-[10px] text-violet-500">{item.type}</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500 mb-2">
                    <div className="flex items-center gap-1"><Phone className="h-3 w-3" />对接人: {item.contact}</div>
                    <div className="flex items-center gap-1"><User className="h-3 w-3" />负责人: {item.owner}</div>
                  </div>
                  {/* AI 就绪状态 */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    {hasReport ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Bot className="h-3 w-3" /><CheckCircle2 className="h-3 w-3" />背调+清单已就绪
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Clock className="h-3 w-3" />背调待生成
                      </span>
                    )}
                    <span className="text-slate-400">{item.type}</span>
                  </div>
                </Card>
              );
            })}
          </Col>

          {/* ─── 确认阶段 ─── */}
          <Col title="确认阶段" count={confirmList.length} color="bg-amber-500">
            {confirmList.map(item => (
              <Card key={item.id} onClick={() => router.push(`/visit/confirm/${item.id}`)}>
                <div className="text-sm font-semibold text-slate-900 mb-2">{item.enterprise?.short_name ?? item.enterprise?.name}</div>
                <div className="p-2 bg-amber-50 rounded border border-amber-100 mb-2">
                  <div className="text-xs font-medium text-amber-700 mb-1">走访日期: {item.visit_date}</div>
                  {item.key_findings && item.key_findings.length > 0 && (
                    <div className="text-[11px] text-amber-600 line-clamp-2">{item.key_findings[0]}</div>
                  )}
                </div>
                <div className="space-y-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1"><User className="h-3 w-3" />访客: {item.visitor_name} · {item.visitor_department}</div>
                  {item.demands && item.demands.length > 0 && (
                    <div className="flex items-center gap-1"><Target className="h-3 w-3 text-amber-500" />{item.demands.length} 条诉求待确认</div>
                  )}
                </div>
                {/* AI 提取标识 */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1 text-[#3370FF]">
                    <Bot className="h-3 w-3" />AI 已提取，待您确认
                  </span>
                  <span className="text-slate-400">{item.visit_type}</span>
                </div>
              </Card>
            ))}
          </Col>

          {/* ─── 跟进阶段 ─── */}
          <Col title="跟进阶段" count={followList.length} color="bg-emerald-500">
            {followList.map((item, i) => (
              <Card key={i} onClick={() => router.push(`/visit/${item.enterprise.id}/follow?demand=${item.demand.id}`)}>
                <div className="text-sm font-semibold text-slate-900 mb-2">{item.enterprise.short_name ?? item.enterprise.name}</div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100 mb-2">
                  <div className="text-xs text-slate-700 leading-relaxed line-clamp-2">{item.demand.demand_content}</div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.demand.demand_type && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100">{item.demand.demand_type}</span>}
                  <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded border border-red-100">待处理</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                  <Building2 className="h-3 w-3" />分配: {item.demand.assigned_department || '待分配'}
                </div>
                {/* AI 跟进建议入口 */}
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <button
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-100 transition-colors"
                    onClick={(e) => { e.stopPropagation(); router.push(`/visit/${item.enterprise.id}/follow?demand=${item.demand.id}`); }}
                  >
                    <Sparkles className="h-3 w-3" />
                    查看 AI 跟进建议
                  </button>
                </div>
              </Card>
            ))}
          </Col>

        </div>
      </div>
    </div>
  );
}

/* ── 组件 ── */

function Col({ title, count, color, children }: { title: string; count: number; color: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 min-w-[260px] max-w-[320px] flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-4">{children}</div>
    </div>
  );
}

function Card({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-[10px] p-3 hover:border-slate-300 transition-all cursor-pointer"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02)' }}
      onClick={onClick}>
      {children}
    </div>
  );
}
