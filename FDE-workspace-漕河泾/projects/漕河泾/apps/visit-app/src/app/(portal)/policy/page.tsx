/**
 * 政策服务工作台
 * 
 * 核心动线：筛选 → 触达 → 诊断
 * 
 * 布局优化：
 * - 流水线：均匀撑满宽度，数字可点击跳转
 * - 待办：放入统一卡片容器，不独立散落
 * - 两栏：1:1 而非 3:2，视觉更平衡
 * - 统一规范：bg-white border, max-w-[1200px], 无 shadow
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  ChevronRight, AlertCircle, TrendingUp, CheckCircle2,
  ListFilter, Send, FileText, ArrowRight, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPolicyStats, getAssessments, getPMProgress } from '@/lib/mock-data';
import { startScreening, dispatchTasks } from '@/lib/host-api';

export default function PolicyPage() {
  const router = useRouter();
  const stats = getPolicyStats();
  const assessments = getAssessments();
  const pmProgress = getPMProgress();

  // 漏斗阶段数据 — 数字可点击
  const pipeline = [
    { label: '全部企业', value: '17,000', sub: '园区总量', done: true, href: '/enterprises' },
    { label: '已筛选', value: stats.total_screened, sub: `A${stats.grade_a} / B${stats.grade_b} / C${stats.grade_c}`, done: true, href: '/policy/screening' },
    { label: '已触达', value: stats.touch_visited, sub: `已分发 ${stats.touch_assigned}`, done: stats.touch_visited > 0, href: '/policy/tasks' },
    { label: '有意愿', value: stats.touch_willing, sub: '确认参与申报', done: stats.touch_willing > 0, href: '/policy/tasks' },
    { label: '已获批', value: stats.approved, sub: '审批通过', done: stats.approved > 0, href: null },
  ];

  // 待办任务
  const todoItems = [
    {
      title: `${stats.grade_a} 家 A 级企业待触达`,
      desc: '高概率符合高新认定条件，建议 3 天内安排走访',
      action: () => dispatchTasks('A', stats.grade_a),
      actionLabel: '分发任务',
      priority: 'high' as const,
    },
    {
      title: `${stats.grade_b} 家 B 级企业待确认`,
      desc: '需进一步确认 1-2 项条件，建议 1 周内走访',
      action: () => router.push('/policy/tasks'),
      actionLabel: '查看列表',
      priority: 'medium' as const,
    },
    {
      title: `${stats.touch_willing} 家有意愿企业待诊断`,
      desc: '已确认有申报意愿，需收集材料进行前置审核',
      action: () => {
        // 找到第一个 willing 的 assessment 跳转诊断
        const willing = assessments.find(a => a.touch_status === 'willing');
        router.push(willing ? `/policy/diagnosis/${willing.id}` : '/policy/tasks');
      },
      actionLabel: '开始诊断',
      priority: 'medium' as const,
    },
  ];

  // 最近进展
  const recentActivity = [
    { icon: CheckCircle2, text: '薛坤 完成「强生医疗」走访触达', time: '10分钟前', type: 'success' as const },
    { icon: FileText, text: '系统完成新一轮高新初筛，A级12家', time: '2小时前', type: 'info' as const },
    { icon: TrendingUp, text: 'PM-A 反馈「芯视科技」有申报意愿', time: '昨天', type: 'success' as const },
    { icon: AlertCircle, text: '「蔚来汽车」缺少研发费用占比数据', time: '昨天', type: 'warning' as const },
  ];

  const typeColor = {
    success: 'bg-emerald-50 text-emerald-600',
    info: 'bg-blue-50 text-blue-600',
    warning: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      {/* 头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">政策服务工作台</h1>
            <p className="text-xs text-slate-500 mt-0.5">高新技术企业认定 · 筛选 → 触达 → 诊断</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-default btn-sm" onClick={() => router.push('/policy/tasks')}>
              <FileText className="h-3.5 w-3.5" /> 任务列表
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => startScreening()}>
              <ListFilter className="h-3.5 w-3.5" /> 开始新一轮筛选
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">

        {/* ── 转化流水线 — 均匀分布，数字可点击 ── */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">申报转化流水线</h2>
          <div className="grid grid-cols-5 gap-0">
            {pipeline.map((stage, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={cn(
                    "flex-1 text-center py-2 rounded-lg transition-colors",
                    stage.href && "cursor-pointer hover:bg-slate-50"
                  )}
                  onClick={() => stage.href && router.push(stage.href)}
                >
                  <div className={cn(
                    "text-2xl sm:text-3xl font-bold font-mono mb-1 leading-none",
                    i === 0 ? 'text-slate-400' : stage.done ? 'text-slate-900' : 'text-slate-300',
                    stage.href && 'group-hover:text-[#3370FF]'
                  )}>
                    {stage.value}
                  </div>
                  <div className="text-xs font-medium text-slate-700">{stage.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{stage.sub}</div>
                </div>
                {i < pipeline.length - 1 && (
                  <div className="shrink-0 px-1">
                    <ArrowRight className={cn("h-4 w-4", stage.done ? 'text-slate-400' : 'text-slate-200')} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── 两栏：待办（卡片容器内） + PM进度 — 1:1 均分 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 左：待办任务 — 放入统一卡片 */}
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">待办事项</h2>
              <span className="text-xs text-slate-400">{todoItems.length} 项</span>
            </div>
            <div className="divide-y divide-slate-100">
              {todoItems.map((item, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                    item.priority === 'high' ? 'bg-red-500' : 'bg-amber-400'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                  <button onClick={item.action}
                    className="btn btn-default btn-sm shrink-0 mt-0.5">
                    {item.actionLabel} <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 右：PM工作进度 */}
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">项目经理工作量</h2>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100">
              {pmProgress.map((pm, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">{pm.name}</span>
                    <span className="text-xs text-slate-500">
                      {pm.visited}/{pm.assigned} 已走访 · 转化 {(pm.conversion_rate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    <div className="bg-emerald-500 rounded-full" style={{ width: `${(pm.willing / pm.assigned) * 100}%` }} />
                    <div className="bg-blue-500 rounded-full" style={{ width: `${((pm.visited - pm.willing) / pm.assigned) * 100}%` }} />
                    <div className="bg-slate-100 rounded-full flex-1" />
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" />有意愿 {pm.willing}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full" />已走访 {pm.visited}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-200 rounded-full" />待处理 {pm.assigned - pm.visited}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 最近进展 ── */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">最近进展</h2>
            <button className="text-xs text-[#3370FF] hover:underline">查看全部</button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((a, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className={cn("p-1.5 rounded-full shrink-0", typeColor[a.type])}>
                  <a.icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0"><p className="text-sm text-slate-700 truncate">{a.text}</p></div>
                <div className="text-xs text-slate-400 font-mono whitespace-nowrap">{a.time}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
