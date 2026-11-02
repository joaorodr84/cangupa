import { resolveLocale } from './locale';

describe('resolveLocale', () => {
  it('returns a pinned language outright, ignoring the device', () => {
    expect(resolveLocale('pt', 'en-US')).toBe('pt');
    expect(resolveLocale('en', null)).toBe('en');
  });

  it.each([
    ['en-US', 'en'],
    ['pt-PT', 'pt'],
    ['pt-BR', 'pt'],
  ] as const)('follows the device: %s resolves to %s', (device, expected) => {
    expect(resolveLocale('system', device)).toBe(expected);
  });

  it('falls back to English for a device locale neither language covers', () => {
    expect(resolveLocale('system', 'ja-JP')).toBe('en');
    expect(resolveLocale('system', 'fr')).toBe('en');
  });

  it('falls back to English when the device reports nothing', () => {
    expect(resolveLocale('system', null)).toBe('en');
    expect(resolveLocale('system', undefined)).toBe('en');
  });
});
