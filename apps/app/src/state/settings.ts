// Ported from apps/web-classic/js/config.js's `Settings`. Rules live here so
// the UI never hard-codes them.
import { type LanguageSetting, LOCALES } from '../i18n/locale';
import { type ThemeMode } from '../theme/palette';
import { type Storage } from './storage';

const THEME_MODES: readonly ThemeMode[] = ['system', 'light', 'dark'];

const LANGUAGE_SETTINGS: readonly LanguageSetting[] = ['system', ...LOCALES];

export interface Settings {
  // CANGUPA-40 replaced the five decorative skins (cosmos/space/sand/ice/
  // classic) with a plain light/dark/system choice, matching DigiSpin's own
  // appearance setting — 'system' follows the device the same way `language`
  // below does.
  readonly themeMode: ThemeMode;
  // Highlight the tiles you can move to.
  readonly hints: boolean;
  readonly anim: boolean;
  // Mutes the sound effects (CANGUPA-57) played through src/audio/sound.ts.
  readonly sound: boolean;
  // Rule option (CANGUPA-58, off by default): tapping the board where there
  // is no legal move falls instead of doing nothing.
  readonly fall: boolean;
  // The app's language (CANGUPA-38): 'system' follows the device's own
  // language, falling back to English for anything Cangupa doesn't ship
  // (see i18n/locale.ts's resolveLocale), or the player can pin one.
  readonly language: LanguageSetting;
}

export const DEFAULT_SETTINGS: Settings = {
  themeMode: 'system',
  hints: true,
  anim: true,
  sound: true,
  fall: false,
  language: 'system',
};

export const SETTINGS_KEY = 'cangupa.settings';

// Reads a saved record. Anything that is not a JSON object is treated as the
// defaults, and each field falls back on its own when it is missing or the
// wrong type — e.g. a theme later renamed or removed — so a corrupt or
// outdated value can never stop the app from opening. A record saved before
// CANGUPA-40 has a `theme` field (one of the five old skin names) and no
// `themeMode`, so it falls into that same missing-field case and resolves to
// the new default ('system') rather than needing an explicit migration; the
// rest of a pre-CANGUPA-40 record (hints/anim/language) still parses as
// before. A pre-CANGUPA-83 record's `jumps` field is simply ignored, the
// same way any other field this build doesn't know is (see below).
export function parseSettings(raw: string | null): Settings {
  if (raw === null) {
    return DEFAULT_SETTINGS;
  }
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) {
      return DEFAULT_SETTINGS;
    }
    const record = value as Record<string, unknown>;
    const themeMode = THEME_MODES.includes(record.themeMode as ThemeMode)
      ? (record.themeMode as ThemeMode)
      : DEFAULT_SETTINGS.themeMode;
    const hints = typeof record.hints === 'boolean' ? record.hints : DEFAULT_SETTINGS.hints;
    const anim = typeof record.anim === 'boolean' ? record.anim : DEFAULT_SETTINGS.anim;
    const sound = typeof record.sound === 'boolean' ? record.sound : DEFAULT_SETTINGS.sound;
    const fall = typeof record.fall === 'boolean' ? record.fall : DEFAULT_SETTINGS.fall;
    // A language this build does not know, such as one from a later
    // version, falls back to the default rather than leaving the app stuck
    // on a language it can no longer resolve.
    const language = LANGUAGE_SETTINGS.includes(record.language as LanguageSetting)
      ? (record.language as LanguageSetting)
      : DEFAULT_SETTINGS.language;
    return { themeMode, hints, anim, sound, fall, language };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function loadSettings(storage: Storage): Promise<Settings> {
  return parseSettings(await storage.getItem(SETTINGS_KEY));
}

export async function saveSettings(storage: Storage, settings: Settings): Promise<void> {
  await storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
