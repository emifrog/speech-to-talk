'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Mic, MessageSquare, ScanLine, AlertCircle } from 'lucide-react';
import { focusVisibleClasses } from '@/components/accessibility';

// ===========================================
// Bottom Navigation Component - Modern Design
// ===========================================

const navItems = [
  {
    href: '/translate',
    label: 'Traduire',
    icon: Mic,
    shortcut: '1',
  },
  {
    href: '/conversation',
    label: 'Conversation',
    icon: MessageSquare,
    shortcut: '2',
  },
  {
    href: '/scan',
    label: 'Scanner',
    icon: ScanLine,
    shortcut: '3',
  },
  {
    href: '/emergency',
    label: 'Urgence',
    icon: AlertCircle,
    isEmergency: true,
    shortcut: '4',
  },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Keyboard shortcuts (Alt + 1-4)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Alt + number for quick navigation
      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        const index = parseInt(event.key) - 1;
        if (index >= 0 && index < navItems.length) {
          event.preventDefault();
          navRefs.current[index]?.click();
        }
      }

      // Arrow key navigation when nav is focused
      if (document.activeElement?.closest('nav[aria-label="Navigation principale"]')) {
        const currentIndex = navRefs.current.findIndex(
          (ref) => ref === document.activeElement
        );

        if (currentIndex !== -1) {
          let newIndex = currentIndex;

          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            newIndex = currentIndex === 0 ? navItems.length - 1 : currentIndex - 1;
          } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            newIndex = currentIndex === navItems.length - 1 ? 0 : currentIndex + 1;
          } else if (event.key === 'Home') {
            event.preventDefault();
            newIndex = 0;
          } else if (event.key === 'End') {
            event.preventDefault();
            newIndex = navItems.length - 1;
          }

          if (newIndex !== currentIndex) {
            navRefs.current[newIndex]?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setNavRef = useCallback((index: number) => (el: HTMLAnchorElement | null) => {
    navRefs.current[index] = el;
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb"
      aria-label="Navigation principale"
      role="navigation"
    >
      {/* Background with blur and strong shadow */}
      <div className="absolute inset-0 bg-white/95 dark:bg-dark/95 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-700/60 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.3)]" />

      {/* Navigation content */}
      <div className="relative max-w-lg mx-auto px-2">
        <div className="flex justify-around items-end py-2" role="menubar">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href ||
              (item.href === '/translate' && pathname === '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                ref={setNavRef(index)}
                href={item.href}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${item.label} (Alt+${item.shortcut})`}
                tabIndex={isActive ? 0 : -1}
                className={cn(
                  'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95',
                  'min-w-[64px]',
                  focusVisibleClasses,
                  isActive
                    ? item.isEmergency
                      ? 'text-accent'
                      : 'text-primary'
                    : item.isEmergency
                      ? 'text-slate-400 dark:text-slate-500 hover:text-accent/70 dark:hover:text-accent/70'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                )}
              >
                {/* Icon container */}
                <div className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200',
                  // Active states: filled container
                  isActive && !item.isEmergency && 'bg-primary text-white shadow-md shadow-primary/25',
                  isActive && item.isEmergency && 'bg-accent text-white shadow-md shadow-accent/25',
                  // Inactive hover
                  !isActive && !item.isEmergency && 'hover:bg-slate-100 dark:hover:bg-slate-800',
                  !isActive && item.isEmergency && 'hover:bg-accent/10 dark:hover:bg-accent/10'
                )}>
                  <Icon
                    className={cn(
                      'w-6 h-6 transition-all duration-200',
                      isActive ? 'scale-110' : 'scale-100',
                      // Emergency icon always tinted when inactive
                      !isActive && item.isEmergency && 'text-accent/60'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-[11px] mt-1 transition-all duration-200',
                    isActive ? 'font-bold' : 'font-medium',
                    // Emergency label always subtly colored when inactive
                    !isActive && item.isEmergency && 'text-accent/50'
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
