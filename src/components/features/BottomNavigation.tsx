'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Mic, MessageSquare, ScanLine, AlertCircle } from 'lucide-react';

// ===========================================
// Bottom Navigation Component - Modern Design
// ===========================================

const navItems = [
  {
    href: '/translate',
    label: 'Traduire',
    icon: Mic,
  },
  {
    href: '/conversation',
    label: 'Conversation',
    icon: MessageSquare,
  },
  {
    href: '/scan',
    label: 'Scanner',
    icon: ScanLine,
  },
  {
    href: '/emergency',
    label: 'Urgence',
    icon: AlertCircle,
    isEmergency: true,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb">
      {/* Background with blur */}
      <div className="absolute inset-0 bg-white/90 dark:bg-dark/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50" />

      {/* Navigation content */}
      <div className="relative max-w-lg mx-auto px-2">
        <div className="flex justify-around items-end py-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href === '/translate' && pathname === '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95',
                  'min-w-[60px]',
                  isActive
                    ? item.isEmergency
                      ? 'text-accent'
                      : 'text-primary'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                )}
              >
                {/* Icon container */}
                <div className={cn(
                  'relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200',
                  isActive && !item.isEmergency && 'bg-primary/10 dark:bg-primary/20',
                  isActive && item.isEmergency && 'bg-accent/10 dark:bg-accent/20'
                )}>
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-all duration-200',
                      isActive ? 'scale-110' : 'scale-100'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-[10px] mt-0.5 transition-all duration-200',
                    isActive ? 'font-bold' : 'font-medium'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
