import { fileToBase64, isValidImageFile, isValidFileSize } from '@/services/ocr';

describe('isValidImageFile', () => {
  it('accepts JPEG files', () => {
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
    expect(isValidImageFile(file)).toBe(true);
  });

  it('accepts PNG files', () => {
    const file = new File([''], 'photo.png', { type: 'image/png' });
    expect(isValidImageFile(file)).toBe(true);
  });

  it('accepts WebP files', () => {
    const file = new File([''], 'photo.webp', { type: 'image/webp' });
    expect(isValidImageFile(file)).toBe(true);
  });

  it('rejects PDF files', () => {
    const file = new File([''], 'doc.pdf', { type: 'application/pdf' });
    expect(isValidImageFile(file)).toBe(false);
  });

  it('rejects text files', () => {
    const file = new File([''], 'doc.txt', { type: 'text/plain' });
    expect(isValidImageFile(file)).toBe(false);
  });
});

describe('isValidFileSize', () => {
  it('accepts files under 10MB', () => {
    const file = new File([new ArrayBuffer(1024 * 1024)], 'small.jpg', { type: 'image/jpeg' });
    expect(isValidFileSize(file)).toBe(true);
  });

  it('accepts files at exactly 10MB', () => {
    const file = new File([new ArrayBuffer(10 * 1024 * 1024)], 'max.jpg', { type: 'image/jpeg' });
    expect(isValidFileSize(file)).toBe(true);
  });

  it('accepts custom max size', () => {
    const file = new File([new ArrayBuffer(3 * 1024 * 1024)], 'medium.jpg', { type: 'image/jpeg' });
    expect(isValidFileSize(file, 5)).toBe(true);
  });
});

describe('fileToBase64', () => {
  it('converts a file to base64 string', async () => {
    const content = 'test image content';
    const file = new File([content], 'test.jpg', { type: 'image/jpeg' });

    const result = await fileToBase64(file);

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
