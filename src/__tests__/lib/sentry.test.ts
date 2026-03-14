import { captureError, captureMessage, addBreadcrumb, setUser } from '@/lib/sentry';

describe('Sentry utilities', () => {
  it('captureError does not throw', () => {
    expect(() => {
      captureError(new Error('test error'), {
        tags: { service: 'test' },
        level: 'error',
      });
    }).not.toThrow();
  });

  it('captureMessage does not throw', () => {
    expect(() => {
      captureMessage('test message', 'info');
    }).not.toThrow();
  });

  it('addBreadcrumb does not throw', () => {
    expect(() => {
      addBreadcrumb({
        message: 'test breadcrumb',
        category: 'test',
        data: { key: 'value' },
      });
    }).not.toThrow();
  });

  it('setUser does not throw', () => {
    expect(() => {
      setUser('user-123', 'test@test.com');
    }).not.toThrow();
  });

  it('setUser with null clears user', () => {
    expect(() => {
      setUser(null);
    }).not.toThrow();
  });
});
