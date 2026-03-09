/**
 * Button — 统一按钮，easing 改为 ease-out-expo
 */

import { cn } from '@/lib/utils';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'default' | 'primary' | 'ghost' | 'text' | 'link' | 'ai';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    'bg-surface-card text-text-primary border border-line hover:bg-surface-hover-btn hover:border-line-hover hover:shadow-xs',
  primary:
    'bg-brand text-text-inverse border border-transparent hover:bg-brand-hover hover:shadow-brand-sm',
  ghost:
    'bg-transparent text-text-secondary border border-transparent hover:bg-surface-hover-btn hover:text-text-primary',
  text:
    'bg-transparent text-brand border border-transparent hover:bg-brand-subtle',
  link:
    'bg-transparent text-brand border-none p-0 hover:underline hover:opacity-80',
  ai:
    'text-brand bg-brand-subtle border border-brand-muted hover:bg-brand-alpha-10 hover:border-brand-alpha-20',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
  icon: 'p-1.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      icon,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 font-medium rounded-md cursor-pointer',
          'transition-all duration-normal ease-out-expo',
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className,
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : icon ? (
          <span className="shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
