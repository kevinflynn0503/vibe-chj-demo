/**
 * Tag 组件 - 统一标签样式
 * 
 * 使用规范：
 * - 基础标签：<Tag variant="blue">标签文字</Tag>
 * - 带边框：<Tag variant="emerald" withBorder>标签文字</Tag>
 * - 语义化：<TagPolicyGrade grade="A" />、<TagStatus status="pending" />
 */

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type TagVariant = 
  | 'blue' | 'green' | 'emerald' | 'orange' | 'amber' 
  | 'red' | 'purple' | 'violet' | 'gray' | 'slate';

interface TagProps {
  children: ReactNode;
  variant?: TagVariant;
  className?: string;
  withBorder?: boolean;
}

const variantStyles: Record<TagVariant, string> = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  violet: 'bg-violet-50 text-violet-600 border-violet-100',
  gray: 'bg-slate-50 text-slate-600 border-slate-200',
  slate: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function Tag({ 
  children, 
  variant = 'gray', 
  withBorder = false, 
  className 
}: TagProps) {
  return (
    <span
      className={cn(
        // 统一基础样式
        'inline-flex items-center px-2 py-0.5 text-tag font-medium rounded-sm',
        // 颜色变体
        variantStyles[variant],
        // 可选边框
        withBorder && 'border',
        className
      )}
    >
      {children}
    </span>
  );
}

// ── 语义化标签：政策等级 ──
export function TagPolicyGrade({ grade }: { grade: string }) {
  const variant = 
    grade === 'A' ? 'emerald' : 
    grade === 'B' ? 'blue' : 
    grade === 'C' ? 'amber' : 
    'gray';
  return <Tag variant={variant} withBorder>政策 {grade}级</Tag>;
}

// ── 语义化标签：状态 ──
export function TagStatus({ 
  status 
}: { 
  status: 'pending' | 'done' | 'warning' | 'info' 
}) {
  const config = {
    pending: { variant: 'orange' as TagVariant, label: '待处理' },
    done: { variant: 'emerald' as TagVariant, label: '已完成' },
    warning: { variant: 'red' as TagVariant, label: '预警' },
    info: { variant: 'blue' as TagVariant, label: '进行中' },
  };
  const { variant, label } = config[status];
  return <Tag variant={variant} withBorder>{label}</Tag>;
}
