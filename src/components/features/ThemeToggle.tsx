'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { lightHaptic } from '@/lib/haptics';
import { Sun, Moon, Menu, LogIn, Mail, X } from 'lucide-react';
import Link from 'next/link';

// ===========================================
// Settings Menu Component (Login, Dark Mode, Contact)
// ===========================================

interface SettingsMenuProps {
  className?: string;
}

export function SettingsMenu({ className }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, toggleTheme } = useTheme();

  const handleToggleTheme = () => {
    lightHaptic();
    toggleTheme();
    setIsOpen(false);
  };

  const handleOpenMenu = () => {
    lightHaptic();
    setIsOpen(true);
  };

  const handleCloseMenu = () => {
    lightHaptic();
    setIsOpen(false);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn('relative z-50', className)} ref={menuRef}>
      {/* Menu button - 44px for firefighter accessibility */}
      <button
        onClick={handleOpenMenu}
        className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center',
          'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm',
          'border border-white/50 dark:border-slate-600',
          'shadow-soft',
          'transition-all duration-300',
          'hover:scale-105 hover:bg-white dark:hover:bg-slate-700 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary'
        )}
        aria-label="Ouvrir le menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Menu className="w-5 h-5 text-primary-600 dark:text-white" strokeWidth={2.5} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
            onClick={handleCloseMenu}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <div
            className={cn(
              'fixed right-4 top-16 z-[100]',
              'w-72 p-2',
              'bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl',
              'border border-slate-200/50 dark:border-slate-700/50',
              'rounded-2xl shadow-strong dark:shadow-none',
              'animate-slide-up'
            )}
            role="menu"
            aria-label="Menu paramètres"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl mb-2">
              <span className="text-base font-bold text-white">
                Menu
              </span>
              <button
                onClick={handleCloseMenu}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Login */}
            <Link
              href="/auth/login"
              onClick={handleCloseMenu}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl',
                'text-slate-700 dark:text-slate-200',
                'hover:bg-slate-100 dark:hover:bg-slate-700/50',
                'transition-all duration-200',
                'group'
              )}
              role="menuitem"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <LogIn className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-800 dark:text-white font-medium">Connexion</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Se connecter ou créer un compte</p>
              </div>
            </Link>

            {/* Dark/Light mode toggle */}
            <button
              onClick={handleToggleTheme}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl',
                'text-slate-700 dark:text-slate-200',
                'hover:bg-slate-100 dark:hover:bg-slate-700/50',
                'transition-all duration-200',
                'group'
              )}
              role="menuitem"
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow',
                resolvedTheme === 'dark'
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                  : 'bg-gradient-to-br from-indigo-400 to-purple-600'
              )}>
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-800 dark:text-white font-medium">
                  {resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {resolvedTheme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
                </p>
              </div>
            </button>

            {/* Contact */}
            <Link
              href="/contact"
              onClick={handleCloseMenu}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl',
                'text-slate-700 dark:text-slate-200',
                'hover:bg-slate-100 dark:hover:bg-slate-700/50',
                'transition-all duration-200',
                'group'
              )}
              role="menuitem"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-800 dark:text-white font-medium">Contact</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nous envoyer un message</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
