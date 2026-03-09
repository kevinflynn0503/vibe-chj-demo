/**
 * 企业画像库
 *
 * Impeccable 重构：
 * - 去掉图标+圆角矩形字母头像模板
 * - 去掉 font-mono，用 tabular-nums
 * - 统计卡片用 inline 布局替代 5 个等尺寸卡片
 * - stagger 入场
 * - hover 微阴影
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
import { PageHeader, EmptyState } from '@/components/business';
import { fetchEnterprises } from '@/services/enterprise';
import { fetchAssessments } from '@/services/policy';

type SortMode = 'default' | 'ai_recommend' | 'latest_visit' | 'risk';

export default function EnterprisesPage() {
  const router = useRouter();

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

  if (loading) return <PageSkeleton />;

  const totalEnterprises = enterprises.length;
  const withPolicy = Object.keys(entPolicyMap).length;
  const gradeA = assessments.filter(a => a.grade === 'A').length;
  const recentVisited = enterprises.filter(e => e.last_visited_at).length;
  const incubated = enterprises.filter(e => e.is_incubated).length;

  return (
    <div className="min-h-full">
      {/* ═══ 头部区 ═══ */}
      <div className="page-container">
        <PageHeader
          title="企业画像库"
          description={`共 ${totalEnterprises} 家园区企业`}
          className="pb-sp-5"
          actions={
            <>
              <Button variant="default" size="sm" icon={<Bot />}
                onClick={() => sendChat(`请分析园区 ${totalEnterprises} 家企业的整体情况：行业分布、发展阶段分布、政策覆盖率、高潜力企业推荐，并给出本月重点关注建议。`)}>
                AI 园区分析
              </Button>
              <Button variant="primary" size="sm" icon={<Sparkles />}
                onClick={() => sendChat('请推荐本月应优先走访的企业，考虑：近期未走访、政策匹配度高、发展阶段需关注、有活跃需求等因素。')}>
                AI 推荐走访
              </Button>
            </>
          }
        />
      </div>

      <div className="page-container space-y-sp-5">
        {/* 统计 — inline divider 替代 5 个卡片 */}
        <div className="grid grid-cols-5 gap-0 divide-x divide-line border border-line rounded-lg py-3.5">
          {[
            { icon: Building2, v: totalEnterprises, l: '园区企业' },
            { icon: Shield, v: withPolicy, l: '已AI筛选' },
            { icon: CheckCircle2, v: gradeA, l: 'A级企业' },
            { icon: Zap, v: incubated, l: '在孵企业' },
            { icon: Briefcase, v: recentVisited, l: '已走访' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center px-sp-3">
              <span className="text-tag text-text-muted mb-1">{s.l}</span>
              <span className="text-lg font-semibold text-text-primary tabular-nums">{s.v}</span>
            </div>
          ))}
        </div>

        {/* 搜索 + 筛选 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar placeholder="搜索企业名称、赛道..." value={search} onChange={setSearch} />
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
              <SortButton key={s.key} active={sortMode === s.key} onClick={() => setSortMode(s.key)}>
                {s.label}
              </SortButton>
            ))}
          </div>
        </div>

        {sortMode === 'ai_recommend' && (
          <div className="flex items-center gap-2 p-3 border border-line rounded-lg">
            <Bot className="h-4 w-4 text-brand shrink-0" />
            <span className="text-xs text-text-secondary">
              AI 综合走访频率、政策匹配度、发展潜力推荐优先关注的企业。
            </span>
          </div>
        )}

        {/* 卡片网格 — 去掉字母头像模板 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-in">
          {filtered.map(ent => {
            const policy = entPolicyMap[ent.id];

            return (
              <div key={ent.id}
                onClick={() => router.push(`/enterprises/${ent.id}`)}
                className="border border-line rounded-lg p-4 cursor-pointer transition-all duration-normal ease-out-expo hover:shadow-card-hover hover:border-line-hover group">
                {/* 头部 — 去掉字母头像方块 */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors duration-normal">
                      {ent.short_name ?? ent.name}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-normal" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <Tag variant={ent.is_incubated ? "purple" : "emerald"}>
                      {ent.is_incubated ? '在孵' : '存续'}
                    </Tag>
                    {ent.development_stage && <Tag variant="gray">{ent.development_stage}</Tag>}
                    {policy && (
                      <Tag variant={policy.grade === 'A' ? 'emerald' : policy.grade === 'B' ? 'blue' : 'amber'} withBorder>
                        政策 {policy.grade}级
                      </Tag>
                    )}
                  </div>
                </div>

                {/* 行业标签 */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ent.industry && <Tag variant="blue">{ent.industry}</Tag>}
                  {ent.industry_sub && <Tag variant="gray">{ent.industry_sub}</Tag>}
                </div>

                {/* 关键信息 */}
                <div className="space-y-1 text-xs text-text-secondary mb-3">
                  <div className="flex items-center gap-1.5">
                    <span>法人: <span className="font-medium text-text-primary">{ent.legal_person || '-'}</span></span>
                  </div>
                  {ent.registered_capital && (
                    <div>注册资本: {ent.registered_capital}</div>
                  )}
                  {ent.employee_count && (
                    <div className="tabular-nums">员工: {ent.employee_count.toLocaleString()} 人</div>
                  )}
                </div>

                {/* 底部 */}
                <div className="pt-3 border-t border-line-light flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    {ent.last_visited_at ? `走访 ${ent.last_visited_at}` : '未走访'}
                  </span>
                  <Button
                    variant="text"
                    size="sm"
                    className="text-tag opacity-0 group-hover:opacity-100 transition-opacity duration-normal"
                    icon={<Bot className="h-3 w-3" />}
                    onClick={(e) => { e.stopPropagation(); sendChat(`请快速分析「${ent.short_name ?? ent.name}」的发展潜力和合作价值。`); }}
                  >
                    AI 分析
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <EmptyState
            icon={Building2}
            message="未找到匹配企业"
            action={
              <Button variant="default" size="sm" icon={<Sparkles />}
                onClick={() => sendChat(`帮我在园区企业中搜索关键词"${search}"相关的企业，从企业名称、业务描述、产品方向等多维度搜索。`)}>
                AI 智能搜索
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
