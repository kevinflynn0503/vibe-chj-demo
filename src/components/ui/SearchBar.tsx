/**
 * SearchBar / FilterSelect / SortButton
 *
 * focus:outline-none → focus-visible ring（impeccable accessibility）
 */

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const inputFocus = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:border-brand';

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
        className={cn(
          "w-full pl-10 pr-4 py-2 text-sm border border-line rounded-md bg-surface-card",
          "transition-colors duration-normal ease-out-expo",
          inputFocus,
        )}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

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
          "w-full pr-8 py-2 text-sm border border-line rounded-md appearance-none bg-surface-card",
          "transition-colors duration-normal ease-out-expo",
          inputFocus,
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

interface SortButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function SortButton({ active, onClick, children }: SortButtonProps) {
  return (
    <button
      className={cn(
        "px-3 py-2 text-xs rounded-md border cursor-pointer",
        "transition-all duration-normal ease-out-expo",
        "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
        active
          ? 'bg-neutral-50 text-text-primary border-line-hover'
          : 'bg-surface-card text-text-secondary border-line hover:border-line-hover hover:text-text-primary'
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
