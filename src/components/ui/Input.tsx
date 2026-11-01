import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0] tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-[#777D8A] pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={cn(
            'w-full bg-white dark:bg-[#161A23] text-[#171923] dark:text-[#F0F2F5] placeholder-[#9BA1B0] text-sm rounded-xl border border-[#E9EAF0] dark:border-[#232838] transition-all duration-150',
            'focus:outline-none focus:border-[#6857E8] focus:ring-3 focus:ring-[#6857E8]/15',
            'disabled:bg-[#F8F9FC] dark:disabled:bg-[#11141C] disabled:text-[#A0AEC0] disabled:cursor-not-allowed',
            leftIcon ? 'pl-10' : 'pl-3.5',
            rightIcon ? 'pr-10' : 'pr-3.5',
            'py-2.5',
            error && 'border-[#E05252] focus:border-[#E05252] focus:ring-[#E05252]/15',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 flex items-center justify-center text-[#777D8A]">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-[#E05252] font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#777D8A] dark:text-[#8C93A3]">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';

