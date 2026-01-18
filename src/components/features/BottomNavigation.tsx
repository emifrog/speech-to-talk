'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Mic, MessageSquare, ScanLine, AlertCircle } from 'lucide-react';

// ===========================================
// Bottom Navigation Component
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 safe-area-pb shadow-strong z-50">
      <div className="flex justify-around py-3 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === '/translate' && pathname === '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[72px] py-2 px-3 rounded-2xl transition-all active:scale-90',
                isActive
                  ? item.isEmergency
                    ? 'bg-accent/10 text-accent'
                    : 'bg-primary/10 text-primary'
                  : 'text-gray-400 active:bg-gray-50'
              )}
            >
              <div className={cn(
                'relative',
                isActive && 'animate-bounce-subtle'
              )}>
                <Icon
                  className={cn(
                    'w-7 h-7',
                    isActive && !item.isEmergency && 'text-primary',
                    isActive && item.isEmergency && 'text-accent'
                  )}
                />
                {isActive && (
                  <div className={cn(
                    'absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                    item.isEmergency ? 'bg-accent' : 'bg-primary'
                  )} />
                )}
              </div>
              <span
                className={cn(
                  'text-[11px] mt-1.5 font-medium',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
