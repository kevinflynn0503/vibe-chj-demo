/**
 * SearchBar 组件 - 统一搜索框样式
 * 
 * 使用示例：
 * ```tsx
 * <SearchBar 
 *   placeholder="搜索企业名称、赛道..." 
 *   value={search} 
 *   onChange={setSearch}
 * />
 * ```
 */

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchBar({ 
  placeholder = "搜索...", 
  value, 
  onChange, 
  className 
}: SearchBarProps) {
  return (
    <div className={cn("relative flex-1", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-brand transition-colors bg-slate-50"
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  );
}

/**
 * FilterSelect 组件 - 统一筛选下拉框
 */
interface FilterSelectProps {
  icon?: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export function FilterSelect({
  icon: Icon,
  value,
  onChange,
  options,
  placeholder = "全部",
  className
}: FilterSelectProps) {
  return (
    <div className={cn("relative", className)}>
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />}
      <select 
        className={cn(
          "w-full pr-8 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-brand appearance-none bg-slate-50",
          Icon && "pl-10"
        )}
        value={value} 
        onChange={e => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

/**
 * SortButton 组件 - 统一排序按钮
 */
interface SortButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function SortButton({ active, onClick, children }: SortButtonProps) {
  return (
    <button
      className={cn(
        "px-3 py-2 text-xs rounded-md border transition-colors",
        active 
          ? 'bg-brand text-white border-brand' 
          : 'bg-white text-text-secondary border-slate-200 hover:border-brand'
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
