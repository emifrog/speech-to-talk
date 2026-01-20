'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { lightHaptic } from '@/lib/haptics';
import { Sun, Moon, Monitor } from 'lucide-react';

// ===========================================
// Theme Toggle Component
// ===========================================

interface ThemeToggleProps {
  variant?: 'icon' | 'full';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const handleToggle = () => {
    lightHaptic();
    toggleTheme();
  };

  const handleSetTheme = (newTheme: 'light' | 'dark' | 'system') => {
    lightHaptic();
    setTheme(newTheme);
  };

  // Version simple (icône seule)
  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          'bg-white/60 dark:bg-dark-light/60',
          'backdrop-blur-xl',
          'border border-white/50 dark:border-white/10',
          'shadow-glass hover:shadow-glass-lg',
          'transition-all duration-300',
          'hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
          'dark:focus:ring-offset-dark',
          className
        )}
        aria-label={resolvedTheme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600" />
        )}
      </button>
    );
  }

  // Version complète (3 options)
  return (
    <div
      className={cn(
        'flex gap-1 p-1 rounded-xl',
        'bg-white/60 dark:bg-dark-light/60',
        'backdrop-blur-xl',
        'border border-white/50 dark:border-white/10',
        'shadow-glass',
        className
      )}
      role="radiogroup"
      aria-label="Sélectionner le thème"
    >
      <button
        onClick={() => handleSetTheme('light')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-400',
          theme === 'light'
            ? 'bg-white dark:bg-dark-lighter shadow-sm text-primary'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        )}
        role="radio"
        aria-checked={theme === 'light'}
      >
        <Sun className="w-4 h-4" />
        <span className="text-sm font-medium">Clair</span>
      </button>

      <button
        onClick={() => handleSetTheme('dark')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-400',
          theme === 'dark'
            ? 'bg-white dark:bg-dark-lighter shadow-sm text-primary'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        )}
        role="radio"
        aria-checked={theme === 'dark'}
      >
        <Moon className="w-4 h-4" />
        <span className="text-sm font-medium">Sombre</span>
      </button>

      <button
        onClick={() => handleSetTheme('system')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-400',
          theme === 'system'
            ? 'bg-white dark:bg-dark-lighter shadow-sm text-primary'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        )}
        role="radio"
        aria-checked={theme === 'system'}
      >
        <Monitor className="w-4 h-4" />
        <span className="text-sm font-medium">Auto</span>
      </button>
    </div>
  );
}
