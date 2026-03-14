import { cn, generateId, formatDuration, base64ToBlob, storage } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('handles undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });
});

describe('generateId', () => {
  it('generates a string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('formatDuration', () => {
  it('formats 0 ms as 0:00', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('formats seconds correctly', () => {
    expect(formatDuration(5000)).toBe('0:05');
    expect(formatDuration(30000)).toBe('0:30');
  });

  it('formats minutes correctly', () => {
    expect(formatDuration(60000)).toBe('1:00');
    expect(formatDuration(65000)).toBe('1:05');
  });
});

describe('base64ToBlob', () => {
  it('creates a Blob from base64 string', () => {
    const base64 = btoa('test content');
    const blob = base64ToBlob(base64, 'text/plain');

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/plain');
  });

  it('creates blob with correct size', () => {
    const content = 'hello world';
    const base64 = btoa(content);
    const blob = base64ToBlob(base64, 'text/plain');

    expect(blob.size).toBe(content.length);
  });
});

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sets and gets a value', () => {
    storage.set('test-key', { hello: 'world' });
    const result = storage.get<{ hello: string }>('test-key');

    expect(result).toEqual({ hello: 'world' });
  });

  it('returns null for missing key', () => {
    const result = storage.get('non-existent');
    expect(result).toBeFalsy();
  });

  it('removes a value', () => {
    storage.set('test-key', 'value');
    storage.remove('test-key');

    expect(storage.get('test-key')).toBeFalsy();
  });
});
