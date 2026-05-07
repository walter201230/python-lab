'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** 仅在 loading=true 时使用，覆盖 children */
  loadingText?: ReactNode;
  /** 允许外部追加额外类名（少用，仅特殊布局场景） */
  className?: string;
}

const VARIANT_CLASS: Record<Variant, string> = {
  // 主操作：主题渐变绿
  primary:
    'gradient-tech-green text-slate-950 font-semibold shadow shadow-emerald-500/40 hover:opacity-95',
  // 次操作：slate 边框 + 浅底
  secondary:
    'border border-slate-700 bg-slate-800 text-slate-100 font-medium hover:bg-slate-700',
  // 文字按钮：透明 + 下划线
  ghost:
    'text-slate-300 underline underline-offset-2 hover:text-slate-100 disabled:no-underline',
};

const SIZE_CLASS: Record<Size, string> = {
  sm: 'rounded-md px-3 py-1 text-xs',
  md: 'rounded-md px-4 py-1.5 text-sm',
  lg: 'rounded-lg px-7 py-3 text-base',
};

/**
 * 通用按钮：三种 variant 共享 focus-ring、disabled 透明度、loading 文案。
 *
 * Variant 选择：
 *   primary   主 CTA / 检查答案 / 重试
 *   secondary 次操作 / 运行 / 返回目录
 *   ghost     轻量动作 / 查看答案 / 关闭
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  loadingText,
  disabled,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const base = variant === 'ghost'
    ? 'inline-flex items-center gap-1 transition disabled:opacity-40 focus-ring'
    : 'inline-flex items-center gap-2 transition disabled:opacity-40 focus-ring';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${className}`.trim()}
      {...rest}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
