// ===========================================
// Retry Logic Utilities
// ===========================================

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in ms between retries (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in ms (default: 10000) */
  maxDelay?: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Whether to add jitter to delays (default: true) */
  jitter?: boolean;
  /** Function to determine if an error is retryable */
  isRetryable?: (error: unknown) => boolean;
  /** Callback called on each retry attempt */
  onRetry?: (attempt: number, error: unknown, delay: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: true,
  isRetryable: () => true,
  onRetry: () => {},
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
  jitter: boolean
): number {
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  const boundedDelay = Math.min(exponentialDelay, maxDelay);

  if (jitter) {
    // Add random jitter between 0-30% of the delay
    const jitterAmount = boundedDelay * 0.3 * Math.random();
    return Math.floor(boundedDelay + jitterAmount);
  }

  return Math.floor(boundedDelay);
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return true;
  }
  if (error instanceof Error) {
    const networkMessages = [
      'network',
      'timeout',
      'connection',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
    ];
    return networkMessages.some((msg) =>
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }
  return false;
}

/**
 * Check if an HTTP status code is retryable
 */
export function isRetryableStatus(status: number): boolean {
  // Retry on server errors and rate limiting
  return status >= 500 || status === 429 || status === 408;
}

/**
 * Default retryable error checker
 */
export function defaultIsRetryable(error: unknown): boolean {
  // Always retry network errors
  if (isNetworkError(error)) {
    return true;
  }

  // Check for HTTP response with retryable status
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return isRetryableStatus(status);
  }

  // Check for specific error messages
  if (error instanceof Error) {
    const retryableMessages = [
      'rate limit',
      'too many requests',
      'service unavailable',
      'gateway timeout',
    ];
    return retryableMessages.some((msg) =>
      error.message.toLowerCase().includes(msg)
    );
  }

  return false;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted attempts
      if (attempt > opts.maxRetries) {
        break;
      }

      // Check if the error is retryable
      if (!opts.isRetryable(error)) {
        throw error;
      }

      // Calculate delay
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier,
        opts.jitter
      );

      // Call onRetry callback
      opts.onRetry(attempt, error, delay);

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Create a retryable fetch function
 */
export function createRetryableFetch(options?: RetryOptions) {
  return async function retryableFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    return retry(
      async () => {
        const response = await fetch(input, init);

        // Throw on retryable HTTP errors
        if (!response.ok && isRetryableStatus(response.status)) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          (error as Error & { status: number }).status = response.status;
          throw error;
        }

        return response;
      },
      {
        isRetryable: defaultIsRetryable,
        ...options,
      }
    );
  };
}

/**
 * Retry wrapper for Supabase functions
 */
export async function retrySupabaseFunction<T>(
  invoke: () => Promise<{ data: T | null; error: Error | null }>,
  options?: RetryOptions
): Promise<{ data: T | null; error: Error | null }> {
  try {
    return await retry(
      async () => {
        const result = await invoke();

        // If there's an error and it's retryable, throw to trigger retry
        if (result.error) {
          const isRetryable = defaultIsRetryable(result.error);
          if (isRetryable) {
            throw result.error;
          }
        }

        return result;
      },
      {
        isRetryable: defaultIsRetryable,
        onRetry: (attempt, error, delay) => {
          console.warn(
            `Supabase function retry attempt ${attempt} after ${delay}ms:`,
            error
          );
        },
        ...options,
      }
    );
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Hook-friendly retry state manager
 */
export interface RetryState {
  attempt: number;
  isRetrying: boolean;
  lastError: Error | null;
  nextRetryIn: number | null;
}

export function createRetryState(): RetryState {
  return {
    attempt: 0,
    isRetrying: false,
    lastError: null,
    nextRetryIn: null,
  };
}
