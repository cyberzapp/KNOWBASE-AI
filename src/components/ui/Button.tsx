import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6857E8]/20 disabled:opacity-50 disabled:pointer-events-none rounded-xl active:scale-[0.98] select-none cursor-pointer';

  const variants = {
    primary: 'bg-[#6857E8] text-white hover:bg-[#5846D4] shadow-sm shadow-[#6857E8]/20 border border-[#5846D4]',
    secondary: 'bg-[#F0EDFF] text-[#6857E8] hover:bg-[#E5E0FF] border border-[#E0DAFC]',
    outline: 'bg-white dark:bg-[#161A23] text-[#171923] dark:text-[#F0F2F5] border border-[#E9EAF0] dark:border-[#232838] hover:bg-[#F8F9FC] dark:hover:bg-[#1E2330]',
    ghost: 'text-[#777D8A] dark:text-[#9BA1B0] hover:text-[#171923] dark:hover:text-white hover:bg-[#F0F2F7] dark:hover:bg-[#232838]',
    danger: 'bg-[#E05252] text-white hover:bg-[#D04040] shadow-sm shadow-[#E05252]/20 border border-[#D04040]',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 h-8 gap-1.5',
    md: 'text-sm px-3.5 py-2 h-10 gap-2',
    lg: 'text-base px-5 py-2.5 h-12 gap-2.5',
    icon: 'h-9 w-9 p-0',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

