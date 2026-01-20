import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ===========================================
// Button Component - Glassmorphism Design
// ===========================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

    const variants = {
      primary: 'text-white bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 focus:ring-primary-400 shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_30px_rgba(37,99,235,0.5)] hover:-translate-y-0.5',
      secondary: 'text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-dark-light/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-dark-light focus:ring-slate-400 shadow-glass hover:shadow-glass-lg',
      accent: 'text-white bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 hover:from-accent-600 hover:via-accent-700 hover:to-accent-800 focus:ring-accent-400 shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:shadow-[0_6px_30px_rgba(220,38,38,0.5)] hover:-translate-y-0.5',
      ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus:ring-slate-300',
      outline: 'border-2 border-primary/50 text-primary dark:text-primary-400 hover:bg-primary hover:text-white hover:border-primary focus:ring-primary-400 backdrop-blur-sm',
      glass: 'text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-dark-light/60 backdrop-blur-xl border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-dark-light/80 focus:ring-white/50 shadow-glass hover:shadow-glass-lg',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-xl',
      md: 'px-5 py-2.5 text-base rounded-2xl',
      lg: 'px-7 py-3.5 text-lg rounded-2xl',
      icon: 'p-3 rounded-2xl',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
