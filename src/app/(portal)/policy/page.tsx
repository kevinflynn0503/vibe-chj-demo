/**
 * 政策服务 — 员工工作台（一页展示全部）
 * 
 * 不再有单独的触达任务页，所有我的任务直接在此展示
 * 按状态分组：待走访 → 已走访等待 → 有意愿待诊断
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ChevronRight, Sparkles, Bot,
  Target, Clock, Shield, Briefcase, CheckCircle2,
  AlertCircle, FileText, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAssessments } from '@/services/policy';
import { sendChat, startScreening } from '@/lib/host-api';
import { Card, CardCompact, Tag, Button, PageSkeleton } from '@/components/ui';
import type { PolicyAssessment } from '@/lib/schema';

export default function PolicyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<PolicyAssessment[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchAssessments();
      setAssessments(data);
      setLoading(false);
    }
    load();
  }, []);

  // 我的任务（当前用户：薛坤）
  const myTasks = assessments.filter(a => a.assigned_to === '薛坤');
  const pendingVisit = myTasks.filter(a => a.touch_status === 'pending' || a.touch_status === 'assigned');
  const visited = myTasks.filter(a => a.touch_status === 'visited');
  const willing = myTasks.filter(a => a.touch_status === 'willing');

  const GRADE_COLORS: Record<string, string> = {
    A: 'bg-[rgba(27,27,27,0.06)] text-success border-line-light',
    B: 'bg-[rgba(27,27,27,0.06)] text-brand border-line-light',
    C: 'bg-[rgba(27,27,27,0.06)] text-warning border-line-light',
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-full">
      {/* ═══ 头部区 ═══ */}
      <div className="page-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-5 pb-5">
          <div>
            <h1 className="text-lg font-semibold text-text-primary tracking-tight">政策服务</h1>
            <p className="text-xs text-text-muted mt-1">高新技术企业认定 · 我的工作台 · {myTasks.length} 家企业</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => startScreening()}>
            <Sparkles className="h-3.5 w-3.5" /> 发起 AI 筛选
          </Button>
        </div>
      </div>

      <div className="page-container space-y-6">
        {/* 我的概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <CardCompact>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">分配给我</span>
              <Briefcase className="h-3.5 w-3.5 text-text-muted" />
            </div>
            <div className="text-2xl font-semibold font-mono text-text-primary">{myTasks.length}</div>
          </CardCompact>
          <CardCompact>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">待走访</span>
              <Target className="h-3.5 w-3.5 text-text-muted" />
            </div>
            <div className={cn("text-2xl font-semibold font-mono", pendingVisit.length > 0 ? 'text-warning' : 'text-text-muted')}>{pendingVisit.length}</div>
          </CardCompact>
          <CardCompact>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">有意愿</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-text-muted" />
            </div>
            <div className="text-2xl font-semibold font-mono text-success">{willing.length}</div>
          </CardCompact>
          <CardCompact>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">转化率</span>
              <TrendingUp className="h-3.5 w-3.5 text-text-muted" />
            </div>
            <div className="text-2xl font-semibold font-mono text-brand">
              {myTasks.length > 0 ? Math.round((willing.length / myTasks.length) * 100) : 0}%
            </div>
          </CardCompact>
        </div>

        {/* ═══ 待走访 ═══ */}
        <Card className="p-0">
          <div className="px-4 py-3 border-b border-line-light flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-text-muted" />
              <h2 className="text-sm font-semibold text-text-primary">待走访</h2>
              {pendingVisit.length > 0 && <Tag variant="orange">{pendingVisit.length}</Tag>}
            </div>
            {pendingVisit.length > 0 && (
              <Button variant="text" size="sm"
                icon={<Sparkles className="h-3 w-3" />}
                onClick={() => sendChat('请为我今天要走访的企业批量生成走访话术和政策必问问题。')}>
                AI 批量准备
              </Button>
            )}
          </div>
          {pendingVisit.length > 0 ? (
            <div className="divide-y divide-line-light">
              {pendingVisit.map(a => (
                <div key={a.id} className="px-4 py-4 transition-colors duration-150 hover:bg-surface-hover-row">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 border",
                      GRADE_COLORS[a.grade] || 'bg-[rgba(27,27,27,0.06)] text-text-muted border-line-light'
                    )}>{a.grade}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-text-primary">{a.enterprise_name}</span>
                        <span className="text-xs text-text-muted font-mono">{a.grade_score}分</span>
                      </div>
                      <div className="text-xs text-text-secondary">{a.policy_type}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Tag variant="emerald" className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> 背调就绪
                        </Tag>
                        <Tag variant="blue" className="flex items-center gap-1">
                          <Bot className="h-3 w-3" /> 话术已生成
                        </Tag>
                        <Tag variant="purple" className="flex items-center gap-1">
                          <Shield className="h-3 w-3" /> 政策必问
                        </Tag>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button variant="primary" size="sm"
                        onClick={() => router.push(`/visit/${a.enterprise_id}?from=policy&policy=高新技术企业认定`)}>
                        <Briefcase className="h-3 w-3" /> 去走访
                      </Button>
                      <Button variant="default" size="sm" className="text-xs"
                        onClick={() => router.push(`/policy/screening/${a.id}`)}>
                        查看筛选
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-xs text-text-muted">暂无待走访任务</div>
          )}
        </Card>

        {/* ═══ 已走访·等待回复 ═══ */}
        {visited.length > 0 && (
          <Card className="p-0">
            <div className="px-4 py-3 border-b border-line-light flex items-center gap-2">
              <Clock className="h-4 w-4 text-text-muted" />
              <h2 className="text-sm font-semibold text-text-primary">已走访 · 等待回复</h2>
              <span className="text-xs text-text-muted">{visited.length}</span>
            </div>
            <div className="divide-y divide-line-light">
              {visited.map(a => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3 transition-colors duration-150 hover:bg-surface-hover-row">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border",
                    GRADE_COLORS[a.grade] || 'bg-[rgba(27,27,27,0.06)] text-text-muted border-line-light'
                  )}>{a.grade}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary">{a.enterprise_name}</div>
                    <div className="text-xs text-text-secondary mt-0.5">已走访触达，等待企业反馈意愿</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="text" size="sm"
                      icon={<Bot className="h-3 w-3" />}
                      onClick={() => sendChat(`请帮我起草一封「${a.enterprise_name}」的走访跟进邮件。`)}>
                      AI 跟进
                    </Button>
                    <Button variant="link" size="sm"
                      onClick={() => router.push(`/policy/screening/${a.id}`)}>
                      详情
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ═══ 有意愿·待诊断 ═══ */}
        {willing.length > 0 && (
          <Card className="p-0">
            <div className="px-4 py-3 border-b border-line-light flex items-center gap-2">
              <Shield className="h-4 w-4 text-text-muted" />
              <h2 className="text-sm font-semibold text-text-primary">有意愿 · 待诊断审核</h2>
              <Tag variant="emerald" className="flex items-center gap-0.5">
                <Bot className="h-3 w-3" /> AI 已生成
              </Tag>
            </div>
            <div className="divide-y divide-line-light">
              {willing.map(a => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3 hover:bg-surface-hover-row transition-colors cursor-pointer"
                  onClick={() => router.push(`/policy/diagnosis/${a.id}`)}>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border",
                    GRADE_COLORS[a.grade] || 'bg-[rgba(27,27,27,0.06)] text-text-muted border-line-light'
                  )}>{a.grade}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary">{a.enterprise_name}</div>
                    <div className="text-xs text-text-secondary mt-0.5">{a.policy_type} · AI 诊断报告已就绪</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Tag variant="emerald">有意愿</Tag>
                    <ChevronRight className="h-4 w-4 text-text-muted" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {myTasks.length === 0 && (
          <Card className="p-8 text-center">
            <Briefcase className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-secondary mb-1">暂无分配给你的任务</p>
            <p className="text-xs text-text-muted">管理者会通过管理看板将新的企业任务分配给你</p>
          </Card>
        )}
      </div>
    </div>
  );
}

