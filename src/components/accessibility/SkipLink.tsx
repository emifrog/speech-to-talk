'use client';

import { cn } from '@/lib/utils';

// ===========================================
// Skip to Content Link
// ===========================================

interface SkipLinkProps {
  href?: string;
  className?: string;
}

export function SkipLink({ href = '#main-content', className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:fixed focus:top-4 focus:left-4 focus:z-[9999]',
        'focus:px-4 focus:py-2 focus:rounded-lg',
        'focus:bg-primary focus:text-white',
        'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary',
        'font-medium text-sm',
        className
      )}
    >
      Aller au contenu principal
    </a>
  );
}

// ===========================================
// Live Region for Screen Readers
// ===========================================

interface LiveRegionProps {
  message: string;
  /** 'polite' waits for user to be idle, 'assertive' interrupts */
  priority?: 'polite' | 'assertive';
}

export function LiveRegion({ message, priority = 'polite' }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// ===========================================
// Visually Hidden (accessible but not visible)
// ===========================================

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'label';
}

export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return <Component className="sr-only">{children}</Component>;
}

// ===========================================
// Focus Visible Outline
// ===========================================

export const focusVisibleClasses = [
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-primary',
  'focus-visible:ring-offset-2',
  'dark:focus-visible:ring-primary-400',
  'dark:focus-visible:ring-offset-slate-900',
].join(' ');

export default SkipLink;
