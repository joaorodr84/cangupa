// Ported from apps/web-classic/js/config.js's `Settings`. Rules live here so
// the UI never hard-codes them.
import { type Storage } from './storage';

export type Theme = 'cosmos' | 'space' | 'sand' | 'ice' | 'classic';

export const THEMES: readonly Theme[] = ['cosmos', 'space', 'sand', 'ice', 'classic'];

export interface Settings {
  readonly theme: Theme;
  // Rule option: allow jumping two tiles in a straight line.
  readonly jumps: boolean;
  // Highlight the tiles you can move to.
  readonly hints: boolean;
  readonly anim: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'cosmos',
  jumps: true,
  hints: true,
  anim: true,
};

export const SETTINGS_KEY = 'cangupa.settings';

// Reads a saved record. Anything that is not a JSON object is treated as the
// defaults, and each field falls back on its own when it is missing or the
// wrong type — e.g. a theme later renamed or removed — so a corrupt or
// outdated value can never stop the app from opening.
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
    const theme = THEMES.includes(record.theme as Theme) ? (record.theme as Theme) : DEFAULT_SETTINGS.theme;
    const jumps = typeof record.jumps === 'boolean' ? record.jumps : DEFAULT_SETTINGS.jumps;
    const hints = typeof record.hints === 'boolean' ? record.hints : DEFAULT_SETTINGS.hints;
    const anim = typeof record.anim === 'boolean' ? record.anim : DEFAULT_SETTINGS.anim;
    return { theme, jumps, hints, anim };
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
