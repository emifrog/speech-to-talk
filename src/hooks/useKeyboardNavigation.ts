'use client';

import { useEffect, useCallback, useRef } from 'react';

// ===========================================
// Keyboard Navigation Hook
// ===========================================

interface UseKeyboardNavigationOptions {
  /** Enable/disable the hook */
  enabled?: boolean;
  /** Callback when Escape is pressed */
  onEscape?: () => void;
  /** Callback when Enter is pressed */
  onEnter?: () => void;
  /** Callback when Space is pressed */
  onSpace?: () => void;
  /** Custom key handlers */
  keyHandlers?: Record<string, (event: KeyboardEvent) => void>;
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const { enabled = true, onEscape, onEnter, onSpace, keyHandlers } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Only allow Escape in inputs
        if (event.key !== 'Escape') return;
      }

      switch (event.key) {
        case 'Escape':
          onEscape?.();
          break;
        case 'Enter':
          onEnter?.();
          break;
        case ' ':
          // Prevent page scroll on space
          if (target.tagName !== 'BUTTON') {
            event.preventDefault();
          }
          onSpace?.();
          break;
        default:
          keyHandlers?.[event.key]?.(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onEscape, onEnter, onSpace, keyHandlers]);
}

// ===========================================
// Focus Trap Hook (for modals/dialogs)
// ===========================================

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when trap activates
    firstElement?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}

// ===========================================
// Skip Link Hook
// ===========================================

export function useSkipToContent() {
  const skipToMain = useCallback(() => {
    const main = document.querySelector('main') || document.querySelector('[role="main"]');
    if (main) {
      (main as HTMLElement).tabIndex = -1;
      (main as HTMLElement).focus();
    }
  }, []);

  return { skipToMain };
}

// ===========================================
// Arrow Key Navigation Hook
// ===========================================

interface UseArrowNavigationOptions {
  /** List of items to navigate */
  itemCount: number;
  /** Current focused index */
  currentIndex: number;
  /** Callback when index changes */
  onIndexChange: (index: number) => void;
  /** Enable horizontal navigation */
  horizontal?: boolean;
  /** Enable vertical navigation */
  vertical?: boolean;
  /** Wrap around at ends */
  wrap?: boolean;
}

export function useArrowNavigation({
  itemCount,
  currentIndex,
  onIndexChange,
  horizontal = true,
  vertical = true,
  wrap = true,
}: UseArrowNavigationOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowUp':
          if (vertical) {
            event.preventDefault();
            newIndex = currentIndex - 1;
          }
          break;
        case 'ArrowDown':
          if (vertical) {
            event.preventDefault();
            newIndex = currentIndex + 1;
          }
          break;
        case 'ArrowLeft':
          if (horizontal) {
            event.preventDefault();
            newIndex = currentIndex - 1;
          }
          break;
        case 'ArrowRight':
          if (horizontal) {
            event.preventDefault();
            newIndex = currentIndex + 1;
          }
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = itemCount - 1;
          break;
        default:
          return;
      }

      // Handle wrapping
      if (wrap) {
        if (newIndex < 0) newIndex = itemCount - 1;
        if (newIndex >= itemCount) newIndex = 0;
      } else {
        newIndex = Math.max(0, Math.min(itemCount - 1, newIndex));
      }

      if (newIndex !== currentIndex) {
        onIndexChange(newIndex);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, itemCount, onIndexChange, horizontal, vertical, wrap]);
}

// ===========================================
// Roving Tab Index Hook
// ===========================================

export function useRovingTabIndex(itemRefs: React.RefObject<HTMLElement>[]) {
  const focusItem = useCallback((index: number) => {
    const item = itemRefs[index]?.current;
    if (item) {
      // Reset all tabindex
      itemRefs.forEach((ref, i) => {
        if (ref.current) {
          ref.current.tabIndex = i === index ? 0 : -1;
        }
      });
      item.focus();
    }
  }, [itemRefs]);

  return { focusItem };
}
