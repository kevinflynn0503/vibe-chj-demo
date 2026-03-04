/**
 * 企业画像库 — AI 深度融入版
 *
 * 改造点：
 * - 使用 Service 层异步获取数据 + Loading 骨架屏
 * - 使用 PageHeader / StatCard / EmptyState / Button 组件
 * - 消除硬编码颜色
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import {
  Filter, Building2, Users, Calendar, Briefcase,
  ChevronRight, Bot, Sparkles, Shield,
  CheckCircle2, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Enterprise, PolicyAssessment } from '@/lib/schema';
import { sendChat } from '@/lib/host-api';
import { CardStandard, Tag, SearchBar, FilterSelect, SortButton, Button, PageSkeleton } from '@/components/ui';
import { PageHeader, StatCard, EmptyState } from '@/components/business';
import { fetchEnterprises } from '@/services/enterprise';
import { fetchAssessments } from '@/services/policy';

type SortMode = 'default' | 'ai_recommend' | 'latest_visit' | 'risk';

export default function EnterprisesPage() {
  const router = useRouter();

  // ── 异步数据 ──
  const [loading, setLoading] = useState(true);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [assessments, setAssessments] = useState<PolicyAssessment[]>([]);

  useEffect(() => {
    async function load() {
      const [ents, asses] = await Promise.all([
        fetchEnterprises(),
        fetchAssessments(),
      ]);
      setEnterprises(ents);
      setAssessments(asses);
      setLoading(false);
    }
    load();
  }, []);

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

  // ── Loading ──
  if (loading) return <PageSkeleton />;

  // AI 统计
  const totalEnterprises = enterprises.length;
  const withPolicy = Object.keys(entPolicyMap).length;
  const gradeA = assessments.filter(a => a.grade === 'A').length;
  const recentVisited = enterprises.filter(e => e.last_visited_at).length;
  const incubated = enterprises.filter(e => e.is_incubated).length;

  return (
    <div className="min-h-full">
      {/* ═══ 头部渐变区 ═══ */}
      <div className="relative">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(51,112,255,0.04) 0%, rgba(255,255,255,0) 100%)' }} />
        <div className="relative page-container">
          <PageHeader
            title="企业画像库"
            description={`共 ${totalEnterprises} 家园区企业`}
            className="pb-5"
            actions={
              <>
                <Button
                  variant="default"
                  size="sm"
                  icon={<Bot />}
                  onClick={() => sendChat(`请分析园区 ${totalEnterprises} 家企业的整体情况：行业分布、发展阶段分布、政策覆盖率、高潜力企业推荐，并给出本月重点关注建议。`)}
                >
                  AI 园区分析
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Sparkles />}
                  onClick={() => sendChat('请推荐本月应优先走访的企业，考虑：近期未走访、政策匹配度高、发展阶段需关注、有活跃需求等因素。')}
                >
                  AI 推荐走访
                </Button>
              </>
            }
          />
        </div>
      </div>

      <div className="page-container space-y-6">
        {/* AI 洞察概要 — 使用 StatCard 组件 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard icon={Building2} value={totalEnterprises} label="园区企业" />
          <StatCard icon={Shield} value={withPolicy} label="已AI筛选" />
          <StatCard icon={CheckCircle2} value={gradeA} label="A级企业" />
          <StatCard icon={Zap} value={incubated} label="在孵企业" />
          <StatCard icon={Briefcase} value={recentVisited} label="已走访" />
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
          <div className="flex items-center gap-2 p-3 bg-surface-card border border-line rounded-lg">
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
              policy.grade === 'A' ? 'bg-[rgba(27,27,27,0.06)] text-success border-line' :
              policy.grade === 'B' ? 'bg-[rgba(27,27,27,0.06)] text-brand border-line' :
              policy.grade === 'C' ? 'bg-[rgba(27,27,27,0.06)] text-warning border-line' :
              'bg-[rgba(27,27,27,0.06)] text-text-muted border-line'
            ) : '';

            return (
              <CardStandard key={ent.id} hover className="cursor-pointer group"
                onClick={() => router.push(`/enterprises/${ent.id}`)}>
                {/* 头部 */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    "w-11 h-11 rounded-lg flex items-center justify-center text-base font-bold shrink-0",
                    ent.is_incubated ? "bg-[rgba(27,27,27,0.06)] text-brand border border-line" : "bg-[rgba(27,27,27,0.06)] text-brand border border-line"
                  )}>
                    {(ent.short_name ?? ent.name).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary truncate group-hover:text-brand transition-colors">
                      {ent.short_name ?? ent.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Tag variant={ent.is_incubated ? "purple" : "emerald"}>
                        {ent.is_incubated ? '在孵' : '存续'}
                      </Tag>
                      {ent.development_stage && <Tag variant="gray">{ent.development_stage}</Tag>}
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
                  {ent.industry && <Tag variant="blue">{ent.industry}</Tag>}
                  {ent.industry_sub && <Tag variant="gray">{ent.industry_sub}</Tag>}
                </div>

                {/* 关键信息 */}
                <div className="space-y-1.5 text-xs text-text-secondary mb-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 shrink-0" />
                    <span>法人: <span className="font-medium">{ent.legal_person || '-'}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    <span>注册资本: <span>{ent.registered_capital || '-'}</span></span>
                  </div>
                  {ent.employee_count && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>员工: <span>{ent.employee_count.toLocaleString()} 人</span></span>
                    </div>
                  )}
                </div>

                {/* 底部 */}
                <div className="pt-3 border-t border-line-light flex items-center justify-between">
                  <div className="text-xs text-text-muted">
                    {ent.last_visited_at ? `走访 ${ent.last_visited_at}` : '未走访'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ai"
                      size="sm"
                      icon={<Bot />}
                      className="text-tag"
                      onClick={(e) => { e.stopPropagation(); sendChat(`请快速分析「${ent.short_name ?? ent.name}」的发展潜力和合作价值。`); }}
                    >
                      AI
                    </Button>
                    <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-brand transition-colors" />
                  </div>
                </div>
              </CardStandard>
            );
          })}
        </div>

        {/* 空状态 */}
        {filtered.length === 0 && (
          <EmptyState
            icon={Building2}
            message="未找到匹配企业"
            action={
              <Button
                variant="default"
                size="sm"
                icon={<Sparkles />}
                onClick={() => sendChat(`帮我在园区企业中搜索关键词"${search}"相关的企业，从企业名称、业务描述、产品方向等多维度搜索。`)}
              >
                AI 智能搜索
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
