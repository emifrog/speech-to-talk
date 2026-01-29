// ===========================================
// Client-Side Rate Limiting
// ===========================================

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Unique identifier for this rate limit bucket */
  key: string;
}

interface RateLimitState {
  requests: number[];
  blocked: boolean;
  blockedUntil: number | null;
}

// In-memory storage for rate limit state
const rateLimitStore = new Map<string, RateLimitState>();

// Default configurations for different API types
export const RATE_LIMIT_CONFIGS = {
  translation: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 requests per minute
    key: 'translation',
  },
  speechToText: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 requests per minute
    key: 'speechToText',
  },
  textToSpeech: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 requests per minute
    key: 'textToSpeech',
  },
  ocr: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 requests per minute
    key: 'ocr',
  },
  detectLanguage: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 requests per minute
    key: 'detectLanguage',
  },
  global: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 total requests per minute
    key: 'global',
  },
} as const;

/**
 * Get or initialize rate limit state
 */
function getState(key: string): RateLimitState {
  let state = rateLimitStore.get(key);

  if (!state) {
    state = {
      requests: [],
      blocked: false,
      blockedUntil: null,
    };
    rateLimitStore.set(key, state);
  }

  return state;
}

/**
 * Clean up old requests outside the time window
 */
function cleanupRequests(state: RateLimitState, windowMs: number): void {
  const now = Date.now();
  state.requests = state.requests.filter((timestamp) => now - timestamp < windowMs);
}

/**
 * Check if a request is allowed under rate limiting
 */
export function checkRateLimit(config: RateLimitConfig): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  retryAfter: number | null;
} {
  const state = getState(config.key);
  const now = Date.now();

  // Check if currently blocked
  if (state.blocked && state.blockedUntil) {
    if (now < state.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: state.blockedUntil - now,
        retryAfter: Math.ceil((state.blockedUntil - now) / 1000),
      };
    }
    // Block period expired, reset
    state.blocked = false;
    state.blockedUntil = null;
  }

  // Clean up old requests
  cleanupRequests(state, config.windowMs);

  const remaining = config.maxRequests - state.requests.length;
  const oldestRequest = state.requests[0];
  const resetIn = oldestRequest ? config.windowMs - (now - oldestRequest) : config.windowMs;

  if (state.requests.length >= config.maxRequests) {
    // Rate limit exceeded - block for the remaining window time
    state.blocked = true;
    state.blockedUntil = now + resetIn;

    return {
      allowed: false,
      remaining: 0,
      resetIn,
      retryAfter: Math.ceil(resetIn / 1000),
    };
  }

  return {
    allowed: true,
    remaining,
    resetIn,
    retryAfter: null,
  };
}

/**
 * Record a request for rate limiting
 */
export function recordRequest(key: string): void {
  const state = getState(key);
  state.requests.push(Date.now());
}

/**
 * Rate limiter wrapper that throws on limit exceeded
 */
export async function withRateLimit<T>(
  config: RateLimitConfig,
  fn: () => Promise<T>
): Promise<T> {
  const check = checkRateLimit(config);

  if (!check.allowed) {
    const error = new Error(
      `Limite de requêtes atteinte. Réessayez dans ${check.retryAfter} secondes.`
    );
    (error as Error & { code: string; retryAfter: number }).code = 'RATE_LIMIT_EXCEEDED';
    (error as Error & { code: string; retryAfter: number }).retryAfter = check.retryAfter!;
    throw error;
  }

  // Record the request
  recordRequest(config.key);

  // Also record against global limit
  if (config.key !== 'global') {
    recordRequest('global');
  }

  return fn();
}

/**
 * Create a rate-limited version of a function
 */
export function createRateLimitedFunction<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  config: RateLimitConfig
): (...args: T) => Promise<R> {
  return async (...args: T) => {
    return withRateLimit(config, () => fn(...args));
  };
}

/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(key: string): {
  requests: number;
  blocked: boolean;
  blockedUntil: number | null;
} {
  const state = getState(key);
  return {
    requests: state.requests.length,
    blocked: state.blocked,
    blockedUntil: state.blockedUntil,
  };
}

/**
 * Reset rate limit for a key (useful for testing)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Reset all rate limits
 */
export function resetAllRateLimits(): void {
  rateLimitStore.clear();
}

// ===========================================
// React Hook for Rate Limit Status
// ===========================================

import { useState, useEffect, useCallback } from 'react';

export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  blocked: boolean;
}

export function useRateLimit(configKey: keyof typeof RATE_LIMIT_CONFIGS): RateLimitInfo & {
  checkAndRecord: () => boolean;
} {
  const config = RATE_LIMIT_CONFIGS[configKey];
  const [info, setInfo] = useState<RateLimitInfo>({
    allowed: true,
    remaining: config.maxRequests,
    resetIn: config.windowMs,
    blocked: false,
  });

  // Update status periodically
  useEffect(() => {
    const updateStatus = () => {
      const check = checkRateLimit(config);
      const status = getRateLimitStatus(config.key);

      setInfo({
        allowed: check.allowed,
        remaining: check.remaining,
        resetIn: check.resetIn,
        blocked: status.blocked,
      });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [config]);

  const checkAndRecord = useCallback(() => {
    const check = checkRateLimit(config);

    if (check.allowed) {
      recordRequest(config.key);
      recordRequest('global');
      return true;
    }

    return false;
  }, [config]);

  return {
    ...info,
    checkAndRecord,
  };
}
