import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { VisitRecord } from './schema';
import { VISIT_TYPE_LABELS } from './schema';
import type { VisitType } from './schema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 将走访记录转换为 Markdown 格式展示
 */
export function formatVisitRecordAsMarkdown(record: VisitRecord): string {
  const lines: string[] = [];

  lines.push(`# 走访记录 — ${record.enterprise_name}`);
  lines.push('');
  lines.push(`**走访人**：${record.visitor_name}（${record.visitor_department ?? '未知部门'}）`);

  if (record.counterpart_name) {
    lines.push(`**对象**：${record.counterpart_name}${record.counterpart_title ? ' ' + record.counterpart_title : ''}`);
  }

  lines.push(`**日期**：${record.visit_date}`);

  if (record.visit_type) {
    lines.push(`**类型**：${VISIT_TYPE_LABELS[record.visit_type as VisitType] ?? record.visit_type}`);
  }

  lines.push(`**来源**：${record.feishu_minute_id ? '飞书妙记 · AI 自动提取' : '手动录入'}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  if (record.key_findings && record.key_findings.length > 0) {
    lines.push('## 关键发现');
    lines.push('');
    record.key_findings.forEach(f => {
      lines.push(`- ${f}`);
    });
    lines.push('');
  }

  if (record.demands && record.demands.length > 0) {
    lines.push('## 企业诉求');
    lines.push('');
    record.demands.forEach((d, i) => {
      lines.push(`${i + 1}. ${d}`);
    });
    lines.push('');
  }

  if (record.follow_up) {
    lines.push('## 下一步');
    lines.push('');
    lines.push(record.follow_up);
    lines.push('');
  }

  if (record.human_notes) {
    lines.push('## 人工补充');
    lines.push('');
    lines.push(record.human_notes);
    lines.push('');
  }

  // 覆盖度
  const cov = record.key_question_coverage;
  if (cov) {
    lines.push('---');
    lines.push('');
    if (cov.track_questions) {
      const emoji = cov.track_questions.covered === cov.track_questions.total ? '✅' : '⚠️';
      lines.push(`> 🔍 赛道问题覆盖：${cov.track_questions.covered}/${cov.track_questions.total} ${emoji}`);
      if (cov.track_questions.missed.length > 0) {
        lines.push(`> 缺少：${cov.track_questions.missed.join('、')}`);
      }
    }
    if (cov.policy_questions) {
      const emoji = cov.policy_questions.covered === cov.policy_questions.total ? '✅' : '⚠️';
      lines.push(`> 📋 政策问题覆盖：${cov.policy_questions.covered}/${cov.policy_questions.total} ${emoji}`);
      if (cov.policy_questions.missed.length > 0) {
        lines.push(`> 缺少：${cov.policy_questions.missed.join('、')}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}
