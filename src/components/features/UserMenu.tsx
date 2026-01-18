'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';

// ===========================================
// User Menu Component
// ===========================================

export function UserMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse" />
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/login"
        className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors"
      >
        <User className="w-4 h-4" />
        Connexion
      </Link>
    );
  }

  const handleLogout = async () => {
    setIsOpen(false);
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
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">Connecté</p>
            </div>

            {/* Menu items */}
            <div className="py-2">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Paramètres
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
