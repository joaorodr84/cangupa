import { useCallback, useEffect, useRef, useState } from 'react';

import { type LanguageSetting } from '../i18n/locale';
import { type ThemeMode } from '../theme/palette';
import { deviceStorage } from './deviceStorage';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from './settings';
import { type Storage } from './storage';

// The saved settings, loaded once and saved on each change. `settings` is
// null until the saved record has been read, so the board never flashes a
// theme or rule the player did not choose.
export function useSettings(storage: Storage = deviceStorage) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const latest = useRef<Settings>(DEFAULT_SETTINGS);
  // Set once the initial read succeeds. A rejected read leaves `latest` at
  // DEFAULT_SETTINGS so the app still opens, but a setting changed on top of
  // that fallback must not be saved over whatever was actually on disk.
  const readOk = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadSettings(storage)
      .then((loaded) => {
        if (!cancelled) {
          readOk.current = true;
          latest.current = loaded;
          setSettings(loaded);
        }
      })
      .catch(() => {
        if (!cancelled) {
          latest.current = DEFAULT_SETTINGS;
          setSettings(DEFAULT_SETTINGS);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const update = useCallback(
    (patch: Partial<Settings>) => {
      const next = { ...latest.current, ...patch };
      latest.current = next;
      setSettings(next);
      // A failed save keeps the choice for this session, as the web version's
      // best-effort localStorage write does.
      if (readOk.current) {
        saveSettings(storage, next).catch(() => undefined);
      }
    },
    [storage],
  );

  const setThemeMode = useCallback((themeMode: ThemeMode) => update({ themeMode }), [update]);
  const setJumps = useCallback((jumps: boolean) => update({ jumps }), [update]);
  const setHints = useCallback((hints: boolean) => update({ hints }), [update]);
  const setAnim = useCallback((anim: boolean) => update({ anim }), [update]);
  const setSound = useCallback((sound: boolean) => update({ sound }), [update]);
  const setLanguage = useCallback((language: LanguageSetting) => update({ language }), [update]);

  return { settings, setThemeMode, setJumps, setHints, setAnim, setSound, setLanguage };
}
