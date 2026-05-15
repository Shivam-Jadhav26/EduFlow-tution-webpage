import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary:
        'bg-gradient-to-b from-teal-500 to-teal-700 text-white shadow-[0_4px_0_0_#115e59,0_6px_12px_rgba(13,148,136,0.35)] hover:shadow-[0_2px_0_0_#115e59,0_4px_8px_rgba(13,148,136,0.3)] hover:translate-y-[2px] active:shadow-[0_0px_0_0_#115e59,0_1px_4px_rgba(13,148,136,0.2)] active:translate-y-[4px]',
      secondary:
        'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-[0_4px_0_0_#3730a3,0_6px_12px_rgba(99,102,241,0.35)] hover:shadow-[0_2px_0_0_#3730a3,0_4px_8px_rgba(99,102,241,0.3)] hover:translate-y-[2px] active:shadow-[0_0px_0_0_#3730a3,0_1px_4px_rgba(99,102,241,0.2)] active:translate-y-[4px]',
      outline:
        'border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-[0_4px_0_0_#cbd5e1,0_6px_12px_rgba(100,116,139,0.15)] dark:shadow-[0_4px_0_0_#334155,0_6px_12px_rgba(51,65,85,0.3)] hover:shadow-[0_2px_0_0_#cbd5e1,0_4px_8px_rgba(100,116,139,0.1)] hover:translate-y-[2px] active:shadow-[0_0px_0_0_#cbd5e1,0_1px_4px_rgba(100,116,139,0.05)] active:translate-y-[4px]',
      ghost:
        'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
      danger:
        'bg-gradient-to-b from-red-500 to-red-700 text-white shadow-[0_4px_0_0_#991b1b,0_6px_12px_rgba(239,68,68,0.35)] hover:shadow-[0_2px_0_0_#991b1b,0_4px_8px_rgba(239,68,68,0.3)] hover:translate-y-[2px] active:shadow-[0_0px_0_0_#991b1b,0_1px_4px_rgba(239,68,68,0.2)] active:translate-y-[4px]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10 p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
