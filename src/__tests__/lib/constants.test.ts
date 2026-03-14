import { SUPPORTED_LANGUAGES, getLanguageByCode, EMERGENCY_CATEGORIES, AUDIO_CONFIG } from '@/lib/constants';

describe('SUPPORTED_LANGUAGES', () => {
  it('contains at least 6 languages', () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(6);
  });

  it('contains French', () => {
    const fr = SUPPORTED_LANGUAGES.find(l => l.code === 'fr');
    expect(fr).toBeDefined();
    expect(fr?.name).toBe('French');
  });

  it('each language has required fields', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(lang.code).toBeDefined();
      expect(lang.name).toBeDefined();
      expect(lang.flag).toBeDefined();
      expect(lang.googleCode).toBeDefined();
    }
  });
});

describe('getLanguageByCode', () => {
  it('returns language for valid code', () => {
    const lang = getLanguageByCode('fr');
    expect(lang).toBeDefined();
    expect(lang?.name).toBe('French');
  });

  it('returns language for English', () => {
    const lang = getLanguageByCode('en');
    expect(lang).toBeDefined();
    expect(lang?.name).toBe('English');
  });

  it('returns undefined for unknown code', () => {
    const lang = getLanguageByCode('xx' as never);
    expect(lang).toBeUndefined();
  });
});

describe('EMERGENCY_CATEGORIES', () => {
  it('contains expected categories', () => {
    const categoryIds = EMERGENCY_CATEGORIES.map(c => c.id);
    expect(categoryIds).toContain('medical');
    expect(categoryIds).toContain('fire');
    expect(categoryIds).toContain('reassurance');
    expect(categoryIds).toContain('evacuation');
    expect(categoryIds).toContain('general');
  });

  it('each category has required fields', () => {
    for (const cat of EMERGENCY_CATEGORIES) {
      expect(cat.id).toBeDefined();
      expect(cat.label).toBeDefined();
      expect(cat.icon).toBeDefined();
    }
  });
});

describe('AUDIO_CONFIG', () => {
  it('has sensible defaults', () => {
    expect(AUDIO_CONFIG.maxDuration).toBeGreaterThan(0);
    expect(AUDIO_CONFIG.sampleRate).toBeGreaterThanOrEqual(16000);
    expect(AUDIO_CONFIG.channelCount).toBe(1);
    expect(AUDIO_CONFIG.mimeType).toContain('audio/');
  });
});
