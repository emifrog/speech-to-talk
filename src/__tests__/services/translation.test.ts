import { translateText, createTranslationResult } from '@/services/translation';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    functions: {
      invoke: jest.fn(),
    },
  })),
}));

// Mock translation cache
jest.mock('@/services/translationCache', () => ({
  getCachedTranslation: jest.fn().mockResolvedValue({ success: false }),
  saveToCache: jest.fn().mockResolvedValue({ success: true }),
}));

import { createClient } from '@/lib/supabase/client';
import { getCachedTranslation, saveToCache } from '@/services/translationCache';

const mockSupabase = createClient as jest.MockedFunction<typeof createClient>;
const mockGetCached = getCachedTranslation as jest.MockedFunction<typeof getCachedTranslation>;

describe('translateText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns cached translation if available', async () => {
    mockGetCached.mockResolvedValueOnce({
      success: true,
      data: { translatedText: 'Bonjour' },
    });

    const result = await translateText({
      text: 'Hello',
      sourceLang: 'en',
      targetLang: 'fr',
    });

    expect(result.success).toBe(true);
    expect(result.data?.translatedText).toBe('Bonjour');
    expect(result.data?.fromCache).toBe(true);
  });

  it('calls API when cache miss', async () => {
    mockGetCached.mockResolvedValueOnce({ success: false });

    const mockInvoke = jest.fn().mockResolvedValue({
      data: { translatedText: 'Bonjour', detectedSourceLanguage: 'en' },
      error: null,
    });

    (mockSupabase as jest.Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });

    const result = await translateText({
      text: 'Hello',
      sourceLang: 'en',
      targetLang: 'fr',
    });

    expect(result.success).toBe(true);
    expect(result.data?.translatedText).toBe('Bonjour');
    expect(result.data?.fromCache).toBe(false);
    expect(mockInvoke).toHaveBeenCalledWith('translate', {
      body: { text: 'Hello', sourceLang: 'en', targetLang: 'fr' },
    });
  });

  it('saves translation to cache after API call', async () => {
    mockGetCached.mockResolvedValueOnce({ success: false });

    const mockInvoke = jest.fn().mockResolvedValue({
      data: { translatedText: 'Bonjour' },
      error: null,
    });

    (mockSupabase as jest.Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });

    await translateText({
      text: 'Hello',
      sourceLang: 'en',
      targetLang: 'fr',
    });

    expect(saveToCache).toHaveBeenCalledWith('Hello', 'Bonjour', 'en', 'fr');
  });

  it('skips cache when skipCache is true', async () => {
    mockGetCached.mockResolvedValueOnce({
      success: true,
      data: { translatedText: 'Cached' },
    });

    const mockInvoke = jest.fn().mockResolvedValue({
      data: { translatedText: 'Fresh' },
      error: null,
    });

    (mockSupabase as jest.Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });

    const result = await translateText({
      text: 'Hello',
      sourceLang: 'en',
      targetLang: 'fr',
      skipCache: true,
    });

    expect(result.data?.translatedText).toBe('Fresh');
    expect(mockInvoke).toHaveBeenCalled();
  });

  it('returns error on API failure', async () => {
    mockGetCached.mockResolvedValueOnce({ success: false });

    const mockInvoke = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'API Error' },
    });

    (mockSupabase as jest.Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });

    const result = await translateText({
      text: 'Hello',
      sourceLang: 'en',
      targetLang: 'fr',
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('TRANSLATION_ERROR');
  });

  it('validates input parameters', async () => {
    const result = await translateText({
      text: '',
      sourceLang: 'en',
      targetLang: 'fr',
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('VALIDATION_ERROR');
  });
});

describe('createTranslationResult', () => {
  it('creates a valid translation result', () => {
    const result = createTranslationResult(
      'Hello',
      'Bonjour',
      'en',
      'fr'
    );

    expect(result.sourceText).toBe('Hello');
    expect(result.translatedText).toBe('Bonjour');
    expect(result.sourceLang).toBe('en');
    expect(result.targetLang).toBe('fr');
    expect(result.id).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('generates unique IDs', () => {
    const result1 = createTranslationResult('Hello', 'Bonjour', 'en', 'fr');
    const result2 = createTranslationResult('Hello', 'Bonjour', 'en', 'fr');

    expect(result1.id).not.toBe(result2.id);
  });
});
