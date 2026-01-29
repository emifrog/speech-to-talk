// ===========================================
// Sentry Integration Utilities
// ===========================================

// Type definitions for when Sentry is not installed
type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

// Dynamic import to prevent build errors when Sentry is not installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;

if (typeof window !== 'undefined' || typeof process !== 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Sentry = require('@sentry/nextjs');
  } catch {
    // Sentry not installed, all functions will be no-ops
    console.debug('[Sentry] Not installed - error tracking disabled');
  }
}

/**
 * Check if Sentry is available
 */
function isSentryAvailable(): boolean {
  return Sentry !== null;
}

/**
 * Capture an error with additional context
 */
export function captureError(
  error: Error | string,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    level?: SeverityLevel;
    user?: { id?: string; email?: string };
  }
): string {
  if (!isSentryAvailable()) {
    console.error('[Error]', error, context);
    return '';
  }

  const errorObj = typeof error === 'string' ? new Error(error) : error;

  if (context?.user) {
    Sentry.setUser(context.user);
  }

  if (context?.tags) {
    Object.entries(context.tags).forEach(([key, value]) => {
      Sentry.setTag(key, value);
    });
  }

  if (context?.extra) {
    Object.entries(context.extra).forEach(([key, value]) => {
      Sentry.setExtra(key, value);
    });
  }

  return Sentry.captureException(errorObj, {
    level: context?.level || 'error',
  });
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(
  message: string,
  level: SeverityLevel = 'info',
  extra?: Record<string, unknown>
): string {
  if (!isSentryAvailable()) {
    console.log(`[${level}]`, message, extra);
    return '';
  }

  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      Sentry.setExtra(key, value);
    });
  }

  return Sentry.captureMessage(message, level);
}

/**
 * Set user context for all subsequent events
 */
export function setUser(user: { id: string; email?: string } | null): void {
  if (!isSentryAvailable()) return;
  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: SeverityLevel;
  data?: Record<string, unknown>;
}): void {
  if (!isSentryAvailable()) return;

  Sentry.addBreadcrumb({
    message: breadcrumb.message,
    category: breadcrumb.category || 'app',
    level: breadcrumb.level || 'info',
    data: breadcrumb.data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string): void {
  if (!isSentryAvailable()) return;

  Sentry.startSpan({ name, op }, () => {
    // Transaction logic
  });
}

/**
 * Wrap an async function with error tracking
 */
export async function withErrorTracking<T>(
  fn: () => Promise<T>,
  context?: {
    name: string;
    tags?: Record<string, string>;
  }
): Promise<T> {
  try {
    addBreadcrumb({
      message: `Starting: ${context?.name || 'Unknown operation'}`,
      category: 'operation',
      level: 'info',
    });

    const result = await fn();

    addBreadcrumb({
      message: `Completed: ${context?.name || 'Unknown operation'}`,
      category: 'operation',
      level: 'info',
    });

    return result;
  } catch (error) {
    captureError(error as Error, {
      tags: {
        operation: context?.name || 'unknown',
        ...context?.tags,
      },
    });
    throw error;
  }
}

// ===========================================
// Service-specific error tracking
// ===========================================

export function trackTranslationError(error: Error, params: {
  sourceLang: string;
  targetLang: string;
  textLength: number;
}): void {
  captureError(error, {
    tags: {
      service: 'translation',
      sourceLang: params.sourceLang,
      targetLang: params.targetLang,
    },
    extra: {
      textLength: params.textLength,
    },
  });
}

export function trackSpeechToTextError(error: Error, params: {
  languageCode: string;
  audioDuration?: number;
}): void {
  captureError(error, {
    tags: {
      service: 'speech-to-text',
      languageCode: params.languageCode,
    },
    extra: {
      audioDuration: params.audioDuration,
    },
  });
}

export function trackTextToSpeechError(error: Error, params: {
  languageCode: string;
  textLength: number;
}): void {
  captureError(error, {
    tags: {
      service: 'text-to-speech',
      languageCode: params.languageCode,
    },
    extra: {
      textLength: params.textLength,
    },
  });
}

export function trackOCRError(error: Error, params: {
  imageSize?: number;
}): void {
  captureError(error, {
    tags: {
      service: 'ocr',
    },
    extra: {
      imageSize: params.imageSize,
    },
  });
}

// ===========================================
// Rate limit tracking
// ===========================================

export function trackRateLimitHit(service: string, retryAfter: number): void {
  captureMessage(`Rate limit hit: ${service}`, 'warning', {
    service,
    retryAfter,
  });
}

// ===========================================
// Performance tracking
// ===========================================

export function trackPerformance(
  name: string,
  duration: number,
  tags?: Record<string, string>
): void {
  if (!isSentryAvailable()) return;

  if (tags) {
    Object.entries(tags).forEach(([key, value]) => {
      Sentry.setTag(key, value);
    });
  }

  Sentry.setMeasurement(name, duration, 'millisecond');
}
