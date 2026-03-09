/**
 * Card 组件库
 *
 * 重构：hover 增加微阴影（shadow-card-hover），
 * 去掉 CardAccent 的左侧色条（V-DN-2）。
 * 过渡使用 ease-out-expo。
 */

import { cn } from '@/lib/utils';
import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  clickable?: boolean;
  noBorder?: boolean;
}

export function Card({
  children,
  hover = false,
  clickable = false,
  noBorder = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface-card rounded-lg',
        !noBorder && 'border border-line',
        hover && 'hover:shadow-card-hover hover:border-line-hover transition-all duration-normal ease-out-expo',
        clickable && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardCompact({ children, className, ...props }: CardProps) {
  return (
    <Card className={cn('p-3', className)} hover clickable {...props}>
      {children}
    </Card>
  );
}

export function CardStandard({ children, className, ...props }: CardProps) {
  return (
    <Card className={cn('p-4', className)} hover {...props}>
      {children}
    </Card>
  );
}

interface CardAccentProps extends CardProps {
  accentColor?: string;
}

export function CardAccent({
  children,
  className,
  ...props
}: CardAccentProps) {
  return (
    <Card
      className={cn('bg-surface-card', className)}
      {...props}
    >
      {children}
    </Card>
  );
}
