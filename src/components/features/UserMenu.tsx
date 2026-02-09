'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import { ConfirmDialog } from '@/components/ui';
import { cn } from '@/lib/utils';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';

// ===========================================
// User Menu Component
// ===========================================

export function UserMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse" />
    );
  }

  const handleLogoutClick = () => {
    setIsOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors"
      >
        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <span className="max-w-[100px] truncate hidden sm:block">
          {user?.email?.split('@')[0]}
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-strong dark:shadow-none border border-transparent dark:border-slate-700 z-50 overflow-hidden">
            {/* User info */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                {user?.email}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Connecté</p>
            </div>

            {/* Menu items */}
            <div className="py-2">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Paramètres
              </Link>
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </>
      )}

      {/* Logout confirmation */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmLabel="Se déconnecter"
        cancelLabel="Annuler"
        variant="warning"
      />
    </div>
  );
}
