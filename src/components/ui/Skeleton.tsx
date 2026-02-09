'use client';

import { cn } from '@/lib/utils';

// ===========================================
// Skeleton Loader Components
// ===========================================

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg',
        className
      )}
      style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
    />
  );
}

// Skeleton for text lines
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

// Skeleton for cards
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white dark:bg-slate-800rounded-2xl shadow-soft p-4 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

// Skeleton for language selector
export function SkeletonLanguageSelector() {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 bg-white dark:bg-slate-800rounded-xl p-4 shadow-soft">
        <Skeleton className="h-3 w-8 mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 bg-white dark:bg-slate-800rounded-xl p-4 shadow-soft">
        <Skeleton className="h-3 w-10 mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for microphone button
export function SkeletonMicrophoneButton() {
  return (
    <div className="flex flex-col items-center">
      <Skeleton className="w-32 h-32 rounded-full" />
      <div className="mt-6 text-center space-y-2">
        <Skeleton className="h-5 w-40 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}

// Skeleton for translation result
export function SkeletonTranslationResult() {
  return (
    <div className="bg-white dark:bg-slate-800rounded-2xl shadow-soft p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
        <SkeletonText lines={2} />
      </div>
      <div className="h-px bg-slate-100 dark:bg-slate-700" />
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="bg-primary/5 rounded-xl p-4">
        <SkeletonText lines={2} />
      </div>
      <div className="flex gap-3">
        <Skeleton className="flex-1 h-12 rounded-xl" />
        <Skeleton className="flex-1 h-12 rounded-xl" />
      </div>
    </div>
  );
}

// Skeleton for emergency phrase card
export function SkeletonEmergencyCard() {
  return (
    <div className="bg-white dark:bg-slate-800rounded-2xl shadow-soft p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
    </div>
  );
}

// Skeleton for conversation message
export function SkeletonConversationMessage({ isRight = false }: { isRight?: boolean }) {
  return (
    <div className={cn('flex items-start gap-3', isRight && 'flex-row-reverse')}>
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className={cn('flex-1 max-w-[80%]', isRight && 'flex flex-col items-end')}>
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>
        <div className={cn('rounded-2xl p-4 w-full', isRight ? 'bg-accent/10' : 'bg-white dark:bg-slate-800shadow-soft')}>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-3" />
          <div className="border-t border-slate-100 dark:border-slate-700 pt-2">
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Page loading skeleton
export function SkeletonPage() {
  return (
    <div className="page-container">
      {/* Header skeleton */}
      <div className="bg-slate-200 dark:bg-slate-800 px-4 pt-14 pb-14">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="bg-white dark:bg-slate-800rounded-t-3xl -mt-6 relative z-10 shadow-strong px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto space-y-6">
          <SkeletonLanguageSelector />
          <div className="py-8">
            <SkeletonMicrophoneButton />
          </div>
          <SkeletonTranslationResult />
        </div>
      </div>
    </div>
  );
}
