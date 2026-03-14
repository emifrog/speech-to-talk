import { textToSpeech, playAudioFromBase64, stopAllAudio } from '@/services/textToSpeech';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    functions: {
      invoke: jest.fn(),
    },
  })),
}));

// Mock sentry
jest.mock('@/lib/sentry', () => ({
  trackTextToSpeechError: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

// Mock retry to execute immediately without retries
jest.mock('@/lib/retry', () => ({
  retry: jest.fn(async (fn: () => Promise<unknown>) => fn()),
  defaultIsRetryable: jest.fn(() => false),
}));

// Mock rate limit
jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true }),
  recordRequest: jest.fn(),
  RATE_LIMIT_CONFIGS: { textToSpeech: { key: 'tts' }, global: { key: 'global' } },
}));

import { createClient } from '@/lib/supabase/client';
import { checkRateLimit } from '@/lib/rateLimit';

const mockSupabase = createClient as jest.MockedFunction<typeof createClient>;

describe('textToSpeech', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns audio content on success', async () => {
    const mockInvoke = jest.fn().mockResolvedValue({
      data: { audioContent: 'base64audio' },
      error: null,
    });

    (mockSupabase as jest.Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });

    const result = await textToSpeech({
      text: 'Bonjour',
      languageCode: 'fr',
    });

    expect(result.success).toBe(true);
    expect(result.data?.audioContent).toBe('base64audio');
  });

  it('returns error for unsupported language', async () => {
    const result = await textToSpeech({
      text: 'Hello',
      languageCode: 'xx' as never,
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('TTS_ERROR');
  });

  it('returns rate limit error when exceeded', async () => {
    (checkRateLimit as jest.Mock).mockReturnValueOnce({ allowed: false, retryAfter: 30 });

    const result = await textToSpeech({
      text: 'Bonjour',
      languageCode: 'fr',
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('handles API error', async () => {
    const mockInvoke = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Service unavailable' },
    });

    (mockSupabase as jest.Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });

    const result = await textToSpeech({
      text: 'Bonjour',
      languageCode: 'fr',
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('TTS_ERROR');
  });
});

describe('stopAllAudio', () => {
  it('calls speechSynthesis.cancel when available', () => {
    const mockCancel = jest.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      value: { cancel: mockCancel },
      writable: true,
      configurable: true,
    });

    stopAllAudio();

    expect(mockCancel).toHaveBeenCalled();
  });
});
