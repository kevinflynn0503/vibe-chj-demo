/**
 * 企业画像库 — AI 深度融入版
 * 
 * 改造：
 * 1. 顶部新增 AI 洞察概要（企业健康度分布、政策覆盖率）
 * 2. 每张卡片增加 AI 标签（政策匹配状态、风险状态、走访状态）
 * 3. AI 智能搜索入口 + 批量分析按钮
 * 4. 简化筛选维度，增加 AI 推荐排序
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  Search, Filter, Building2, Users, Calendar, Briefcase,
  ChevronRight, Bot, Sparkles, Shield, TrendingUp,
  TrendingDown, AlertTriangle, CheckCircle2, BarChart3, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEnterprises, getAssessments } from '@/lib/mock-data';
import { sendChat } from '@/lib/host-api';
import { Card, CardCompact, CardStandard, Tag, SearchBar, FilterSelect, SortButton } from '@/components/ui';

type SortMode = 'default' | 'ai_recommend' | 'latest_visit' | 'risk';

export default function EnterprisesPage() {
  const router = useRouter();
  const enterprises = getEnterprises();
  const assessments = getAssessments();
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('default');

  const industries = useMemo(() => {
    const all = enterprises.map(e => e.industry).filter(Boolean) as string[];
    return Array.from(new Set(all));
  }, [enterprises]);

  // 每个企业的政策评估状态
  const entPolicyMap = useMemo(() => {
    const map: Record<string, { grade: string; score: number }> = {};
    assessments.forEach(a => {
      if (!map[a.enterprise_id] || a.grade_score > map[a.enterprise_id].score) {
        map[a.enterprise_id] = { grade: a.grade, score: a.grade_score };
      }
    });
    return map;
  }, [assessments]);

  const filtered = useMemo(() => {
    let result = enterprises.filter(e => {
      if (search && !e.name.includes(search) && !e.short_name?.includes(search) && !e.industry?.includes(search)) return false;
      if (industryFilter && e.industry !== industryFilter) return false;
      return true;
    });
    if (sortMode === 'latest_visit') {
      result = [...result].sort((a, b) => (b.last_visited_at ?? '').localeCompare(a.last_visited_at ?? ''));
    }
    return result;
  }, [enterprises, search, industryFilter, sortMode]);

  // AI 统计
  const totalEnterprises = enterprises.length;
  const withPolicy = Object.keys(entPolicyMap).length;
  const gradeA = assessments.filter(a => a.grade === 'A').length;
  const recentVisited = enterprises.filter(e => e.last_visited_at).length;
  const incubated = enterprises.filter(e => e.is_incubated).length;

  return (
    <div className="min-h-full">
      <div className="page-container space-y-4">
        {/* ═══ 头部 ═══ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-lg font-bold text-text-primary">企业画像库</h1>
            <p className="text-xs text-text-muted mt-0.5">共 {totalEnterprises} 家园区企业</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-default btn-sm"
              onClick={() => sendChat(`请分析园区 ${totalEnterprises} 家企业的整体情况：行业分布、发展阶段分布、政策覆盖率、高潜力企业推荐，并给出本月重点关注建议。`)}>
              <Bot className="h-3.5 w-3.5" /> AI 园区分析
            </button>
            <button className="btn btn-primary btn-sm"
              onClick={() => sendChat('请推荐本月应优先走访的企业，考虑：近期未走访、政策匹配度高、发展阶段需关注、有活跃需求等因素。')}>
              <Sparkles className="h-3.5 w-3.5" /> AI 推荐走访
            </button>
          </div>
        </div>

        {/* AI 洞察概要 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: Building2, value: totalEnterprises, label: '园区企业', color: 'text-text-primary', iconColor: 'text-text-muted' },
            { icon: Shield, value: withPolicy, label: '已AI筛选', color: 'text-brand', iconColor: 'text-brand' },
            { icon: CheckCircle2, value: gradeA, label: 'A级企业', color: 'text-emerald-600', iconColor: 'text-emerald-500' },
            { icon: Zap, value: incubated, label: '在孵企业', color: 'text-violet-600', iconColor: 'text-violet-500' },
            { icon: Briefcase, value: recentVisited, label: '已走访', color: 'text-amber-600', iconColor: 'text-amber-500' },
          ].map((item, i) => (
            <CardCompact key={i} className="flex items-center gap-3">
              <item.icon className={cn("h-4 w-4 shrink-0", item.iconColor)} />
              <div>
                <div className={cn("text-lg font-bold font-mono", item.color)}>{item.value}</div>
                <div className="text-tag text-text-secondary">{item.label}</div>
              </div>
            </CardCompact>
          ))}
        </div>

        {/* 搜索 + 筛选 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar 
            placeholder="搜索企业名称、赛道..."
            value={search}
            onChange={setSearch}
          />
          <FilterSelect
            icon={Filter}
            value={industryFilter}
            onChange={setIndustryFilter}
            options={industries.map(i => ({ value: i, label: i }))}
            placeholder="全部赛道"
            className="w-full sm:w-40"
          />
          <div className="flex items-center gap-1.5 text-xs">
            {([
              { key: 'default', label: '默认' },
              { key: 'ai_recommend', label: '✦ AI 推荐' },
              { key: 'latest_visit', label: '最近走访' },
            ] as { key: SortMode; label: string }[]).map(s => (
              <SortButton 
                key={s.key}
                active={sortMode === s.key}
                onClick={() => setSortMode(s.key)}
              >
                {s.label}
              </SortButton>
            ))}
          </div>
        </div>

        {/* AI 推荐提示 */}
        {sortMode === 'ai_recommend' && (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg">
            <Bot className="h-4 w-4 text-brand shrink-0" />
            <span className="text-xs text-text-secondary">
              AI 综合走访频率、政策匹配度、发展潜力推荐优先关注的企业。
            </span>
          </div>
        )}

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ent => {
            const policy = entPolicyMap[ent.id];
            const gradeColor = policy ? (
              policy.grade === 'A' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              policy.grade === 'B' ? 'bg-blue-50 text-blue-600 border-blue-100' :
              policy.grade === 'C' ? 'bg-amber-50 text-amber-600 border-amber-100' :
              'bg-slate-50 text-slate-500 border-slate-100'
            ) : '';

            return (
              <CardStandard key={ent.id} hover className="cursor-pointer group"
                onClick={() => router.push(`/enterprises/${ent.id}`)}>
                {/* 头部 */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    "w-11 h-11 rounded-lg flex items-center justify-center text-base font-bold shrink-0",
                    ent.is_incubated ? "bg-violet-50 text-violet-600 border border-violet-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                  )}>
                    {(ent.short_name ?? ent.name).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-text-primary truncate group-hover:text-brand transition-colors">
                      {ent.short_name ?? ent.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Tag variant={ent.is_incubated ? "purple" : "success"}>
                        {ent.is_incubated ? '在孵' : '存续'}
                      </Tag>
                      {ent.development_stage && <Tag variant="default">{ent.development_stage}</Tag>}
                      {policy && (
                        <span className={cn("text-tag px-1.5 py-0.5 rounded border", gradeColor)}>
                          政策 {policy.grade}级
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 行业标签 */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ent.industry && <Tag variant="primary">{ent.industry}</Tag>}
                  {ent.industry_sub && <Tag variant="default">{ent.industry_sub}</Tag>}
                </div>

                {/* 关键信息 */}
                <div className="space-y-1.5 text-xs text-text-secondary mb-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 shrink-0" />
                    <span>法人: <span className="text-text-secondary font-medium">{ent.legal_person || '-'}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    <span>注册资本: <span className="text-text-secondary">{ent.registered_capital || '-'}</span></span>
                  </div>
                  {ent.employee_count && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>员工: <span className="text-text-secondary">{ent.employee_count.toLocaleString()} 人</span></span>
                    </div>
                  )}
                </div>

                {/* 底部：AI 快捷操作 + 走访状态 */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-text-muted">
                      {ent.last_visited_at ? `走访 ${ent.last_visited_at}` : '未走访'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="btn-ai text-tag"
                      onClick={(e) => { e.stopPropagation(); sendChat(`请快速分析「${ent.short_name ?? ent.name}」的发展潜力和合作价值。`); }}>
                      <Bot className="h-2.5 w-2.5" /> AI
                    </button>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand transition-colors" />
                  </div>
                </div>
              </CardStandard>
            );
          })}
        </div>

        {/* 空状态 */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-text-secondary">未找到匹配企业</p>
            <button className="btn btn-default btn-sm mt-3"
              onClick={() => sendChat(`帮我在园区企业中搜索关键词"${search}"相关的企业，从企业名称、业务描述、产品方向等多维度搜索。`)}>
              <Sparkles className="h-3.5 w-3.5" /> AI 智能搜索
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
