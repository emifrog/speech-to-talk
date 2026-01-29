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
      {/* Background with blur */}
      <div className="absolute inset-0 bg-white/90 dark:bg-dark/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50" />

      {/* Navigation content */}
      <div className="relative max-w-lg mx-auto px-2">
        <div className="flex justify-around items-end py-1" role="menubar">
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
                  'min-w-[60px]',
                  focusVisibleClasses,
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
