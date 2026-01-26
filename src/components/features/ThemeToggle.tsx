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
  };

  const handleOpenMenu = () => {
    lightHaptic();
    setIsOpen(true);
  };

  const handleCloseMenu = () => {
    lightHaptic();
    setIsOpen(false);
  };

  // Fermer le menu si on clique en dehors
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
      {/* Bouton menu */}
      <button
        onClick={handleOpenMenu}
        className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center',
          'bg-white dark:bg-slate-800',
          'border-2 border-primary-200 dark:border-slate-600',
          'shadow-[0_4px_20px_rgba(0,0,0,0.2)]',
          'transition-all duration-300',
          'hover:scale-110 hover:bg-primary-50 dark:hover:bg-slate-700 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2'
        )}
        aria-label="Ouvrir le menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-4 h-4 text-primary-600 dark:text-white" strokeWidth={2.5} />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
            onClick={handleCloseMenu}
          />

          {/* Menu */}
          <div
            className={cn(
              'fixed right-4 top-16 z-[100]',
              'w-64 p-2',
              'bg-white dark:bg-slate-800',
              'border border-slate-200 dark:border-slate-700',
              'rounded-2xl shadow-2xl',
              'animate-slide-up'
            )}
          >
            {/* Header du menu */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl mb-2">
              <span className="text-base font-bold text-white">
                Menu
              </span>
              <button
                onClick={handleCloseMenu}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Option: Connexion */}
            <Link
              href="/auth/login"
              onClick={handleCloseMenu}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl',
                'text-slate-700 dark:text-slate-200',
                'hover:bg-slate-100 dark:hover:bg-dark-lighter',
                'transition-all duration-200',
                'group'
              )}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <LogIn className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-black dark:text-white font-medium">Connexion</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Se connecter ou créer un compte</p>
              </div>
            </Link>

            {/* Option: Mode sombre/clair */}
            <button
              onClick={handleToggleTheme}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl',
                'text-slate-700 dark:text-slate-200',
                'hover:bg-slate-100 dark:hover:bg-dark-lighter',
                'transition-all duration-200',
                'group'
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow',
                resolvedTheme === 'dark'
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                  : 'bg-gradient-to-br from-indigo-400 to-purple-600'
              )}>
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-white" />
                ) : (
                  <Moon className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm text-black dark:text-white font-medium">
                  {resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {resolvedTheme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
                </p>
              </div>
            </button>

            {/* Option: Contact */}
            <Link
              href="/contact"
              onClick={handleCloseMenu}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl',
                'text-slate-700 dark:text-slate-200',
                'hover:bg-slate-100 dark:hover:bg-dark-lighter',
                'transition-all duration-200',
                'group'
              )}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-black dark:text-white font-medium">Contact</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nous envoyer un message</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

// Garder l'ancien composant pour compatibilité
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const handleToggle = () => {
    lightHaptic();
    toggleTheme();
  };

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
