// The two languages Cangupa ships (CANGUPA-38): the app's original
// Portuguese, plus English.
export type Locale = 'en' | 'pt';

export const LOCALES: readonly Locale[] = ['en', 'pt'];

// The language setting, same shape as Theme (state/settings.ts): 'system'
// follows the device, or the player can pin one of the two from Settings.
export type LanguageSetting = 'system' | Locale;

// What the device reports its locale as, read once per render by
// useResolvedLocale (useLocale.ts) via Intl. A BCP 47 tag such as 'pt-BR' or
// 'en-US'; null/undefined when nothing can be read.
export type DeviceLocale = string | null | undefined;

// English is the default language: both the base language the game was
// translated from Portuguese into, and the fallback for a device locale
// neither of the two covers.
export const FALLBACK_LOCALE: Locale = 'en';

// Resolves the language setting and the device's reported locale into one of
// the two locales Cangupa ships, mirroring palette.ts's paletteFor: a pinned
// choice wins outright, 'system' reads the device's language subtag (the
// part before the first '-', so 'pt-BR' and 'pt-PT' both read as 'pt') and
// falls back to English when that subtag is missing or not one of the two.
export function resolveLocale(setting: LanguageSetting, device: DeviceLocale): Locale {
  if (setting !== 'system') {
    return setting;
  }
  const languageTag = device?.split('-')[0];
  const match = LOCALES.find((locale) => locale === languageTag);
  return match ?? FALLBACK_LOCALE;
}
